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
  
  // Métodos de Shoppers
  async createShopper(shopperData) {
    return this.adapter.createSubaccount(shopperData);
  }

  async getShopperDetails(shopperId) {
    return this.adapter.getShopperDetails(shopperId);
  }

  async updateShopperDetails(shopperId, shopperData) {
    return this.adapter.updateShopperDetails(shopperId, shopperData);
  }

  async deleteShopper(shopperId, auditClientIp) {
    return this.adapter.deleteShopper(shopperId, auditClientIp);
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

  async registerDomain(domain, body = {}, shopperId = null) {
    try {
      const url = new URL(`/v1/domains/purchase`, this.baseURL);

      const headers = {
        'Authorization': `sso-key ${this.apiKey}:${this.apiSecret}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      if (shopperId) {
        headers['X-Shopper-Id'] = shopperId;
      }

      const payload = { domain, ...body };

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`GoDaddy API error (registerDomain): ${response.status} - ${errorBody}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // **Nuevo Método para Validar la Solicitud de Compra**
  async validatePurchase(body = {}) {
    try {
      const url = new URL(`/v1/domains/purchase/validate`, this.baseURL);

      const headers = {
        'Authorization': `sso-key ${this.apiKey}:${this.apiSecret}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`GoDaddy API error (validatePurchase): ${response.status} - ${errorBody}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }
}
