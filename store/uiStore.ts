import { create } from "zustand";

type UiState = {
  bootedAt: number;
  setBootedAt: (value: number) => void;
};

export const useUiStore = create<UiState>((set) => ({
  bootedAt: Date.now(),
  setBootedAt: (value) => set({ bootedAt: value }),
}));
