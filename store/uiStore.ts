import { create } from "zustand";

type UiState = {
  selectedDate: string;
  setSelectedDate: (value: string) => void;
};

export const useUiStore = create<UiState>((set) => ({
  selectedDate: new Date().toISOString().slice(0, 10),
  setSelectedDate: (value) => set({ selectedDate: value }),
}));
