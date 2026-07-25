import { AccountType, LoginCredentials } from '../types';

/**
 * Credentials for the three pre-created accounts, one per type. They are made
 * once by hand and reused every run, auth.setup logs into each one and saves the
 * session. Values come from .env (copy .env.example), which is git-ignored so
 * the real secrets never get committed.
 */
const ENV_KEYS: Record<AccountType, { email: string; password: string }> = {
  personal: { email: 'PERSONAL_EMAIL', password: 'PERSONAL_PASSWORD' },
  business: { email: 'BUSINESS_EMAIL', password: 'BUSINESS_PASSWORD' },
  clients: { email: 'CLIENTS_EMAIL', password: 'CLIENTS_PASSWORD' },
};

export function credentialsFor(account: AccountType): LoginCredentials {
  const keys = ENV_KEYS[account];
  const email = process.env[keys.email];
  const password = process.env[keys.password];

  if (!email || !password) {
    throw new Error(
      `Missing credentials for the '${account}' account. Set ${keys.email} and ` +
        `${keys.password} in .env (copy .env.example and fill the three accounts).`,
    );
  }

  return { email, password };
}
