// src/config/passport.js

import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from 'bcrypt';
import { Usuario, Rol } from '../models/index.js';
import jwt from 'jsonwebtoken';

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
async function findOrCreateGoogleUser(email, nombre, apellido) {
  // id_autenticacion = 2 se asume para Google
  let user = await Usuario.findOne({ where: { email, id_autenticacion: 2 } });
  if (!user) {
    const defaultRole = await Rol.findOne({ where: { nombre: 'Externo' } });
    const hashedPassword = await bcrypt.hash('OAuthUserRandomPassword', 10);
    user = await Usuario.create({
      nombre,
      apellido,
      email,
      password: hashedPassword,
      fechaNacimiento: '1990-01-01', 
      id_rol: defaultRole.id_rol,
      id_estado: 1,
      preferenciasNotificaciones: true,
      id_autenticacion: 2, 
      emailConfirmed: true,
    });
  }
  return user;
}

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
// Ajusta según tu dominio
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    const nombre = profile.name.givenName || 'SinNombre';
    const apellido = profile.name.familyName || 'SinApellido';
    const user = await findOrCreateGoogleUser(email, nombre, apellido);
    done(null, user);
  } catch (error) {
    done(error);
  }
}));

export default passport;
