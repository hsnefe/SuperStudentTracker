import { useCallback, useEffect, useRef, useState } from "react";
import { downloadMaterialPdf } from "../api/downloadMaterialPdf";
import type { CourseMaterial } from "@/types";

export type MaterialPdfLoadState =
  | { status: "idle" }
  | { status: "downloading"; progress: number; total: number }
  | { status: "ready"; localUri: string }
  | { status: "error"; message: string; oversize?: boolean };

type Options = {
  material: CourseMaterial | undefined;
  autoStart?: boolean;
};

export function useMaterialPdfSource({ material, autoStart = true }: Options) {
  const [state, setState] = useState<MaterialPdfLoadState>({ status: "idle" });
  const abortRef = useRef<AbortController | null>(null);
  const allowOversizeRef = useRef(false);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setState({ status: "idle" });
  }, []);

  const download = useCallback(
    async (allowOversize = false) => {
      if (!material) return;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      allowOversizeRef.current = allowOversize;

      setState({ status: "downloading", progress: 0, total: material.sizeBytes ?? 0 });

      try {
        const result = await downloadMaterialPdf(material, {
          signal: controller.signal,
          allowOversize,
          onProgress: (loaded, total) => {
            setState({ status: "downloading", progress: loaded, total });
          },
        });
        if (controller.signal.aborted) return;
        setState({ status: "ready", localUri: result.localUri });
      } catch (err) {
        if (controller.signal.aborted) return;
        const message = err instanceof Error ? err.message : "Could not download PDF.";
        const oversize = /5 MB/i.test(message);
        setState({ status: "error", message, oversize });
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
      }
    },
    [material],
  );

  const retry = useCallback(() => {
    void download(allowOversizeRef.current);
  }, [download]);

  const confirmOversize = useCallback(() => {
    void download(true);
  }, [download]);

  useEffect(() => {
    if (!autoStart || !material) return;
    void download(false);
    return () => {
      abortRef.current?.abort();
    };
  }, [autoStart, material?.id, download]);

  return {
    state,
    cancel,
    retry,
    confirmOversize,
    download,
  };
}
