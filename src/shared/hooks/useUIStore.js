import { create } from 'zustand';

export const useUIStore = create((set) => ({
  isCommandPaletteOpen: false,
  setCommandPaletteOpen: (isOpen) => set({ isCommandPaletteOpen: isOpen }),
  toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
  
  isNotificationsOpen: false,
  setNotificationsOpen: (isOpen) => set({ isNotificationsOpen: isOpen }),
  toggleNotifications: () => set((state) => ({ isNotificationsOpen: !state.isNotificationsOpen })),
  
  taskModalId: null,
  setTaskModalId: (id) => set({ taskModalId: id }),
  
  isNewTaskOpen: false,
  setIsNewTaskOpen: (isOpen) => set({ isNewTaskOpen: isOpen }),
}));
