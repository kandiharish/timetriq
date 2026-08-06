import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectPath?: string;
}

/**
 * A component that conditionally renders its children based on the current user's role.
 * If the user does not have an allowed role, it will either:
 * 1. Navigate to the `redirectPath` (if provided)
 * 2. Render the `fallback` component (if provided)
 * 3. Render nothing (default)
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  allowedRoles, 
  children, 
  fallback = null, 
  redirectPath 
}) => {
  const { hasRole, loading } = useAuth();

  if (loading) {
    return null; // Or a loading spinner
  }

  if (!hasRole(allowedRoles)) {
    if (redirectPath) {
      return <Navigate to={redirectPath} replace />;
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
