import * as Clipboard from "expo-clipboard";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import type { PdfHighlight } from "../lib/pdfHighlights";
import { PDF_VIEWER_HTML } from "../lib/pdfViewerHtml";
import { readPdfAsBase64 } from "../lib/readPdfAsBase64";

export type PdfViewerBridgeMessage =
  | { type: "ready" }
  | { type: "loaded"; pages: number }
  | { type: "error"; message: string }
  | { type: "needPassword" }
  | { type: "page"; page: number; total: number }
  | { type: "findResult"; count: number; index: number }
  | { type: "highlightAdded"; highlight: { page: number; rects: PdfHighlight["rects"] } }
  | { type: "copy"; text: string };

type Props = {
  localUri: string;
  highlights: PdfHighlight[];
  onReady?: () => void;
  onLoaded?: (pages: number) => void;
  onError?: (message: string) => void;
  onNeedPassword?: () => void;
  onPageChange?: (page: number, total: number) => void;
  onFindResult?: (count: number, index: number) => void;
  onHighlightAdded?: (highlight: { page: number; rects: PdfHighlight["rects"] }) => void;
  password?: string;
  pendingPassword?: boolean;
  searchQuery?: string;
  searchNext?: boolean | null;
  highlightRequest?: number;
};

export function PdfViewerWebView({
  localUri,
  highlights,
  onReady,
  onLoaded,
  onError,
  onNeedPassword,
  onPageChange,
  onFindResult,
  onHighlightAdded,
  password,
  pendingPassword,
  searchQuery,
  searchNext,
  highlightRequest,
}: Props) {
  const webRef = useRef<WebView>(null);
  const [viewerReady, setViewerReady] = useState(false);
  const base64Ref = useRef<string | null>(null);

  const postToViewer = useCallback((payload: object) => {
    webRef.current?.postMessage(JSON.stringify(payload));
  }, []);

  const loadPdfIntoViewer = useCallback(async () => {
    if (!viewerReady) return;
    try {
      const base64 = base64Ref.current ?? (await readPdfAsBase64(localUri));
      base64Ref.current = base64;
      postToViewer({
        type: pendingPassword ? "password" : "load",
        base64,
        value: password,
        highlights,
      });
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "Could not read PDF file.");
    }
  }, [viewerReady, localUri, highlights, password, pendingPassword, postToViewer, onError]);

  useEffect(() => {
    base64Ref.current = null;
  }, [localUri]);

  useEffect(() => {
    void loadPdfIntoViewer();
  }, [loadPdfIntoViewer]);

  useEffect(() => {
    if (!viewerReady || password === undefined) return;
    void loadPdfIntoViewer();
  }, [password, viewerReady, loadPdfIntoViewer]);

  useEffect(() => {
    if (!viewerReady || searchQuery === undefined) return;
    if (searchNext != null) {
      postToViewer({ type: "find", findNext: searchNext });
    } else {
      postToViewer({ type: "find", query: searchQuery });
    }
  }, [searchQuery, searchNext, viewerReady, postToViewer]);

  useEffect(() => {
    if (!viewerReady || highlightRequest == null) return;
    postToViewer({ type: "highlight" });
  }, [highlightRequest, viewerReady, postToViewer]);

  useEffect(() => {
    if (!viewerReady) return;
    postToViewer({ type: "setHighlights", highlights });
  }, [highlights, viewerReady, postToViewer]);

  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const msg = JSON.parse(event.nativeEvent.data) as PdfViewerBridgeMessage;
        switch (msg.type) {
          case "ready":
            setViewerReady(true);
            onReady?.();
            break;
          case "loaded":
            onLoaded?.(msg.pages);
            break;
          case "error":
            onError?.(msg.message);
            break;
          case "needPassword":
            onNeedPassword?.();
            break;
          case "page":
            onPageChange?.(msg.page, msg.total);
            break;
          case "findResult":
            onFindResult?.(msg.count, msg.index);
            break;
          case "highlightAdded":
            onHighlightAdded?.(msg.highlight);
            break;
          case "copy":
            void Clipboard.setStringAsync(msg.text);
            break;
          default:
            break;
        }
      } catch {
        /* ignore malformed messages */
      }
    },
    [onReady, onLoaded, onError, onNeedPassword, onPageChange, onFindResult, onHighlightAdded],
  );

  return (
    <View style={styles.root}>
      <WebView
        ref={webRef}
        originWhitelist={["*"]}
        source={{ html: PDF_VIEWER_HTML }}
        style={styles.webview}
        onMessage={onMessage}
        javaScriptEnabled
        domStorageEnabled
        allowFileAccess
        allowUniversalAccessFromFileURLs={Platform.OS === "android"}
        scalesPageToFit={Platform.OS === "ios"}
        setBuiltInZoomControls={Platform.OS === "android"}
        setDisplayZoomControls={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  webview: { flex: 1, backgroundColor: "#0b0b0c" },
});
