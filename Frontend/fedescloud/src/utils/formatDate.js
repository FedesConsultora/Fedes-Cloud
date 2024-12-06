// src/utils/formatDate.js
export const formatDate = (date) => {
    if (!date) return '';
    
    let d;
    
    if (typeof date === 'string') {
      // Si la fecha es una cadena, crear un objeto Date
      d = new Date(date);
    } else if (date instanceof Date) {
      // Si ya es un objeto Date
      d = date;
    } else {
      return '';
    }
  
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Los meses son 0-indexados
    const year = d.getFullYear();
  
    return `${day}/${month}/${year}`;
  };
  