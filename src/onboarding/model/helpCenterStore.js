import { create } from 'zustand';

/**
 * Small UI store for the Help Center: lets any surface (sidebar, command
 * palette, empty states) reopen the "How Ryokai works" experience without
 * prop-drilling through layouts.
 */
export const useHelpCenterStore = create((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
