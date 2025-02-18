// src/data/hostingData.js

export const HOSTING_TYPES = {
    webHosting: {
      title: "Web Hosting",
      description: "¡Ideal para tu primer sitio web! Alojamiento con SSL, Dominio y Correos.",
      features: [
        "Dominio incluido",
        "Certificado SSL gratuito",
        "Cuentas de correo ilimitadas",
        "Panel de control intuitivo"
      ],
      currency: "ARS"
    },  
    wordpressHosting: {
      title: "WordPress Hosting",
      description: "¡WordPress ya instalado y listo para usar! Servidores LiteSpeed ultra veloces.",
      features: [
        "Instalación preconfigurada de WordPress",
        "Servidores optimizados",
        "Actualizaciones automáticas",
        "Soporte especializado"
      ],
      currency: "ARS"
    }
  };
  
  export const HOSTING_PLANS = {
    webHostingPlans: [
      {
        id: 1,
        title: "Plan 1",
        subtitle: "Inicia en el mundo digital: Ideal para tu web personal",
        monthly: {
          price: 5999,
          billingCycle: "/mes",
        },
        annual: {
          originalPrice: 5999,
          discountedPrice: 1999,
          billingCycle: "/mes",
          discountLabel: "67% OFF",
          bonus: "Incluye GRATIS 3 MESES",
        },
        features: [
          { feature: "50GB de almacenamiento SSD", status: "double" },
          { feature: "Dominio (ahorrá: $10.920)", status: "single" },
          { feature: "5 Cuentas de correo", status: "double" },
          { feature: "Certificado SSL", status: "cross" },
          { feature: "Videos, guías y soporte 24/7", status: "single" },
          { feature: "Copia de seguridad semanal", status: "single" },
          { feature: "WordPress Stage", status: "single" },
          { feature: "WordPress a 1 click", status: "single" },
        ],
      },
      {
        id: 2,
        title: "Plan 2",
        subtitle: "Todo lo necesario para desarrollar tu emprendimiento",
        monthly: {
          price: 9500,
          billingCycle: "/mes",
        },
        annual: {
          originalPrice: 9500,
          discountedPrice: 2299,
          billingCycle: "/mes",
          discountLabel: "76% OFF",
          bonus: "Incluye GRATIS 4 MESES",
        },
        bestSeller: true, // Agregado: este plan es el más vendido
        features: [
          { feature: "100GB de almacenamiento SSD", status: "double" },
          { feature: "Dominio (ahorrá: $10.920)", status: "single" },
          { feature: "Cuentas de correo ILIMITADO", status: "single" },
          { feature: "Certificado SSL (ahorrá: $16.680)", status: "single" },
          { feature: "Videos, guías y soporte 24/7", status: "single" },
          { feature: "Copia de seguridad semanal", status: "single" },
          { feature: "WordPress Stage", status: "double" },
          { feature: "WordPress a 1 click", status: "single" },
        ],
      },
      {
        id: 3,
        title: "Plan 3",
        subtitle: "Recursos potentes para impulsar tu expansión",
        monthly: {
          price: 13999,
          billingCycle: "/mes",
        },
        annual: {
          originalPrice: 13999,
          discountedPrice: 2999,
          billingCycle: "/mes",
          discountLabel: "79% OFF",
          bonus: "Incluye GRATIS 5 MESES",
        },
        features: [
          { feature: "200GB de almacenamiento SSD", status: "single" },
          { feature: "Dominio (ahorrá: $10.920)", status: "single" },
          { feature: "Cuentas de correo ILIMITADO", status: "single" },
          { feature: "Certificado SSL (ahorrá: $16.680)", status: "single" },
          { feature: "Soporte Premium 24/7", status: "single" },
          { feature: "Copia de seguridad diaria", status: "single" },
          { feature: "WordPress Stage", status: "single" },
          { feature: "WordPress a 1 click", status: "single" },
        ],
      },
    ],
    wordpressHostingPlans: [
        {
            id: 1,
            title: "WordPress Plan 1",
            subtitle: "Descubre el mundo de WordPress.",
            monthly: {
                price: 6999,
                billingCycle: "/mes",
            },
            annual: {
                originalPrice: 6999,
                discountedPrice: 2099,
                billingCycle: "/mes",
                discountLabel: "70% OFF",
                bonus: "Incluye GRATIS 3 MESES",
            },
            features: [
                { feature: "1 Website", status: "double" },
                { feature: "50GB de almacenamiento SSD", status: "double" },
                { feature: "Dominio (ahorrá: $10.920)", status: "single" },
                { feature: "5 Cuentas de correo", status: "double" },
                { feature: "Certificado SSL gratis", status: "cross" },
                { feature: "2x más rápido que Hosting Standard", status: "single" },
                { feature: "Copia de seguridad semanal", status: "double" },
                { feature: "WordPress Stage", status: "double" },
                { feature: "Soporte 24/7", status: "double" },
                { feature: "WordPress 6.7.2 Instalado", status: "single" },
            ],
        },
        {
            id: 2,
            title: "WordPress Plan 2",
            subtitle: "Todo lo necesario para tu WordPress.",
            monthly: {
                price: 10500,
                billingCycle: "/mes",
            },
            annual: {
                originalPrice: 10500,
                discountedPrice: 2499,
                billingCycle: "/mes",
                discountLabel: "76% OFF",
                bonus: "Incluye GRATIS 4 MESES",
            },
            bestSeller: true, // Este plan es el más vendido
            features: [
                { feature: "1 Website", status: "double" },
                { feature: "100GB de almacenamiento SSD", status: "double" },
                { feature: "Dominio (ahorrá: $10.920)", status: "single" },
                { feature: "Cuentas de correos ILIMITADAS", status: "single" },
                { feature: "Certificado SSL gratis", status: "single" },
                { feature: "3x más rápido que Hosting Standardi", status: "single" },
                { feature: "Copia de seguridad semanal", status: "double" },
                { feature: "WordPress Stage", status: "double" },
                { feature: "Soporte 24/7", status: "double" },
                { feature: "WordPress 6.7.2 Instalado", status: "single" },
            ],
        },
        {
            id: 3,
            title: "WordPress Plan 3",
            subtitle: "Ideal para negocios en expansión.",
            monthly: {
                price: 14499,
                billingCycle: "/mes",
            },
            annual: {
                originalPrice: 14499,
                discountedPrice: 3499,
                billingCycle: "/mes",
                discountLabel: "75% OFF",
                bonus: "Incluye GRATIS 4 MESES",
            },
            features: [
                { feature: "1 Website", status: "double" },
                { feature: "200GB de almacenamiento SSD", status: "single" },
                { feature: "Dominio (ahorrá: $10.920)", status: "single" },
                { feature: "Cuentas de correos ILIMITADAS", status: "single" },
                { feature: "Certificado SSL gratis", status: "single" },
                { feature: "5x más rápido que Hosting Standard", status: "single" },
                { feature: "Copia de seguridad diaria", status: "single" },
                { feature: "WordPress Stage", status: "single" },
                { feature: "Soporte Preferencial 24/7", status: "single" },
                { feature: "WordPress 6.7.2 Instalado", status: "single" },
            ],
        },
        {
            id: 4,
            title: "WordPress Cloud",
            subtitle: "Para sitios y tiendas de alta demanda. Recursos exclusivos, staging, máxima performance, alta disponibilidad, y la posibilidad de escalar la capacidad de procesamiento y espacio.",
            monthly: {
                price: 9371,
                billingCycle: "/mes",
            },
            annual: {
                originalPrice: 9371,
                discountedPrice: 7028,
                billingCycle: "/mes",
                discountLabel: "25% OFF",
                bonus: "Incluye GRATIS 1 MES",
            },
            features: [
                { feature: "Ilimitados Websites", status: "single" },
                { feature: "50 GB SSD (Escalable)", status: "double" },
                { feature: "Dominio (ahorrá: $10.920)", status: "single" },
                { feature: "Cuentas de correos ILIMITADAS", status: "single" },
                { feature: "Certificado SSL gratis", status: "single" },
                { feature: "10x más rápido que Hosting Standard", status: "single" },
                { feature: "Copia de seguridad semanal", status: "single" },
                { feature: "WordPress Stage", status: "single" },
                { feature: "Soporte Preferencial 24/7", status: "single" },
                { feature: "Instalación WP a un click", status: "single" },
            ],
        },
    ],
  };