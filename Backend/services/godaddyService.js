// services/godaddyService.js
export default class GoDaddyService {
    constructor(adapter) {
      this.adapter = adapter;
    }
  
    async checkDomainAvailability(domain) {
      return this.adapter.checkDomainAvailability(domain);
    }
  
    // Otros métodos para interactuar con la API de GoDaddy
  }
  