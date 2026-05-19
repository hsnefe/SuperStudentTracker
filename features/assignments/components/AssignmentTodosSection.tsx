import { StyleSheet, Text, View } from "react-native";
import type { AssignmentStripCardVariant } from "@/components/course/AssignmentStripCardBackground";
import { stripCardMetaColor, stripCardTitleColor } from "@/components/course/assignmentStripCardTypography";
import { useTheme } from "@/hooks";

type Props = {
  variant?: AssignmentStripCardVariant;
};

export function AssignmentTodosSection({ variant = 0 }: Props) {
  const { radius, spacing, typography } = useTheme();
  const titleColor = stripCardTitleColor(variant);
  const metaColor = stripCardMetaColor(variant);

  return (
    <View style={{ gap: spacing.md, marginTop: spacing.xl }}>
      <Text style={[typography.heading, { color: titleColor }]}>To-dos</Text>
      <View
        style={[
          styles.placeholder,
          {
            borderColor: "rgba(255,255,255,0.2)",
            borderRadius: radius.lg,
            padding: spacing.lg,
            gap: spacing.sm,
            backgroundColor: "rgba(0,0,0,0.18)",
          },
        ]}
      >
        <Text style={[typography.body, { color: metaColor }]}>
          To-do cards — coming in a later phase.
        </Text>
        {/* AssignmentTodoCards */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    borderWidth: 1,
  },
});
