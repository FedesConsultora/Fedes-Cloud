// controllers/userCompositeController.js
import { Usuario, Rol } from '../models/index.js';
import { PermissionDeniedError, ValidationError } from '../utils/errors/GeneralErrors.js';
import { Op } from 'sequelize';
import logger from '../utils/logger.js';
import { sendEmail } from '../utils/emailService.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

export const inviteUser = async (req, res, next) => {
  try {
    const { email, subRol, permitirSoporte, clientURI } = req.body;
    const invitante = req.user;
    const invitanteId = invitante.id_usuario;

    // Verificar permisos
    if (!invitante.permisos.includes('manage_users')) {
      throw new PermissionDeniedError('No tienes permiso para invitar usuarios.');
    }
    if (!email) {
      throw new ValidationError([{ msg: 'El email es obligatorio.', param: 'email', location: 'body' }]);
    }

    // Obtener dinámicamente el rol "Externo"
    const externalRole = await Rol.findOne({ where: { nombre: 'Externo' } });
    if (!externalRole) {
      throw new ValidationError("No se encontró el rol 'Externo' en el sistema.");
    }
    const ROL_EXTERNO_ID = externalRole.id_rol;

    // Generar token de invitación y su expiración (24 horas)
    const invitationToken = crypto.randomBytes(32).toString('hex');
    const invitationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Construir el link de invitación
    const invitationLink = `${clientURI}/invite/accept?token=${invitationToken}&email=${encodeURIComponent(email)}`;

    // Obtener nombre completo del invitante
    const invitanteNombre = `${invitante.nombre} ${invitante.apellido}`;

    let usuarioInvitado = await Usuario.findOne({ where: { email } });
    if (usuarioInvitado) {
      // Caso: El usuario ya existe.
      // En este caso, se enviará un email preguntándole si desea vincular su cuenta existente como subusuario.
      usuarioInvitado.id_usuario_padre = invitanteId;
      usuarioInvitado.subRol = subRol;
      usuarioInvitado.id_rol = ROL_EXTERNO_ID;
      usuarioInvitado.invitationToken = invitationToken;
      usuarioInvitado.invitationTokenExpires = invitationTokenExpires;
      await usuarioInvitado.save();

      await sendEmail({
        to: email,
        subject: 'Invitación a vincular tu cuenta a Fedes Cloud',
        template: 'inviteUserExisting', // Plantilla para usuario ya existente
        context: {
          invitanteNombre,
          email,
          invitationLink,
        },
      });
    } else {
      // Caso: El usuario no existe, se crea una cuenta mínima.
      const passwordTemporal = crypto.randomBytes(8).toString('hex');
      const hashedPassword = await bcrypt.hash(passwordTemporal, 10);

      usuarioInvitado = await Usuario.create({
        nombre: 'Pendiente',
        apellido: 'Pendiente',
        email,
        password: hashedPassword,
        fechaNacimiento: '2000-01-01', // Valor dummy
        id_rol: ROL_EXTERNO_ID,
        id_estado: 1,
        preferenciasNotificaciones: true,
        id_autenticacion: 1,
        id_usuario_padre: invitanteId,
        subRol,
        invitationToken,
        invitationTokenExpires,
      });

      await sendEmail({
        to: email,
        subject: 'Invitación a unirte a Fedes Cloud',
        template: 'inviteUserNew', // Plantilla para usuario nuevo
        context: {
          invitanteNombre,
          email,
          passwordTemporal,
          subRol,
          invitationLink,
          managementLink: `${clientURI}/help/gestion`, // Opcional
        },
      });
    }

    logger.info(`Invitación enviada a ${email} para que se una como subusuario del usuario ID ${invitanteId}`);
    res.status(200).json({
      success: true,
      message: 'Invitación enviada exitosamente.',
      data: { email, subRol, permitirSoporte },
    });
  } catch (error) {
    next(error);
  }
};

