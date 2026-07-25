import { AccountType } from '../types';

// Where each account type's saved login session is stored. Kept in one place so
// auth.setup.ts (which writes the session) and fixtures.ts (which loads it)
// can never drift apart.
export const AUTH_DIR = '.auth';

export function sessionStatePath(account: AccountType): string {
  return `${AUTH_DIR}/${account}.json`;
}
