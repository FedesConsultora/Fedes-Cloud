// states/userState.js
export default class UserState {
    constructor(user) {
      this.user = user;
    }
  
    handle() {
      throw new Error('El método handle debe ser implementado');
    }
  }
  