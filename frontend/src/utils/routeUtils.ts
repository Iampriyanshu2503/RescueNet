/**
 * Get the dashboard route for a specific user role
 * @param role - The user's role
 * @returns The dashboard route for the role
 */
export const getDashboardRoute = (role: string): string => {
  switch (role) {
    case 'donor':
      return '/donor-dashboard';
    case 'recipient':
      return '/recipient-dashboard';
    case 'volunteer':
      return '/volunteer-dashboard';
    default:
      return '/';
  }
};

/**
 * Check if a user has access to a specific route based on their role
 * @param userRole - The user's role
 * @param requiredRole - The role required to access the route
 * @returns True if the user has access, false otherwise
 */
export const hasRoleAccess = (userRole: string, requiredRole: string): boolean => {
  return userRole === requiredRole;
};