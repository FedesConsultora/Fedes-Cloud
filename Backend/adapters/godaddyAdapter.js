// adapters/godaddyAdapter.js
import fetch from 'node-fetch';  // O quita esto si Node >= 18 y fetch es global
import 'dotenv/config';
import logger from '../utils/logger.js';

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
        throw new Error(`GoDaddy API error (checkDomainAvailability): ${response.status} - ${errorBody}`);
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
   * Registrar (Comprar) un Dominio
   * POST /v1/domains/purchase
   * @param {string} domain - Dominio a registrar
   * @param {object} body - Detalles de la compra
   * @param {string} shopperId - (Opcional) ID del shopper
   */
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

      // Combinar "domain" con el resto del payload
      const payload = { domain, ...body };

      // Loggear la solicitud antes de enviarla
      logger.info(`Enviando solicitud de registro de dominio: ${JSON.stringify(payload)}`);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        logger.error(`GoDaddy API error (registerDomain): ${response.status} - ${errorBody}`);
        throw new Error(`GoDaddy API error (registerDomain): ${response.status} - ${errorBody}`);
      }

      const responseData = await response.json();
      logger.info(`Respuesta exitosa de GoDaddy (registerDomain): ${JSON.stringify(responseData)}`);

      return responseData;
    } catch (error) {
      logger.error(`Error en registerDomain: ${error.message}`);
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

  /**
   * Crear una subcuenta de shopper.
   * POST /v1/shoppers/subaccount
   * @param {object} shopperData - Datos del shopper
   */
  async createSubaccount(shopperData) {
    try {
      const url = new URL(`/v1/shoppers/subaccount`, this.baseURL);

      const headers = {
        'Authorization': `sso-key ${this.apiKey}:${this.apiSecret}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(shopperData),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        logger.error(`GoDaddy API error (createSubaccount): ${response.status} - ${errorBody}`);
        throw new Error(`GoDaddy API error (createSubaccount): ${response.status} - ${errorBody}`);
      }

      return await response.json(); // { customerId, shopperId }
    } catch (error) {
      logger.error(`Error en createSubaccount: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener detalles de un shopper.
   * GET /v1/shoppers/{shopperId}
   * @param {string} shopperId - ID del shopper
   */
  async getShopperDetails(shopperId) {
    try {
      const url = new URL(`/v1/shoppers/${shopperId}`, this.baseURL);

      const headers = {
        'Authorization': `sso-key ${this.apiKey}:${this.apiSecret}`,
        'Accept': 'application/json',
      };

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        logger.error(`GoDaddy API error (getShopperDetails): ${response.status} - ${errorBody}`);
        throw new Error(`GoDaddy API error (getShopperDetails): ${response.status} - ${errorBody}`);
      }

      return await response.json(); // Detalles del shopper
    } catch (error) {
      logger.error(`Error en getShopperDetails: ${error.message}`);
      throw error;
    }
  }

  /**
   * Actualizar detalles de un shopper.
   * POST /v1/shoppers/{shopperId}
   * @param {string} shopperId - ID del shopper
   * @param {object} shopperData - Datos a actualizar
   */
  async updateShopperDetails(shopperId, shopperData) {
    try {
      const url = new URL(`/v1/shoppers/${shopperId}`, this.baseURL);

      const headers = {
        'Authorization': `sso-key ${this.apiKey}:${this.apiSecret}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(shopperData),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        logger.error(`GoDaddy API error (updateShopperDetails): ${response.status} - ${errorBody}`);
        throw new Error(`GoDaddy API error (updateShopperDetails): ${response.status} - ${errorBody}`);
      }

      return await response.json(); // { customerId, shopperId }
    } catch (error) {
      logger.error(`Error en updateShopperDetails: ${error.message}`);
      throw error;
    }
  }

  /**
   * Eliminar un shopper.
   * DELETE /v1/shoppers/{shopperId}?auditClientIp=<IP>
   * @param {string} shopperId - ID del shopper
   * @param {string} auditClientIp - IP del cliente
   */
  async deleteShopper(shopperId, auditClientIp) {
    try {
      const url = new URL(`/v1/shoppers/${shopperId}`, this.baseURL);
      url.searchParams.append('auditClientIp', auditClientIp);

      const headers = {
        'Authorization': `sso-key ${this.apiKey}:${this.apiSecret}`,
        'Accept': 'application/json',
      };

      const response = await fetch(url, {
        method: 'DELETE',
        headers,
      });

      if (response.status !== 204) { // 204 No Content indica éxito
        const errorBody = await response.text();
        logger.error(`GoDaddy API error (deleteShopper): ${response.status} - ${errorBody}`);
        throw new Error(`GoDaddy API error (deleteShopper): ${response.status} - ${errorBody}`);
      }

      return true;
    } catch (error) {
      logger.error(`Error en deleteShopper: ${error.message}`);
      throw error;
    }
  }
  /**
   * Validar la Solicitud de Compra
   * POST /v1/domains/purchase/validate
   * @param {object} body - Payload de la compra
   */
  async validatePurchase(body = {}) {
    try {
      const url = new URL(`/v1/domains/purchase/validate`, this.baseURL);

      const headers = {
        'Authorization': `sso-key ${this.apiKey}:${this.apiSecret}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      // Loggear la solicitud antes de enviarla
      logger.info(`Enviando solicitud de validación de compra: ${JSON.stringify(body)}`);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        logger.error(`GoDaddy API error (validatePurchase): ${response.status} - ${errorBody}`);
        throw new Error(`GoDaddy API error (validatePurchase): ${response.status} - ${errorBody}`);
      }

      const responseData = await response.json();
      logger.info(`Respuesta exitosa de GoDaddy (validatePurchase): ${JSON.stringify(responseData)}`);

      return responseData;
    } catch (error) {
      logger.error(`Error en validatePurchase: ${error.message}`);
      throw error;
    }
  }
  /**
   * Crear orden de certificado (POST /v1/certificates)
   */
  async createCertificateOrder(certificateCreatePayload) {
    try {
      const url = new URL('/v1/certificates', this.baseURL);

      const headers = {
        Authorization: `sso-key ${this.apiKey}:${this.apiSecret}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(certificateCreatePayload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        logger.error(`GoDaddy API error (createCertificateOrder): ${response.status} - ${errorBody}`);
        throw new Error(`GoDaddy API error (createCertificateOrder): ${response.status} - ${errorBody}`);
      }

      const data = await response.json(); // { certificateId: "123456" }
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validar la orden de certificado (POST /v1/certificates/validate)
   */
  async validateCertificateOrder(certificateCreatePayload) {
    try {
      const url = new URL('/v1/certificates/validate', this.baseURL);

      const headers = {
        Authorization: `sso-key ${this.apiKey}:${this.apiSecret}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(certificateCreatePayload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        logger.error(`GoDaddy API error (validateCertificateOrder): ${response.status} - ${errorBody}`);
        throw new Error(`GoDaddy API error (validateCertificateOrder): ${response.status} - ${errorBody}`);
      }

      // 204 => "Request validated successfully", 
      // Pero si da 204, no hay JSON. 
      // Podrías retornar un object que indique "validado"
      if (response.status === 204) {
        return { message: 'Validated', code: 204 };
      }
      // O si la API retorna algo en 200, devuélvelo
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener detalle de un certificado (GET /v1/certificates/{certificateId})
   */
  async getCertificateInfo(certificateId) {
    try {
      const url = new URL(`/v1/certificates/${certificateId}`, this.baseURL);

      const headers = {
        Authorization: `sso-key ${this.apiKey}:${this.apiSecret}`,
        Accept: 'application/json',
      };

      const response = await fetch(url, { method: 'GET', headers });
      if (!response.ok) {
        const errorBody = await response.text();
        logger.error(`GoDaddy API error (getCertificateInfo): ${response.status} - ${errorBody}`);
        throw new Error(`GoDaddy API error (getCertificateInfo): ${response.status} - ${errorBody}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener acciones (GET /v1/certificates/{certificateId}/actions)
   */
  async getCertificateActions(certificateId) {
    try {
      const url = new URL(`/v1/certificates/${certificateId}/actions`, this.baseURL);

      const headers = {
        Authorization: `sso-key ${this.apiKey}:${this.apiSecret}`,
        Accept: 'application/json',
      };

      const response = await fetch(url, { method: 'GET', headers });
      if (!response.ok) {
        const errorBody = await response.text();
        logger.error(`GoDaddy API error (getCertificateActions): ${response.status} - ${errorBody}`);
        throw new Error(`GoDaddy API error (getCertificateActions): ${response.status} - ${errorBody}`);
      }

      return await response.json(); // un array con acciones
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cancelar certificado pendiente (POST /v1/certificates/{certificateId}/cancel)
   */
  async cancelCertificate(certificateId) {
    try {
      const url = new URL(`/v1/certificates/${certificateId}/cancel`, this.baseURL);

      const headers = {
        Authorization: `sso-key ${this.apiKey}:${this.apiSecret}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };

      const response = await fetch(url, { method: 'POST', headers });
      if (!response.ok) {
        const errorBody = await response.text();
        logger.error(`GoDaddy API error (cancelCertificate): ${response.status} - ${errorBody}`);
        throw new Error(`GoDaddy API error (cancelCertificate): ${response.status} - ${errorBody}`);
      }

      // 204 => "Certificate order has been canceled" 
      // o 200 => no documentado? Probablemente 204
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Descargar certificado (GET /v1/certificates/{certificateId}/download)
   */
  async downloadCertificate(certificateId) {
    try {
      const url = new URL(`/v1/certificates/${certificateId}/download`, this.baseURL);

      const headers = {
        Authorization: `sso-key ${this.apiKey}:${this.apiSecret}`,
        Accept: 'application/json',
      };

      const response = await fetch(url, { method: 'GET', headers });
      if (!response.ok) {
        const errorBody = await response.text();
        logger.error(`GoDaddy API error (downloadCertificate): ${response.status} - ${errorBody}`);
        throw new Error(`GoDaddy API error (downloadCertificate): ${response.status} - ${errorBody}`);
      }

      // Retorna { pems: { certificate, cross, intermediate, root }, serialNumber }
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reemisión (reissue) (POST /v1/certificates/{certificateId}/reissue)
   */
  async reissueCertificate(certificateId, payload) {
    try {
      const url = new URL(`/v1/certificates/${certificateId}/reissue`, this.baseURL);

      const headers = {
        Authorization: `sso-key ${this.apiKey}:${this.apiSecret}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        logger.error(`GoDaddy API error (reissueCertificate): ${response.status} - ${errorBody}`);
        throw new Error(`GoDaddy API error (reissueCertificate): ${response.status} - ${errorBody}`);
      }

      // 202 => Reissue request created
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Renovar (renew) (POST /v1/certificates/{certificateId}/renew)
   */
  async renewCertificate(certificateId, payload) {
    try {
      const url = new URL(`/v1/certificates/${certificateId}/renew`, this.baseURL);

      const headers = {
        Authorization: `sso-key ${this.apiKey}:${this.apiSecret}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        logger.error(`GoDaddy API error (renewCertificate): ${response.status} - ${errorBody}`);
        throw new Error(`GoDaddy API error (renewCertificate): ${response.status} - ${errorBody}`);
      }

      // 202 => Renew request created
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Revocar (revoke) (POST /v1/certificates/{certificateId}/revoke)
   */
  async revokeCertificate(certificateId, payload) {
    try {
      const url = new URL(`/v1/certificates/${certificateId}/revoke`, this.baseURL);

      const headers = {
        Authorization: `sso-key ${this.apiKey}:${this.apiSecret}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload), // { reason: "AFFILIATION_CHANGED" | "KEY_COMPROMISE" ... }
      });

      if (!response.ok) {
        const errorBody = await response.text();
        logger.error(`GoDaddy API error (revokeCertificate): ${response.status} - ${errorBody}`);
        throw new Error(`GoDaddy API error (revokeCertificate): ${response.status} - ${errorBody}`);
      }

      // 204 => Certificate Revoked
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener Site Seal (GET /v1/certificates/{certificateId}/siteSeal)
   */
  async getSiteSeal(certificateId, { theme = 'LIGHT', locale = 'en' }) {
    try {
      const url = new URL(`/v1/certificates/${certificateId}/siteSeal`, this.baseURL);

      // theme => 'DARK' | 'LIGHT'
      // locale => 'en', 'es', etc.
      if (theme) {
        url.searchParams.set('theme', theme);
      }
      if (locale) {
        url.searchParams.set('locale', locale);
      }

      const headers = {
        Authorization: `sso-key ${this.apiKey}:${this.apiSecret}`,
        Accept: 'application/json',
      };

      const response = await fetch(url, { method: 'GET', headers });
      if (!response.ok) {
        const errorBody = await response.text();
        logger.error(`GoDaddy API error (getSiteSeal): ${response.status} - ${errorBody}`);
        throw new Error(`GoDaddy API error (getSiteSeal): ${response.status} - ${errorBody}`);
      }

      // { html: "<script>...</script>" }
      return await response.json();
    } catch (error) {
      throw error;
    }
  }
}
