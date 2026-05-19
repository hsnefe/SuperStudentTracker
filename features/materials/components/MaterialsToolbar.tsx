import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/hooks";

type Props = {
  onFilterPress: () => void;
  onSortPress: () => void;
  onAddPress: () => void;
  filterActive?: boolean;
  sortActive?: boolean;
};

export function MaterialsToolbar({
  onFilterPress,
  onSortPress,
  onAddPress,
  filterActive,
  sortActive,
}: Props) {
  const { typography, spacing } = useTheme();

  return (
    <View style={[styles.bar, { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }]}>
      <Text style={[typography.title, styles.title]} accessibilityRole="header">
        MATERIALS
      </Text>
      <View style={styles.actions}>
        <Pressable
          onPress={onFilterPress}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Filter materials"
          style={[styles.iconBtn, filterActive && styles.iconBtnActive]}
        >
          <MaterialIcons
            name="filter-list"
            size={24}
            color={filterActive ? "#FFC85C" : "rgba(255,255,255,0.85)"}
          />
        </Pressable>
        <Pressable
          onPress={onSortPress}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Sort materials"
          style={[styles.iconBtn, sortActive && styles.iconBtnActive]}
        >
          <MaterialIcons
            name="sort"
            size={24}
            color={sortActive ? "#FFC85C" : "rgba(255,255,255,0.85)"}
          />
        </Pressable>
        <Pressable
          onPress={onAddPress}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Add material"
          style={styles.iconBtn}
        >
          <MaterialIcons name="add" size={26} color="#FFC85C" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 4,
  },
  title: {
    color: "rgba(255,255,255,0.92)",
    letterSpacing: 0.6,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  iconBtn: {
    padding: 4,
    borderRadius: 8,
  },
  iconBtnActive: {
    backgroundColor: "rgba(255,200,92,0.12)",
  },
});
