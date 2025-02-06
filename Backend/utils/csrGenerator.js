// src/utils/csrGenerator.js
import forge from 'node-forge';

/**
 * Genera un CSR (Certificate Signing Request) y la clave privada asociada.
 * @param {string} commonName - El nombre común (dominio) para el CSR.
 * @param {Array} additionalAttributes - (Opcional) Array de atributos adicionales para el sujeto.
 *        Cada elemento debe ser un objeto con propiedades "name" y "value".
 * @returns {Promise<Object>} - Un objeto con { csr, privateKey } en formato PEM.
 */
export const generateCSR = (commonName, additionalAttributes = []) => {
  return new Promise((resolve, reject) => {
    try {
      // Genera el par de claves (2048 bits es un buen estándar)
      const keys = forge.pki.rsa.generateKeyPair(2048);
      const csr = forge.pki.createCertificationRequest();

      csr.publicKey = keys.publicKey;

      // Define los atributos del sujeto; por defecto se incluye el commonName.
      const subjectAttributes = [
        { name: 'commonName', value: commonName },
        // Puedes agregar atributos adicionales aquí o pasar additionalAttributes para personalizar.
        ...additionalAttributes,
      ];

      csr.setSubject(subjectAttributes);

      // Firma el CSR con la clave privada
      csr.sign(keys.privateKey);

      // Convertir CSR y clave privada a formato PEM
      const pemCsr = forge.pki.certificationRequestToPem(csr);
      const pemPrivateKey = forge.pki.privateKeyToPem(keys.privateKey);

      resolve({ csr: pemCsr, privateKey: pemPrivateKey });
    } catch (err) {
      reject(err);
    }
  });
};
