import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as WebBrowser from "expo-web-browser";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks";
import type { CourseMaterial } from "@/types";
import { MaterialPdfPasswordModal } from "../components/MaterialPdfPasswordModal";
import { PdfViewerWebView } from "../components/PdfViewerWebView";
import { useMaterialPdfSource } from "../hooks/useMaterialPdfSource";
import {
  loadPdfHighlights,
  savePdfHighlights,
  type PdfHighlight,
} from "../lib/pdfHighlights";

type Props = {
  material: CourseMaterial;
};

export function MaterialPdfScreen({ material }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography, spacing, radius } = useTheme();

  const { state, cancel, retry, confirmOversize } = useMaterialPdfSource({ material });

  const [fullscreen, setFullscreen] = useState(false);
  const [pageInfo, setPageInfo] = useState({ page: 1, total: 0 });
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchNext, setSearchNext] = useState<boolean | null>(null);
  const [findCount, setFindCount] = useState(0);
  const [password, setPassword] = useState<string | undefined>();
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [highlights, setHighlights] = useState<PdfHighlight[]>(() =>
    loadPdfHighlights(material.id),
  );
  const [highlightRequest, setHighlightRequest] = useState(0);
  const [viewerError, setViewerError] = useState<string | null>(null);

  useEffect(() => {
    savePdfHighlights(material.id, highlights);
  }, [highlights, material.id]);

  const progressRatio = useMemo(() => {
    if (state.status !== "downloading") return 0;
    if (state.total > 0) return Math.min(1, state.progress / state.total);
    return state.progress > 0 ? 0.5 : 0;
  }, [state]);

  const openInBrowser = useCallback(async () => {
    try {
      await WebBrowser.openBrowserAsync(material.uri);
    } catch {
      Alert.alert("Could not open", "This file could not be opened in the browser.");
    }
  }, [material.uri]);

  const handleOversize = useCallback(() => {
    Alert.alert(
      "Large PDF",
      "This file is larger than 5 MB. Download anyway?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Download", onPress: () => confirmOversize() },
      ],
    );
  }, [confirmOversize]);

  useEffect(() => {
    if (state.status === "error" && state.oversize) {
      handleOversize();
    }
  }, [state, handleOversize]);

  const onHighlightAdded = useCallback(
    (partial: { page: number; rects: PdfHighlight["rects"] }) => {
      setHighlights((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${prev.length}`,
          page: partial.page,
          rects: partial.rects,
        },
      ]);
    },
    [],
  );

  const toolbar = !fullscreen ? (
    <View
      style={[
        styles.toolbar,
        {
          paddingTop: insets.top + spacing.sm,
          paddingHorizontal: spacing.md,
          paddingBottom: spacing.sm,
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={8}
      >
        <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
      </Pressable>
      <Text
        style={[
          typography.body,
          styles.title,
          { color: colors.textPrimary, fontWeight: "600" },
        ]}
        numberOfLines={1}
      >
        {material.title}
      </Text>
      <View style={styles.toolbarActions}>
        <Pressable
          onPress={() => setSearchOpen((v) => !v)}
          hitSlop={8}
          accessibilityLabel="Search in PDF"
        >
          <MaterialIcons
            name="search"
            size={22}
            color={searchOpen ? colors.accent : colors.textSecondary}
          />
        </Pressable>
        <Pressable
          onPress={() => setHighlightRequest((n) => n + 1)}
          hitSlop={8}
          accessibilityLabel="Highlight selection"
        >
          <MaterialIcons name="border-color" size={22} color={colors.textSecondary} />
        </Pressable>
        <Pressable
          onPress={() => setFullscreen(true)}
          hitSlop={8}
          accessibilityLabel="Enter fullscreen"
        >
          <MaterialIcons name="fullscreen" size={22} color={colors.textSecondary} />
        </Pressable>
      </View>
    </View>
  ) : (
    <Pressable
      style={[styles.fullscreenExit, { top: insets.top + spacing.sm, right: spacing.md }]}
      onPress={() => setFullscreen(false)}
      accessibilityLabel="Exit fullscreen"
    >
      <MaterialIcons name="fullscreen-exit" size={26} color="#fff" />
    </Pressable>
  );

  const searchBar = searchOpen && !fullscreen && state.status === "ready" ? (
    <View
      style={[
        styles.searchRow,
        {
          paddingHorizontal: spacing.md,
          paddingBottom: spacing.sm,
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <TextInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search in PDF"
        placeholderTextColor={colors.textMuted}
        returnKeyType="search"
        onSubmitEditing={() => setSearchNext(null)}
        style={[
          styles.searchInput,
          {
            backgroundColor: colors.primaryDark,
            borderColor: colors.border,
            borderRadius: radius.md,
            color: colors.textPrimary,
            paddingHorizontal: spacing.md,
          },
        ]}
      />
      <Pressable onPress={() => setSearchNext(false)} hitSlop={8}>
        <MaterialIcons name="keyboard-arrow-up" size={28} color={colors.textSecondary} />
      </Pressable>
      <Pressable onPress={() => setSearchNext(true)} hitSlop={8}>
        <MaterialIcons name="keyboard-arrow-down" size={28} color={colors.textSecondary} />
      </Pressable>
      {findCount > 0 ? (
        <Text style={[typography.caption, { color: colors.textMuted }]}>{findCount}</Text>
      ) : null}
    </View>
  ) : null;

  let body: ReactNode = null;

  if (state.status === "idle" || state.status === "downloading") {
    body = (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.md }]}>
          Downloading PDF…
        </Text>
        <View style={[styles.progressTrack, { backgroundColor: colors.border, marginTop: spacing.md }]}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: colors.accent, width: `${Math.round(progressRatio * 100)}%` },
            ]}
          />
        </View>
        <Pressable
          onPress={cancel}
          style={[styles.secondaryBtn, { borderColor: colors.border, marginTop: spacing.lg }]}
        >
          <Text style={[typography.body, { color: colors.textSecondary }]}>Cancel</Text>
        </Pressable>
      </View>
    );
  } else if (state.status === "error" && !state.oversize) {
    body = (
      <View style={styles.centered}>
        <Text style={[typography.body, { color: colors.textSecondary, textAlign: "center" }]}>
          {state.message}
        </Text>
        <View style={[styles.errorActions, { marginTop: spacing.lg, gap: spacing.sm }]}>
          <Pressable
            onPress={retry}
            style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
          >
            <Text style={[typography.body, { color: "#111", fontWeight: "600" }]}>Retry</Text>
          </Pressable>
          <Pressable
            onPress={() => void openInBrowser()}
            style={[styles.secondaryBtn, { borderColor: colors.border }]}
          >
            <Text style={[typography.body, { color: colors.textSecondary }]}>Open in browser</Text>
          </Pressable>
        </View>
      </View>
    );
  } else if (state.status === "ready") {
    body = (
      <>
        <PdfViewerWebView
          localUri={state.localUri}
          highlights={highlights}
          password={password}
          pendingPassword={passwordModalOpen}
          searchQuery={searchOpen ? searchQuery : undefined}
          searchNext={searchNext}
          highlightRequest={highlightRequest}
          onNeedPassword={() => setPasswordModalOpen(true)}
          onError={(message) => setViewerError(message)}
          onPageChange={(page, total) => setPageInfo({ page, total })}
          onFindResult={(count) => setFindCount(count)}
          onHighlightAdded={onHighlightAdded}
        />
        {viewerError ? (
          <View style={[styles.viewerError, { backgroundColor: colors.surface }]}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>{viewerError}</Text>
          </View>
        ) : null}
        {!fullscreen && pageInfo.total > 0 ? (
          <Text
            style={[
              typography.caption,
              styles.pageIndicator,
              { color: colors.textMuted, paddingBottom: insets.bottom + spacing.xs },
            ]}
          >
            Page {pageInfo.page} / {pageInfo.total}
          </Text>
        ) : null}
      </>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {toolbar}
      {searchBar}
      <View style={styles.viewer}>{body}</View>
      <MaterialPdfPasswordModal
        visible={passwordModalOpen}
        onCancel={() => {
          setPasswordModalOpen(false);
          router.back();
        }}
        onSubmit={(value) => {
          setPassword(value);
          setPasswordModalOpen(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  title: { flex: 1 },
  toolbarActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 8,
  },
  viewer: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  progressTrack: {
    width: "80%",
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: { height: "100%" },
  errorActions: { width: "100%" },
  primaryBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  secondaryBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  fullscreenExit: {
    position: "absolute",
    zIndex: 20,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 20,
    padding: 6,
  },
  pageIndicator: { textAlign: "center" },
  viewerError: {
    position: "absolute",
    bottom: 32,
    left: 16,
    right: 16,
    padding: 8,
    borderRadius: 8,
  },
});
