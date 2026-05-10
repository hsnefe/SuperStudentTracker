import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { Alert, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type CourseDetailSection = "home" | "materials" | "grades";

type Props = {
  activeSection: CourseDetailSection;
  onSelectSection: (section: CourseDetailSection) => void;
};

const PILL_BG = "rgba(15, 15, 18, 0.55)";

export function CourseDetailAppBar({ activeSection, onSelectSection }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const onPencil = () => {
    Alert.alert("Edit", "Coming soon.");
  };

  const goMainHome = () => {
    router.replace("/(tabs)");
  };

  return (
    <View style={[styles.row, { paddingTop: insets.top + 8 }]}>
      <Pressable
        onPress={goMainHome}
        accessibilityRole="button"
        accessibilityLabel="Go to home"
        hitSlop={12}
        style={styles.logoPress}
      >
        <Text style={styles.logo}>SST</Text>
      </Pressable>

      <View style={styles.pillWrap}>
        <View style={[styles.pill, { backgroundColor: PILL_BG }]}>
          {(["home", "materials", "grades"] as const).map((key) => {
            const label =
              key === "home" ? "Home" : key === "materials" ? "Materials" : "Grades";
            const selected = activeSection === key;
            return (
              <Pressable
                key={key}
                onPress={() => onSelectSection(key)}
                style={[styles.pillItem, selected && styles.pillItemSelected]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text style={[styles.pillLabel, selected && styles.pillLabelSelected]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.iconSlot}>
        <Pressable
          onPress={onPencil}
          style={styles.iconCircle}
          accessibilityRole="button"
          accessibilityLabel="Edit"
        >
          <MaterialIcons name="edit" size={20} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  logoPress: {
    width: 52,
    justifyContent: "center",
  },
  logo: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 1,
  },
  pillWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    minWidth: 0,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    padding: 4,
    gap: 4,
    borderWidth: Platform.OS === "web" ? 1 : StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.12)",
  },
  pillItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  pillItemSelected: {
    backgroundColor: "#fff",
  },
  pillLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.92)",
    letterSpacing: 0.6,
  },
  pillLabelSelected: {
    color: "#0f1115",
  },
  iconSlot: {
    width: 52,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.2)",
  },
});
