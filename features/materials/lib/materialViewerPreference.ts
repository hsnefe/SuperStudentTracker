import { Platform } from "react-native";
import { readCache, writeCache } from "@/lib/sqliteCache";

export type MaterialViewerMode = "in_app" | "browser";

const CACHE_KEY = "material_pdf_viewer_mode";

export function getMaterialViewerMode(): MaterialViewerMode {
  if (Platform.OS === "web" && typeof localStorage !== "undefined") {
    const webValue = localStorage.getItem(CACHE_KEY);
    return webValue === "browser" ? "browser" : "in_app";
  }
  const cached = readCache<MaterialViewerMode>(CACHE_KEY);
  return cached === "browser" ? "browser" : "in_app";
}

export function setMaterialViewerMode(mode: MaterialViewerMode): void {
  if (Platform.OS === "web" && typeof localStorage !== "undefined") {
    localStorage.setItem(CACHE_KEY, mode);
    return;
  }
  writeCache(CACHE_KEY, mode);
}
