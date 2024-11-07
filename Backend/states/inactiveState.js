// states/inactiveState.js
import UserState from './userState.js';

export default class InactiveState extends UserState {
  handle() {
    // Lógica para usuarios inactivos
    console.log(`El usuario ${this.user.nombre} está inactivo.`);
  }
}
