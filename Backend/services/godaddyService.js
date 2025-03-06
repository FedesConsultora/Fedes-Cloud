import logger from "../utils/logger.js";

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
    return this.adapter.registerDomain(domain, body, shopperId);
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

  /**
   * Crear orden de certificado en GoDaddy (POST /v1/certificates)
   * @param {object} certificateCreatePayload
   *  Ejemplo:
   *  {
   *    productType: 'DV_SSL',
   *    commonName: 'misitio.com',
   *    csr: '--- BEGIN CERTIFICATE REQUEST --- ...',
   *    period: 1,
   *    contact: { email, jobTitle, ... },
   *    organization: { name, address, ... }, // opcional si DV
   *    subjectAlternativeNames: ['www.misitio.com'],
   *    callbackUrl: 'https://tuservicio/callback/ssl',
   *    ...
   *  }
   */
  async createCertificateOrder(certificateCreatePayload) {
    try {
      logger.info(`Enviando solicitud de creación de certificado: ${JSON.stringify(certificateCreatePayload)}`);
      const responseData = await this.adapter.createCertificateOrder(certificateCreatePayload);
      logger.info(`Orden de certificado creada exitosamente: ${JSON.stringify(responseData)}`);
      return responseData;
    } catch (error) {
      logger.error(`Error en createCertificateOrder: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validar la orden de certificado (POST /v1/certificates/validate)
   */
  async validateCertificateOrder(certificateCreatePayload) {
    try {
      logger.info(`Validando orden de certificado: ${JSON.stringify(certificateCreatePayload)}`);
      const resp = await this.adapter.validateCertificateOrder(certificateCreatePayload);
      return resp;
    } catch (error) {
      logger.error(`Error en validateCertificateOrder: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener detalles de un certificado (GET /v1/certificates/{certificateId})
   */
  async getCertificateInfo(certificateId) {
    try {
      const details = await this.adapter.getCertificateInfo(certificateId);
      return details;
    } catch (error) {
      logger.error(`Error en getCertificateInfo: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener historial de acciones (GET /v1/certificates/{certificateId}/actions)
   */
  async getCertificateActions(certificateId) {
    try {
      const actions = await this.adapter.getCertificateActions(certificateId);
      return actions;
    } catch (error) {
      logger.error(`Error en getCertificateActions: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cancelar un certificado pendiente (POST /v1/certificates/{certificateId}/cancel)
   */
  async cancelCertificate(certificateId) {
    try {
      await this.adapter.cancelCertificate(certificateId);
      return true;
    } catch (error) {
      logger.error(`Error en cancelCertificate: ${error.message}`);
      throw error;
    }
  }

  /**
   * Descargar un certificado emitido (GET /v1/certificates/{certificateId}/download)
   */
  async downloadCertificate(certificateId) {
    try {
      const downloadData = await this.adapter.downloadCertificate(certificateId);
      return downloadData;
    } catch (error) {
      logger.error(`Error en downloadCertificate: ${error.message}`);
      throw error;
    }
  }

  /**
   * Reemitir (reissue) un certificado (POST /v1/certificates/{certificateId}/reissue)
   */
  async reissueCertificate(certificateId, reissuePayload) {
    try {
      const reissueResp = await this.adapter.reissueCertificate(certificateId, reissuePayload);
      return reissueResp;
    } catch (error) {
      logger.error(`Error en reissueCertificate: ${error.message}`);
      throw error;
    }
  }

  /**
   * Renovar un certificado (POST /v1/certificates/{certificateId}/renew)
   */
  async renewCertificate(certificateId, renewPayload) {
    try {
      const renewResp = await this.adapter.renewCertificate(certificateId, renewPayload);
      return renewResp;
    } catch (error) {
      logger.error(`Error en renewCertificate: ${error.message}`);
      throw error;
    }
  }

  /**
   * Revocar un certificado (POST /v1/certificates/{certificateId}/revoke)
   */
  async revokeCertificate(certificateId, revokePayload) {
    try {
      await this.adapter.revokeCertificate(certificateId, revokePayload);
      return true;
    } catch (error) {
      logger.error(`Error en revokeCertificate: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener Site Seal (GET /v1/certificates/{certificateId}/siteSeal)
   */
  async getSiteSeal(certificateId, { theme, locale }) {
    try {
      return await this.adapter.getSiteSeal(certificateId, { theme, locale });
    } catch (error) {
      logger.error(`Error en getSiteSeal: ${error.message}`);
      throw error;
    }
  }
}
