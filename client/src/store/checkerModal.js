import { create } from 'zustand';

export const useCheckerModal = create((set) => ({
  open: false,
  openChecker: () => set({ open: true }),
  closeChecker: () => set({ open: false }),
}));
