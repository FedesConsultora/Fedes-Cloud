// src/data/certificateData.js

/** 
 * Datos de certificados (DV, OV, EV) con sus precios base y descripciones.
 */
export const CERTIFICATE_TYPES = {
    DV: {
      name: 'DV',
      regularPrice: 25,
      discountPrice: 19,
      discountLabel: '25%OFF',
      features: [
        'Valida únicamente el dominio.',
        'Se emite en pocas horas.',
        'Solo requiere documento de identidad.',
        'Recomendado para sitios sin tráfico sensible.',
      ],
    },
    OV: {
      name: 'OV',
      regularPrice: 79,
      discountPrice: 59,
      discountLabel: '25%OFF',
      features: [
        'Valida dominio y organización.',
        'Recomendado para sitios con transacciones (eCommerce).',
        'Mejora posicionamiento en Google.',
      ],
    },
    EV: {
      name: 'EV',
      regularPrice: 392,
      discountPrice: 189,
      discountLabel: '25%OFF',
      features: [
        'Certifica dominio y empresa exhaustivamente.',
        'Ofrece el mayor nivel de seguridad.',
        'Muestra el nombre de la empresa en la barra de direcciones.',
      ],
    },
  };
  
  /**
   * Planes (Paso 2): Duraciones con precios y descuentos.
   */
  export const PLAN_OPTIONS = [
    {
      id: '1 año',
      discountedPrice: 159.99,
      originalPrice: 199.99,
      discountNote: 'Ahorra 20%',
    },
    {
      id: '2 años',
      discountedPrice: 129.99,
      originalPrice: 199.99,
      discountNote: 'Ahorra 35%',
    },
    {
      id: '3 años',
      discountedPrice: 99.99,
      originalPrice: 199.99,
      discountNote: 'Ahorra 50%',
    },
    {
      id: '5 años',
      discountedPrice: 99.99,
      originalPrice: 199.99,
      discountNote: 'Ahorra 50%',
    },
  ];
  