// strategies/auth/emailPasswordStrategy.js
import AuthStrategy from './authStrategy.js';
import bcrypt from 'bcrypt';
import { Usuario } from '../../models/index.js';

export default class EmailPasswordStrategy extends AuthStrategy {
  async authenticate(req) {
    const { email, contraseña } = req.body;
    const user = await Usuario.findOne({ where: { email } });
    if (!user) {
      throw new Error('Credenciales inválidas');
    }
    const validPassword = await bcrypt.compare(contraseña, user.contraseña);
    if (!validPassword) {
      throw new Error('Credenciales inválidas');
    }
    return user;
  }
}
