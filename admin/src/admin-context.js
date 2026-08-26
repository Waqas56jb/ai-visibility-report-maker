import { createContext, useContext } from 'react';

export const AdminCtx = createContext(null);

export function useAdmin() {
  return useContext(AdminCtx);
}
