// adapters/godaddyAdapter.js
import fetch from 'node-fetch';  // O quita esto si Node >= 18 y fetch es global
import 'dotenv/config';

export default class GoDaddyAdapter {
  constructor() {
    // Carga las variables de entorno
    this.apiKey = process.env.GODADDY_API_KEY;
    this.apiSecret = process.env.GODADDY_API_SECRET;
    this.baseURL = process.env.GODADDY_BASE_URL || 'https://api.ote-godaddy.com'; 
  }

  /**
   * Verificar la disponibilidad de un dominio.
   * GET /v1/domains/available?domain=<dom>
   */
  async checkDomainAvailability(domain) {
    try {
      const url = new URL(`/v1/domains/available`, this.baseURL);
      url.searchParams.set('domain', domain);

      const headers = {
        'Authorization': `sso-key ${this.apiKey}:${this.apiSecret}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      const response = await fetch(url, { method: 'GET', headers });
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`GoDaddy API error (checkDomain): ${response.status} - ${errorBody}`);
      }

      return await response.json(); 
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener sugerencias de dominio basadas en una semilla (query).
   * GET /v1/domains/suggest?query=<keyword>&country=<...>&limit=<...>
   * @param {object} opts - { query, country, city, limit, etc. }
  */
  async getDomainSuggestions(opts = {}) {
    try {
      const url = new URL('/v1/domains/suggest', this.baseURL);

      // Ajusta parámetros (query, country, limit, etc.)
      if (opts.query) {
        url.searchParams.set('query', opts.query);
      }
      if (opts.country) {
        url.searchParams.set('country', opts.country);
      }
      if (opts.city) {
        url.searchParams.set('city', opts.city);
      }
      if (opts.limit) {
        url.searchParams.set('limit', opts.limit);
      }
      // Puedes incluir 'sources' (array), 'tlds' (array), etc.
      // Ej. url.searchParams.append('sources', 'KEYWORD_SPIN');

      const headers = {
        Authorization: `sso-key ${this.apiKey}:${this.apiSecret}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };

      const response = await fetch(url, { method: 'GET', headers });
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `GoDaddy API error (suggestDomains): ${response.status} - ${errorBody}`
        );
      }

      // Respuesta típica: [ { domain: "example.co" }, { domain: "example.xyz" }, ... ]
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener lista de TLDs soportados por GoDaddy.
   * GET /v1/domains/tlds
   */
  async getTLDs() {
    try {
      const url = new URL('/v1/domains/tlds', this.baseURL);

      const headers = {
        Authorization: `sso-key ${this.apiKey}:${this.apiSecret}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };

      const response = await fetch(url, { method: 'GET', headers });
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `GoDaddy API error (getTLDs): ${response.status} - ${errorBody}`
        );
      }

      // Respuesta típica: [ { name: "com", type: "GENERIC" }, ... ]
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Registrar (comprar) un dominio.
   * POST /v1/domains/purchase
   * @param {string} domain - e.g. "example.com"
   * @param {object} body  - Consent, contacts, period, renewAuto, etc.
   */
  async registerDomain(domain, body = {}) {
    try {
      const url = new URL(`/v1/domains/purchase`, this.baseURL);

      const headers = {
        'Authorization': `sso-key ${this.apiKey}:${this.apiSecret}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      // Merges "domain" con el resto del payload
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

      // Devuelve un objeto con currency, itemCount, orderId, total, ...
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Renovar un dominio.
   * POST /v1/domains/renew
   * Body típico: { "domain": "example.com", "period": 1, "renewAuto": true }
   */
  async renewDomain(body = {}) {
    try {
      const url = new URL(`/v1/domains/renew`, this.baseURL);

      const headers = {
        'Authorization': `sso-key ${this.apiKey}:${this.apiSecret}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),  // body.domain, body.period, body.renewAuto...
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`GoDaddy API error (renewDomain): ${response.status} - ${errorBody}`);
      }

      // Devuelve { currency, itemCount, orderId, total, ... }
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar todos los registros de un tipo (A, CNAME, etc.) en un dominio.
   * PUT /v1/domains/{domain}/records/{type}
   */
  async updateDNSRecords(domain, recordType, records) {
    try {
      // e.g. PUT /v1/domains/example.com/records/A
      const url = new URL(`/v1/domains/${domain}/records/${recordType}`, this.baseURL);

      const headers = {
        'Authorization': `sso-key ${this.apiKey}:${this.apiSecret}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(records),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`GoDaddy API error (updateDNS): ${response.status} - ${errorBody}`);
      }

      // Normalmente regresa status 200 sin contenido
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener detalles de un dominio
   * GET /v1/domains/{domain}
   */
  async getDomainInfo(domain) {
    try {
      const url = new URL(`/v1/domains/${domain}`, this.baseURL);

      const headers = {
        'Authorization': `sso-key ${this.apiKey}:${this.apiSecret}`,
        'Accept': 'application/json',
      };

      const response = await fetch(url, { method: 'GET', headers });
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`GoDaddy API error (getDomainInfo): ${response.status} - ${errorBody}`);
      }

      // Devuelve info de expiración, locked, autorenew, contacts, etc.
      return await response.json();
    } catch (error) {
      throw error;
    }
  }
}
