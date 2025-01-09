// services/godaddyService.js
export default class GoDaddyService {
  constructor(adapter) {
    this.adapter = adapter; // Inyecta la instancia de GoDaddyAdapter
  }

  async checkDomainAvailability(domain) {
    return this.adapter.checkDomainAvailability(domain);
  }
  
  async suggestDomains(opts) {
    return this.adapter.getDomainSuggestions(opts);
  }

  async getTLDs() {
    return this.adapter.getTLDs();
  }
  /**
   * Registrar un dominio.
   * @param {string} domain
   * @param {object} body - El payload con consent, contactos, period, etc.
   */
  async registerDomain(domain, body) {
    // Podrías validar que 'body' contenga contactAdmin, contactRegistrant, etc.
    return this.adapter.registerDomain(domain, body);
  }

  async renewDomain(body) {
    // body: { domain, period, renewAuto, ... }
    return this.adapter.renewDomain(body);
  }

  async updateDNSRecords(domain, type, records) {
    // records => [{ data: '127.0.0.1', name: '@', ttl: 600, type: 'A' }]
    return this.adapter.updateDNSRecords(domain, type, records);
  }

  async getDomainInfo(domain) {
    return this.adapter.getDomainInfo(domain);
  }
}
