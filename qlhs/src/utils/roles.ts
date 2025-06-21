export const ROLES = {
  ADMIN: 'adminql',
  USER: 'user',
};

export const isAdminRole = (role: string) => role === ROLES.ADMIN; 