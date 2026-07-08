import { create } from "zustand";

type ExperienceState = {
  started: boolean;
  locked: boolean;
  nearbyProjectId: string | null;
  activeProjectId: string | null;
  start: () => void;
  setLocked: (locked: boolean) => void;
  setNearbyProjectId: (id: string | null) => void;
  openProject: (id: string) => void;
  closeProject: () => void;
};

export const useExperienceStore = create<ExperienceState>((set) => ({
  started: false,
  locked: false,
  nearbyProjectId: null,
  activeProjectId: null,
  start: () => set({ started: true }),
  setLocked: (locked) => set({ locked }),
  setNearbyProjectId: (id) => set({ nearbyProjectId: id }),
  openProject: (id) => set({ activeProjectId: id }),
  closeProject: () => set({ activeProjectId: null }),
}));
