import { AUTH_CONFIG } from '../config/auth';

export function isAllowedDomain(email: string | null | undefined): boolean {
  if (!email) return false;
  
  const domain = email.split('@')[1];
  if (!domain) return false;

  return AUTH_CONFIG.allowedDomains.includes(domain.toLowerCase());
}
