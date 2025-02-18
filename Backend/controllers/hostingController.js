// controllers/hostingController.js
import { Hosting } from '../models/index.js';
import logger from '../utils/logger.js';

/**
 * Crea un nuevo Hosting.
 * Se espera recibir en el body los datos necesarios:
 * - id_usuario, tipoHosting, planName, planDetails, dominio, etc.
 */
export const createHosting = async (req, res, next) => {
  try {
    const {
      id_usuario,
      id_orden,
      tipoHosting,
      planName,
      planDetails,
      dominio,
      externalReference,
      controlPanelUrl,
      usuarioControlPanel,
      passwordControlPanel,
      fechaInicio,
      fechaExpiracion,
      observaciones,
      // estadoHostingId se asigna por defecto (ej: 1 para "Pendiente")
    } = req.body;

    // Puedes agregar validaciones adicionales aquí

    const newHosting = await Hosting.create({
      id_usuario,
      id_orden: id_orden || null,
      tipoHosting,
      planName,
      planDetails,
      dominio,
      externalReference,
      controlPanelUrl,
      usuarioControlPanel,
      passwordControlPanel,
      fechaInicio,
      fechaExpiracion,
      observaciones,
      estadoHostingId: req.body.estadoHostingId || 1, // Por defecto, "Pendiente"
    });

    res.status(201).json({ success: true, data: newHosting });
  } catch (error) {
    logger.error(`Error creando Hosting: ${error.message}`);
    next(error);
  }
};

/**
 * Obtiene todos los hostings de un usuario.
 */
export const getHostingsByUser = async (req, res, next) => {
  try {
    const { id_usuario } = req.params; // O, si está en el token, req.user.id_usuario
    const hostings = await Hosting.findAll({
      where: { id_usuario },
      // Puedes incluir relaciones, por ejemplo con EstadoHosting:
      include: [{ association: 'estadoHosting' }],
    });
    res.status(200).json({ success: true, data: hostings });
  } catch (error) {
    logger.error(`Error obteniendo Hostings: ${error.message}`);
    next(error);
  }
};

/**
 * Obtiene un Hosting por su ID.
 */
export const getHostingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const hosting = await Hosting.findByPk(id, {
      include: [{ association: 'estadoHosting' }],
    });
    if (!hosting) {
      return res.status(404).json({ success: false, message: 'Hosting no encontrado.' });
    }
    res.status(200).json({ success: true, data: hosting });
  } catch (error) {
    logger.error(`Error obteniendo Hosting: ${error.message}`);
    next(error);
  }
};

/**
 * Actualiza un Hosting.
 */
export const updateHosting = async (req, res, next) => {
  try {
    const { id } = req.params;
    const hosting = await Hosting.findByPk(id);
    if (!hosting) {
      return res.status(404).json({ success: false, message: 'Hosting no encontrado.' });
    }
    // Actualizar campos según lo recibido en el body
    await hosting.update(req.body);
    res.status(200).json({ success: true, data: hosting });
  } catch (error) {
    logger.error(`Error actualizando Hosting: ${error.message}`);
    next(error);
  }
};

/**
 * Elimina un Hosting.
 */
export const deleteHosting = async (req, res, next) => {
  try {
    const { id } = req.params;
    const hosting = await Hosting.findByPk(id);
    if (!hosting) {
      return res.status(404).json({ success: false, message: 'Hosting no encontrado.' });
    }
    await hosting.destroy();
    res.status(200).json({ success: true, message: 'Hosting eliminado exitosamente.' });
  } catch (error) {
    logger.error(`Error eliminando Hosting: ${error.message}`);
    next(error);
  }
};
