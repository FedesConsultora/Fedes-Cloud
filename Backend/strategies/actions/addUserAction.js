// strategies/actions/addUserAction.js
import ActionStrategy from './actionStrategy.js';
import { Usuario } from '../../models/index.js';

export default class AddUserAction extends ActionStrategy {
  async execute(user, newUserData) {
    // Verificar permisos
    if (!user.hasPermission('add_user')) {
      throw new Error('No tienes permiso para agregar usuarios');
    }

    // Lógica para agregar usuario
    const newUser = await Usuario.create(newUserData);
    return newUser;
  }
}
