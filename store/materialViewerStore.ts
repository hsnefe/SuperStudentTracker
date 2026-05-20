import { create } from "zustand";
import {
  getMaterialViewerMode,
  setMaterialViewerMode,
  type MaterialViewerMode,
} from "@/features/materials/lib/materialViewerPreference";

type MaterialViewerState = {
  mode: MaterialViewerMode;
  hydrated: boolean;
  hydrate: () => void;
  setMode: (mode: MaterialViewerMode) => void;
};

export const useMaterialViewerStore = create<MaterialViewerState>((set) => ({
  mode: "in_app",
  hydrated: false,
  hydrate: () => {
    set({ mode: getMaterialViewerMode(), hydrated: true });
  },
  setMode: (mode) => {
    setMaterialViewerMode(mode);
    set({ mode });
  },
}));
