// states/activeState.js
import UserState from './userState.js';

export default class ActiveState extends UserState {
  handle() {
    // Lógica para usuarios activos
    console.log(`El usuario ${this.user.nombre} está activo.`);
  }
}
