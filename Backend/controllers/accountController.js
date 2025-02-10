// controllers/accountController.js
import jwt from 'jsonwebtoken';
import { Usuario, UsuarioPadreHijo } from '../models/index.js';
import logger from '../utils/logger.js';

export const accessParentAccount = async (req, res, next) => {
  try {
    const parentId = req.params.parentId;
    const childId = req.user.id_usuario;

    // Verificar relación válida
    const relation = await UsuarioPadreHijo.findOne({
      where: {
        id_padre: parentId,
        id_hijo: childId,
        estado_invitacion: 'Aceptada'
      }
    });

    if (!relation) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta cuenta o la invitación no ha sido aceptada.'
      });
    }
    const isProduction = process.env.NODE_ENV === 'production';
    // Obtener datos del padre
    const parent = await Usuario.findByPk(parentId, {
      attributes: ['id_usuario', 'nombre', 'apellido', 'email']
    });
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Cuenta padre no encontrada.'
      });
    }
    // Guardar el token actual (del hijo) en una cookie llamada "childToken"
    const childToken = req.cookies.token;
    res.cookie('childToken', childToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'None' : 'Lax',
        maxAge: 60 * 60 * 1000
    });

    // Generar token con el subrol de la relación (usamos "subRole" en el payload)
    const payload = {
      id_usuario: parent.id_usuario,
      nombre: parent.nombre,
      apellido: parent.apellido,
      email: parent.email,
      subRole: relation.subRol,  // Aquí se pone el subrol (por ejemplo, "Administrador")
      permitirSoporte: relation.permitirSoporte,
      childId: childId,
      accessAsParent: true
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'None' : 'Lax',
      maxAge: 60 * 60 * 1000
    });

    logger.info(`Usuario hijo (ID: ${childId}) accedió a la cuenta del padre (ID: ${parentId}).`);

    return res.status(200).json({
      success: true,
      message: 'Acceso a la cuenta padre concedido.',
      token: accessToken
    });
  } catch (error) {
    logger.error(`Error al acceder a la cuenta padre: ${error.message}`);
    next(error);
  }
};


export const switchBackToChild = async (req, res, next) => {
    try {
      const childToken = req.cookies.childToken;
      if (!childToken) {
        return res.status(400).json({
          success: false,
          message: 'No se encontró el token de la cuenta hija.'
        });
      }
  
      // (Opcional) Puedes verificar o decodificar el childToken aquí para mayor seguridad
  
      const isProduction = process.env.NODE_ENV === 'production';
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'None' : 'Lax',
        maxAge: 60 * 60 * 1000, // 1 hora
      };
  
      // Asigna el token del hijo a la cookie "token"
      res.cookie('token', childToken, cookieOptions);
      // Limpia la cookie auxiliar
      res.clearCookie('childToken');
  
      logger.info(`Cambiado a la cuenta hija.`);
      return res.status(200).json({
        success: true,
        message: 'Has vuelto a tu cuenta original.',
        token: childToken
      });
    } catch (error) {
      logger.error(`Error al cambiar a la cuenta hija: ${error.message}`);
      next(error);
    }
  };