export const ROLES = {
  ADMIN: 'ADMINQL',
  USER: 'USER',
};

export const isAdminRole = (role: string) => role === ROLES.ADMIN; 