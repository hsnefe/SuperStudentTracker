import { create } from "zustand";

export type TransitionOriginRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type NavigationTransitionState = {
  origin: TransitionOriginRect | null;
  setOrigin: (rect: TransitionOriginRect) => void;
  clearOrigin: () => void;
};

export const useNavigationTransitionStore = create<NavigationTransitionState>((set) => ({
  origin: null,
  setOrigin: (origin) => set({ origin }),
  clearOrigin: () => set({ origin: null }),
}));
