// controllers/userCompositeController.js
import { Usuario, Rol, UsuarioPadreHijo } from '../models/index.js';
import { PermissionDeniedError, ValidationError } from '../utils/errors/GeneralErrors.js';
import logger from '../utils/logger.js';
import { sendEmail } from '../utils/emailService.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

/**
 * Invitar a un usuario a vincularse (crear o usar cuenta existente) y registrar la relación en la tabla intermedia.
 */
export const inviteUser = async (req, res, next) => {
  try {
    const { email, subRol, permitirSoporte, clientURI } = req.body;
    const parent = req.user;
    const parentId = parent.id_usuario;

    // Verificar permisos del usuario que invita
    if (!parent.permisos.includes('manage_users')) {
      throw new PermissionDeniedError('No tienes permiso para invitar usuarios.');
    }
    if (!email) {
      throw new ValidationError([{ msg: 'El email es obligatorio.', param: 'email', location: 'body' }]);
    }

    // Obtener el rol "Externo" dinámicamente
    const externalRole = await Rol.findOne({ where: { nombre: 'Externo' } });
    if (!externalRole) {
      throw new ValidationError("No se encontró el rol 'Externo' en el sistema.");
    }
    const ROL_EXTERNO_ID = externalRole.id_rol;

    // Generar token de invitación y fecha de expiración (24 horas)
    const invitationToken = crypto.randomBytes(32).toString('hex');
    const invitationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Construir el link de invitación, incluyendo el id del padre (parent)
    const invitationLink = `${clientURI}/invite/accept?token=${invitationToken}&email=${encodeURIComponent(email)}&parent=${parentId}`;

    // Obtener nombre completo del invitante
    const invitanteNombre = `${parent.nombre} ${parent.apellido}`;

    // Buscar si el usuario invitado existe
    let invitedUser = await Usuario.findOne({ where: { email } });
    if (invitedUser) {
      // Si ya existe, actualizamos su token (para la invitación) y seguimos
      await invitedUser.update({ invitationToken, invitationTokenExpires });
      // Enviar email para vincular la cuenta existente
      await sendEmail({
        to: email,
        subject: 'Invitación a vincular tu cuenta a Fedes Cloud',
        template: 'inviteUserExisting',
        context: { invitanteNombre, email, invitationLink },
      });
    } else {
      // Si no existe, se crea una cuenta mínima
      const passwordTemporal = crypto.randomBytes(8).toString('hex');
      const hashedPassword = await bcrypt.hash(passwordTemporal, 10);
      invitedUser = await Usuario.create({
        nombre: 'Pendiente',
        apellido: 'Pendiente',
        email,
        password: hashedPassword,
        fechaNacimiento: '2000-01-01', // Valor dummy
        id_rol: ROL_EXTERNO_ID,
        id_estado: 1, // Se crea el usuario activo en la tabla, pero su relación se maneja por la tabla intermedia
        preferenciasNotificaciones: true,
        id_autenticacion: 1,
        invitationToken,
        invitationTokenExpires,
      });
      // Enviar email para la nueva cuenta
      await sendEmail({
        to: email,
        subject: 'Invitación a unirte a Fedes Cloud',
        template: 'inviteUserNew',
        context: {
          invitanteNombre,
          email,
          passwordTemporal,
          subRol,
          invitationLink,
          managementLink: `${clientURI}/help/gestion`,
        },
      });
    }

    // Registrar (o actualizar) la relación en la tabla intermedia UsuarioPadreHijo
    const [relation, created] = await UsuarioPadreHijo.findOrCreate({
      where: { id_padre: parentId, id_hijo: invitedUser.id_usuario },
      defaults: { subRol, permitirSoporte, estado_invitacion: 'Pendiente', accepted: false }
    });
    if (!created) {
      // Si ya existe, actualizamos los valores (reiniciando el estado a "Pendiente")
      await relation.update({ subRol, permitirSoporte, estado_invitacion: 'Pendiente', accepted: false });
    }

    logger.info(`Invitación enviada a ${email} para que se una como subusuario del usuario ID ${parentId}`);
    res.status(200).json({
      success: true,
      message: 'Invitación enviada exitosamente.',
      data: { email, subRol, permitirSoporte },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Desvincular a un subusuario eliminando la relación en la tabla intermedia.
 */
export const unlinkSubUser = async (req, res, next) => {
  try {
    const { id } = req.params; // id del usuario hijo
    const parentId = req.user.id_usuario;
    // Buscar la relación en la tabla intermedia
    const relation = await UsuarioPadreHijo.findOne({
      where: { id_padre: parentId, id_hijo: id },
    });
    if (!relation) {
      throw new ValidationError([{ msg: 'La relación padre-hijo no existe.', param: 'id', location: 'params' }]);
    }
    await relation.destroy();
    logger.info(`Relación (padre: ${parentId}, hijo: ${id}) eliminada exitosamente.`);
    res.status(200).json({ success: true, message: 'Relación eliminada exitosamente.' });
  } catch (error) {
    logger.error(`Error al eliminar la relación: ${error.message}`);
    next(error);
  }
};

/**
 * Obtener los subusuarios (hijos) vinculados a la cuenta del usuario autenticado (padre)
 * utilizando el modelo intermedio UsuarioPadreHijo para incluir los campos de la relación.
 */
export const getSubUsers = async (req, res, next) => {
  try {
    const parentId = req.user.id_usuario;
    // Consultar la tabla intermedia para obtener todas las relaciones en las que el usuario es padre
    const relations = await UsuarioPadreHijo.findAll({
      where: { id_padre: parentId },
      include: [
        {
          model: Usuario,
          as: 'hijo',
          attributes: ['id_usuario', 'nombre', 'apellido', 'email', 'id_estado'],
        },
      ],
    });

    // Mapear cada relación para combinar los datos del hijo con los datos de la relación
    const subUsers = relations.map((rel) => {
      const hijoData = rel.hijo.toJSON();
      return {
        ...hijoData,
        subRol: rel.subRol, 
        permitirSoporte: rel.permitirSoporte,
        estado_invitacion: rel.estado_invitacion // Incluimos el estado de la invitación
      };
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
 * Endpoint para editar el subrol y la opción de permitir soporte de un subusuario.
 * Solo la cuenta padre que invitó puede editar la relación.
 * URL: PUT /user-composite/edit/:id
 */
export const editSubUser = async (req, res, next) => {
  try {
    const { id } = req.params; // id del usuario hijo a editar
    const { subRol, permitirSoporte } = req.body;
    const parentId = req.user.id_usuario;
    // Buscar la relación en la tabla intermedia
    const relation = await UsuarioPadreHijo.findOne({
      where: { id_padre: parentId, id_hijo: id },
    });
    if (!relation) {
      return res.status(404).json({ success: false, message: 'Relación padre-hijo no encontrada.' });
    }
    await relation.update({ subRol, permitirSoporte });
    logger.info(`Relación (padre: ${parentId}, hijo: ${id}) actualizada correctamente.`);
    res.status(200).json({
      success: true,
      message: 'Subusuario actualizado correctamente.',
      data: relation,
    });
  } catch (error) {
    logger.error(`Error al editar la relación: ${error.message}`);
    next(error);
  }
};

/**
 * Endpoint para verificar si un email ya existe en el sistema.
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
    return res.status(200).json({ success: true, exists: !!user });
  } catch (error) {
    logger.error(`Error al verificar email: ${error.message}`);
    next(error);
  }
};

/**
 * Obtener detalles de una invitación (usada al acceder al link de invitación)
 */
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
    // Se asume que el usuario nuevo se creó con datos mínimos ("Pendiente")
    const isNewAccount = user.nombre === 'Pendiente' && user.apellido === 'Pendiente';
    return res.status(200).json({
      success: true,
      data: { email: user.email, subRol: user.subRol, isNewAccount },
    });
  } catch (error) {
    logger.error(`Error al obtener detalles de invitación: ${error.message}`);
    next(error);
  }
};

/**
 * Endpoint para aceptar una invitación.
 */
export const acceptInvitation = async (req, res, next) => {
  try {
    const { token, email, newPassword, nombre, apellido, fechaNacimiento } = req.body;
    // Extraer el id del padre del query string
    const parentId = req.query.parent;
    console.log('PARENTID:', parentId);
    
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
    
    const isNewAccount = user.nombre === 'Pendiente' && user.apellido === 'Pendiente';
    if (isNewAccount) {
      if (!newPassword || !nombre || !apellido || !fechaNacimiento) {
        return res.status(400).json({ 
          success: false, 
          message: 'Para aceptar la invitación, debes actualizar tu nombre, apellido, fecha de nacimiento y contraseña.' 
        });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await user.update({
        nombre,
        apellido,
        fechaNacimiento,
        password: hashedPassword,
        emailConfirmed: true,
        invitationToken: null,
        invitationTokenExpires: null,
      });
    } else {
      // Si el usuario ya existe, simplemente se limpia el token y se confirma el email
      await user.update({
        invitationToken: null,
        invitationTokenExpires: null,
        emailConfirmed: true,
      });
    }
    
    // Actualizar la relación en la tabla intermedia para marcar la invitación como "Aceptada"
    const [affectedRows] = await UsuarioPadreHijo.update(
      { estado_invitacion: 'Aceptada', accepted: true },
      { where: { id_hijo: user.id_usuario, id_padre: parentId, estado_invitacion: 'Pendiente' } }
    );
    console.log('Filas actualizadas:', affectedRows);
    
    return res.status(200).json({ 
      success: true, 
      message: isNewAccount 
        ? 'Cuenta actualizada y invitación aceptada. Tu cuenta ha sido confirmada.' 
        : 'Invitación aceptada. Por favor, inicia sesión para vincular tu cuenta.' 
    });
  } catch (error) {
    logger.error(`Error al aceptar la invitación: ${error.message}`);
    next(error);
  }
};

/**
 * Obtener las cuentas padre a las que está vinculado el usuario autenticado.
 * Utiliza la asociación many-to-many definida (alias "padres").
 */
export const getParentAccounts = async (req, res, next) => {
  try {
    const childId = req.user.id_usuario;
    const child = await Usuario.findByPk(childId, {
      include: [{
        model: Usuario,
        as: 'padres',
        through: { attributes: ['subRol', 'permitirSoporte', 'estado_invitacion'] },
        attributes: ['id_usuario', 'nombre', 'apellido', 'email'],
      }],
    });
    res.status(200).json({ success: true, data: child.padres });
  } catch (error) {
    logger.error(`Error al obtener cuentas padre: ${error.message}`);
    next(error);
  }
};

/**
 * Obtener invitaciones pendientes.
 * (Este endpoint se deja casi igual; puede requerir ajustes según el flujo de invitaciones.)
 */
export const getPendingInvitations = async (req, res, next) => {
  try {
    const pendingInvitations = await UsuarioPadreHijo.findAll({
      where: {
        id_hijo: req.user.id_usuario,
        estado_invitacion: 'Pendiente'
      },
      include: [{
        model: Usuario,
        as: 'padre',
        attributes: ['id_usuario', 'nombre', 'apellido', 'email']
      }]
    });
    res.status(200).json({ success: true, data: pendingInvitations });
  } catch (error) {
    logger.error(`Error al obtener invitaciones pendientes: ${error.message}`);
    next(error);
  }
};