export const unlinkSubUser = async (req, res, next) => {
    try {
      const { id } = req.params; // ID del subusuario a desvincular
      const parentId = req.user.id_usuario; // ID del usuario autenticado (invitante)
  
      // Buscar el subusuario por su ID
      const subUser = await Usuario.findByPk(id);
      if (!subUser) {
        throw new ValidationError([{ msg: 'El subusuario no existe.', param: 'id', location: 'params' }]);
      }
  
      // Verificar que el subusuario esté vinculado al usuario autenticado
      if (subUser.id_usuario_padre !== parentId) {
        throw new PermissionDeniedError('No tienes permiso para desvincular a este usuario.');
      }
  
      // Actualizar el subusuario para eliminar la asociación: establecer id_usuario_padre a null
      // y opcionalmente resetear el subRol a "No configurado"
      await subUser.update({
        id_usuario_padre: null,
        subRol: 'No configurado'
      });
  
      logger.info(`Subusuario (ID: ${id}) desvinculado exitosamente del usuario padre (ID: ${parentId}).`);
  
      res.status(200).json({
        success: true,
        message: 'Subusuario desvinculado exitosamente.',
      });
    } catch (error) {
      logger.error(`Error al desvincular subusuario: ${error.message}`);
      next(error);
    }
  };

  export const getSubUsers = async (req, res, next) => {
    try {
      // Obtener el ID del usuario autenticado (invitante)
      const parentId = req.user.id_usuario;
      // Buscar en el modelo Usuario todos los subusuarios que tengan este id_usuario_padre
      const subUsers = await Usuario.findAll({
        where: { id_usuario_padre: parentId },
        // Puedes incluir atributos adicionales o asociaciones si lo requieres
      });
  
      res.status(200).json({
        success: true,
        message: 'Subusuarios obtenidos exitosamente.',
        data: subUsers,
      });
    } catch (error) {
      logger.error(`Error al obtener subusuarios: ${error.message}`);
      next(error);
    }
  };

  /**
 * Endpoint para verificar si un email ya existe en el sistema.
 * Se espera recibir el email en el query string.
 * Responde con { success: true, exists: true/false }
 */
export const checkEmail = async (req, res, next) => {
    try {
      const { email } = req.query;
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'El email es obligatorio',
          exists: false,
        });
      }
      const user = await Usuario.findOne({ where: { email } });
      return res.status(200).json({
        success: true,
        exists: !!user,
      });
    } catch (error) {
      logger.error(`Error al verificar email: ${error.message}`);
      next(error);
    }
  };
  

  // GET /user-composite/invite/accept?token=...&email=...
