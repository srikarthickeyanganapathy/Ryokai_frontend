import { create } from 'zustand';

/**
 * Global "start the tour now" signal. Lets any surface (setup checklist,
 * Help Center) launch the 30-second tour on demand — the tour component
 * consumes the request once it is on the dashboard.
 */
export const useTourStore = create((set) => ({
  pending: false,
  requestTour: () => set({ pending: true }),
  consumeRequest: () => set({ pending: false }),
}));
