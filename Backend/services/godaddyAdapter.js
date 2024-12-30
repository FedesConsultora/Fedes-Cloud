// adapters/godaddyAdapter.js
export default class GoDaddyAdapter {
    constructor() {
      // Carga las variables de entorno
      this.apiKey = process.env.GODADDY_API_KEY;
      this.apiSecret = process.env.GODADDY_API_SECRET;
      this.baseURL = process.env.GODADDY_BASE_URL || 'https://api.ote-godaddy.com'; 
      // ^ Por defecto, usa OTE (sandbox); si estás en producción, ajusta o usa otra variable
    }
  
    /**
     * Verifica la disponibilidad de un dominio.
     * @param {string} domain - El dominio a chequear (ej: 'example.com')
     * @returns {Object} Respuesta JSON de la API GoDaddy 
     */
    async checkDomainAvailability(domain) {
      try {
        const url = new URL(`/domains/available`, this.baseURL);
        // Construye la query
        url.searchParams.set('domain', domain);
  
        // Preparar encabezados
        const headers = {
          'Authorization': `sso-key ${this.apiKey}:${this.apiSecret}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        };
  
        // Realiza la petición
        const response = await fetch(url, { method: 'GET', headers });
        
        if (!response.ok) {
          // Manejo de error: arroja un error con el status
          const errorBody = await response.text();
          throw new Error(`GoDaddy API error: ${response.status} - ${errorBody}`);
        }
  
        // Retornar cuerpo como JSON
        const data = await response.json();
        return data;
      } catch (error) {
        // Manejo de excepciones
        throw error;
      }
    }
  
    /**
     * Registrar un dominio. (Ejemplo)
     * @param {string} domain - Dominio a registrar (ej: 'example.com')
     * @param {Object} body - Objeto con información requerida por la API GoDaddy
     * @returns {Object} Respuesta JSON de la API
     */
    async registerDomain(domain, body = {}) {
      try {
        const url = new URL(`/domains/purchase`, this.baseURL);
  
        const headers = {
          'Authorization': `sso-key ${this.apiKey}:${this.apiSecret}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        };
  
        // En el body, GoDaddy requiere data como { domain, consent, contactBilling, etc. }
        // Asegúrate de revisar la doc oficial para ver cómo formar el body correctamente
        const payload = {
          domain,
          ...body, // Merges additional fields, e.g. { period: 1, renewAuto: true, contactAdmin: {..}, contactTech: {...}, etc. }
        };
  
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
  
        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`GoDaddy API error: ${response.status} - ${errorBody}`);
        }
  
        return await response.json();
      } catch (error) {
        throw error;
      }
    }
  
    // Otros métodos según lo que necesites: 
    // - updateDNSRecords
    // - renewDomain
    // - transferDomain
    // etc.
  }
  