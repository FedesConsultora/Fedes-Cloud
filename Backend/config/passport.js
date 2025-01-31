// src/config/passport.js

import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from 'bcrypt';
import { Usuario, Rol } from '../models/index.js';
import jwt from 'jsonwebtoken';
import GoDaddyService from '../services/godaddyService.js'; // Importa el servicio de GoDaddy

// Instancia del servicio de GoDaddy
const godaddyService = new GoDaddyService();

// Función para generar JWT (reutiliza tu lógica actual)
export function generateJWT(user) {
  const token = jwt.sign(
    {
      id_usuario: user.id_usuario,
      nombre: user.nombre,
      id_rol: user.id_rol,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  return token;
}

// Función para crear o encontrar usuario de Google
async function findOrCreateGoogleUser(email, nombre, apellido, googleId, transaction) {
  // Buscar usuario con el mismo email
  let user = await Usuario.findOne({ where: { email }, transaction });
  
  if (user) {
    // Si el usuario ya tiene un googleId, retornar
    if (user.googleId) {
      return user;
    } else {
      // Asociar googleId al usuario existente
      user.googleId = googleId;
      await user.save({ transaction });
      
      // Si el rol es Externo y no tiene shopperId, asignarlo
      const role = await Rol.findByPk(user.id_rol, { transaction });
      if (role.nombre === 'Externo' && !user.shopperId) {
        const shopperData = {
          email,
          externalId: user.id_usuario.toString(),
          marketId: 'en-US', // Ajusta según tu mercado objetivo
          nameFirst: nombre,
          nameLast: apellido,
          password: generateSecurePassword(),
        };
  
        const createShopperResponse = await godaddyService.createShopper(shopperData);
        const { shopperId } = createShopperResponse;
  
        user.shopperId = shopperId;
        await user.save({ transaction });
      }
      
      return user;
    }
  } else {
    // Crear un nuevo usuario
    const defaultRole = await Rol.findOne({ where: { nombre: 'Externo' }, transaction });
    if (!defaultRole) {
      throw new Error('Rol predeterminado no configurado');
    }

    const emailConfirmed = true; // Asumimos que el email ya está confirmado vía Google

    user = await Usuario.create({
      nombre,
      apellido,
      email,
      password: null, // No se requiere password para cuentas de Google
      fechaNacimiento: null, // Opcional, puedes ajustar según tu flujo
      id_rol: defaultRole.id_rol,
      id_estado: 1,
      preferenciasNotificaciones: true,
      id_autenticacion: 2, // Asumimos que '2' es para Google, ajusta según tu esquema
      emailConfirmed,
      googleId,
    }, { transaction });

    // Crear la subcuenta de shopper en GoDaddy
    const shopperData = {
      email,
      externalId: user.id_usuario.toString(),
      marketId: 'en-US', // Ajusta según tu mercado objetivo
      nameFirst: nombre,
      nameLast: apellido,
      password: generateSecurePassword(),
    };

    const createShopperResponse = await godaddyService.createShopper(shopperData);
    const { shopperId } = createShopperResponse;

    // Asignar el shopperId al usuario
    user.shopperId = shopperId;
    await user.save({ transaction });

    return user;
  }
}

/**
 * Función para generar una contraseña segura para el shopper.
 */
const generateSecurePassword = () => {
  return crypto.randomBytes(16).toString('hex'); // Genera una contraseña de 32 caracteres hexadecimales
};

// Estrategia Local
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await Usuario.findOne({ where: { email, id_autenticacion: 1 } }); // Local id_autenticacion = 1
    if (!user) {
      return done(null, false, { message: 'Credenciales inválidas' });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return done(null, false, { message: 'Credenciales inválidas' });
    }
    if (!user.emailConfirmed) {
      return done(null, false, { message: 'Confirma tu correo electrónico antes de iniciar sesión.' });
    }
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// Estrategia Google
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/auth/google/callback',
  passReqToCallback: true,
}, async (req, accessToken, refreshToken, profile, done) => {
  const transaction = await Usuario.sequelize.transaction();
  try {
    const email = profile.emails[0].value;
    const nombre = profile.name.givenName || 'SinNombre';
    const apellido = profile.name.familyName || 'SinApellido';
    const googleId = profile.id;

    const user = await findOrCreateGoogleUser(email, nombre, apellido, googleId, transaction);

    await transaction.commit();
    done(null, user);
  } catch (error) {
    await transaction.rollback();
    done(error, null);
  }
}));

export default passport;