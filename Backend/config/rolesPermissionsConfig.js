// config/rolesPermissionsConfig.js
export const rolesPermissionsConfig = {
    Admin: [
      'manage_users',
      'manage_roles',
      'manage_permissions',
      'manage_actions',
      'manage_authentications',
      'manage_two_factor_auth',
      'manage_services',
      'view_services',
      'update_services',
      'delete_services',
    ],
    Interno: [
      // Personaliza a tu gusto
      'manage_users',
      'manage_two_factor_auth',
      'view_services',
      'update_services',
    ],
    Externo: [
      'view_services',
    ],
  };
  