export const getInvitationDetails = async (req, res, next) => {
    try {
      const { token, email } = req.query;
      if (!token || !email) {
        return res.status(400).json({ success: false, message: 'Token y email son obligatorios.' });
      }
      const user = await Usuario.findOne({ where: { email, invitationToken: token } });
      if (!user) {
        return res.status(404).json({ success: false, message: 'Invitación no encontrada.' });
      }
      if (new Date() > user.invitationTokenExpires) {
        return res.status(400).json({ success: false, message: 'La invitación ha expirado.' });
      }
      // Se asume que el usuario nuevo se creó con datos mínimos (nombre y apellido "Pendiente")
      const isNewAccount = user.nombre === 'Pendiente' && user.apellido === 'Pendiente';
      return res.status(200).json({
        success: true,
        data: {
          email: user.email,
          subRol: user.subRol,
          isNewAccount,
        },
      });
    } catch (error) {
      logger.error(`Error al obtener detalles de invitación: ${error.message}`);
      next(error);
    }
  };
  
  export const acceptInvitation = async (req, res, next) => {
    try {
      const { token, email, newPassword, nombre, apellido, fechaNacimiento } = req.body;
      
      // Validar que token y email estén presentes
      if (!token || !email) {
        return res.status(400).json({ success: false, message: 'Token y email son obligatorios.' });
      }
      
      // Buscar el usuario invitado con ese email y token
      const user = await Usuario.findOne({ where: { email, invitationToken: token } });
      if (!user) {
        return res.status(404).json({ success: false, message: 'Invitación no encontrada.' });
      }
      
      // Validar si el token expiró
      if (new Date() > user.invitationTokenExpires) {
        return res.status(400).json({ success: false, message: 'La invitación ha expirado.' });
      }
      
      // Si la cuenta es nueva (nombre y apellido "Pendiente")
      const isNewAccount = user.nombre === 'Pendiente' && user.apellido === 'Pendiente';
      if (isNewAccount) {
        // Requerir datos obligatorios: newPassword, nombre, apellido y fechaNacimiento
        if (!newPassword || !nombre || !apellido || !fechaNacimiento) {
          return res.status(400).json({ 
            success: false, 
            message: 'Para aceptar la invitación, debes actualizar tu nombre, apellido, fecha de nacimiento y contraseña.' 
          });
        }
        
        // Encriptar la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Actualizar el usuario con los nuevos datos y establecer emailConfirmed en true
        await user.update({
          nombre,
          apellido,
          fechaNacimiento, // Se espera que el frontend envíe una fecha en formato aceptable (por ejemplo, YYYY-MM-DD)
          password: hashedPassword,
          emailConfirmed: true,  // Confirmamos automáticamente el email
          invitationToken: null,
          invitationTokenExpires: null,
        });
        
        return res.status(200).json({ 
          success: true, 
          message: 'Cuenta actualizada y invitación aceptada. Tu cuenta ha sido confirmada.' 
        });
      } else {
        // Si la cuenta ya existe, simplemente se limpia el token y se confirma la invitación
        await user.update({
          invitationToken: null,
          invitationTokenExpires: null,
          emailConfirmed: true, // Confirmamos automáticamente el email
        });
        
        return res.status(200).json({ 
          success: true, 
          message: 'Invitación aceptada. Por favor, inicia sesión para vincular tu cuenta.' 
        });
      }
    } catch (error) {
      logger.error(`Error al aceptar la invitación: ${error.message}`);
      next(error);
    }
  };

/**
 * GET /user-composite/parents
 * Retorna la(s) cuenta(s) padre asociada(s) al usuario autenticado.
 * En nuestro modelo, se asume que el usuario solo tiene un padre.
 */
export const getParentAccounts = async (req, res, next) => {
    try {
      // El usuario autenticado
      const currentUser = req.user;
      if (!currentUser) {
        return res.status(401).json({ success: false, message: 'No autenticado' });
      }
      if (!currentUser.id_usuario_padre) {
        return res.status(200).json({ success: true, data: [] });
      }
      const parentAccount = await Usuario.findByPk(currentUser.id_usuario_padre, {
        attributes: ['id_usuario', 'nombre', 'apellido', 'email']
      });
      return res.status(200).json({ success: true, data: parentAccount ? [parentAccount] : [] });
    } catch (error) {
      logger.error(`Error al obtener cuenta(s) padre: ${error.message}`);
      next(error);
    }
  };

  export const getPendingInvitations = async (req, res, next) => {
    try {
      // Suponemos que las invitaciones pendientes se definen como:
      // registros en Usuario donde el email coincide con el del usuario autenticado,
      // invitationToken es distinto de null y id_usuario_padre sigue sin asignarse.
      const pendingInvitations = await Usuario.findAll({
        where: {
          email: req.user.email,
          invitationToken: { [Op.ne]: null },
          id_usuario_padre: null,
        },
        attributes: ['id_usuario', 'email', 'subRol']
      });
      res.status(200).json({
        success: true,
        data: pendingInvitations
      });
    } catch (error) {
      logger.error(`Error al obtener invitaciones pendientes: ${error.message}`);
      next(error);
    }
  };