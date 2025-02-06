// src/validations/acceptInvitationValidation.js
import * as yup from 'yup';

export const acceptInvitationSchema = yup.object().shape({
  newPassword: yup
    .string()
    .required('La contraseña es obligatoria')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .trim(),
  nombre: yup
    .string()
    .required('El nombre es obligatorio')
    .max(50, 'El nombre no puede exceder los 50 caracteres')
    .trim(),
  apellido: yup
    .string()
    .required('El apellido es obligatorio')
    .max(50, 'El apellido no puede exceder los 50 caracteres')
    .trim(),
  fechaNacimiento: yup
    .date()
    .required('La fecha de nacimiento es obligatoria'),
});
