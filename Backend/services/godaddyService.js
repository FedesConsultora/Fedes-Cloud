// services/godaddyService.js
export default class GoDaddyService {
  constructor(adapter) {
    this.adapter = adapter; // inyecta el adaptador que usa fetch
  }

  async checkDomainAvailability(domain) {
    // lógica adicional si la requieres
    return await this.adapter.checkDomainAvailability(domain);
  }

  async registerDomain(domain, body) {
    // Puedes validar que body contenga lo que GoDaddy necesita
    return await this.adapter.registerDomain(domain, body);
  }

  // Otros métodos que delegan en el adaptador
}
