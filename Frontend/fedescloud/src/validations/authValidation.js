// src/validations/authValidation.js
import * as yup from 'yup';

// Esquema de validación para registro
export const registerValidationSchema = yup.object().shape({
  nombre: yup
    .string()
    .required('El nombre es obligatorio')
    .max(50, 'El nombre no puede exceder los 50 caracteres'),
  apellido: yup
    .string()
    .required('El apellido es obligatorio')
    .max(50, 'El apellido no puede exceder los 50 caracteres'),
  email: yup
    .string()
    .required('El email es obligatorio')
    .email('Debe ser un email válido')
    .max(100, 'El email no puede exceder los 100 caracteres'),
  password: yup
    .string()
    .required('La contraseña es obligatoria')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .matches(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
    .matches(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
    .matches(/\d/, 'La contraseña debe contener al menos un número')
    .matches(/[@$!%*?&]/, 'La contraseña debe contener al menos un carácter especial (@, $, !, %, *, ?, &)')
    .max(100, 'La contraseña no puede exceder los 100 caracteres'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Las contraseñas deben coincidir')
    .required('Confirmar contraseña es obligatorio'),
  fechaNacimiento: yup
    .date()
    .required('La fecha de nacimiento es obligatoria')
    .test('age', 'Debe ser mayor de 18 años para registrarse', function (value) {
      const today = new Date();
      const birthDate = new Date(value);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 18;
    }),
});

// Esquema de validación para inicio de sesión
export const loginValidationSchema = yup.object().shape({
  email: yup
    .string()
    .required('El email es obligatorio')
    .email('Debe ser un email válido')
    .max(100, 'El email no puede exceder los 100 caracteres'),
  password: yup
    .string()
    .required('La contraseña es obligatoria')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .matches(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
    .matches(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
    .matches(/\d/, 'La contraseña debe contener al menos un número')
    .matches(/[@$!%*?&]/, 'La contraseña debe contener al menos un carácter especial (@, $, !, %, *, ?, &)')
    .max(100, 'La contraseña no puede exceder los 100 caracteres'),
});

// Esquema de validación para solicitar restablecimiento de contraseña
export const requestPasswordResetValidationSchema = yup.object().shape({
  email: yup
    .string()
    .required('El email es obligatorio')
    .email('Debe ser un email válido')
    .max(100, 'El email no puede exceder los 100 caracteres'),
});

// Esquema de validación para restablecer contraseña
export const resetPasswordValidationSchema = yup.object().shape({
  token: yup.string().required('El token es obligatorio'),
  email: yup.string().required('El email es obligatorio').email('Debe ser un email válido'),
  password: yup
    .string()
    .required('La contraseña es obligatoria')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .matches(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
    .matches(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
    .matches(/\d/, 'La contraseña debe contener al menos un número')
    .matches(/[@$!%*?&]/, 'La contraseña debe contener al menos un carácter especial (@, $, !, %, *, ?, &)')
    .max(100, 'La contraseña no puede exceder los 100 caracteres'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Las contraseñas deben coincidir')
    .required('Confirmar contraseña es obligatorio'),
});
