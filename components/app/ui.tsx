import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Appearance,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";

const darkPalette = {
  bg: "#0A0F14",
  surface: "#121A22",
  surfaceAlt: "#17222D",
  border: "#263542",
  text: "#F2F7FA",
  muted: "#8A9AA8",
  lime: "#37BB54", // ForgeFit Logo Green
  limeSoft: "#133875", // ForgeFit Logo Blue Dark
  blue: "#133875", // ForgeFit Logo Blue
  blueSoft: "#123044",
  success: "#37BB54", // ForgeFit Logo Green
  warning: "#FFC857",
  danger: "#FF6B6B",
  white: "#FFFFFF",
};

const lightPalette = {
  bg: "#F4F7F9",
  surface: "#FFFFFF",
  surfaceAlt: "#E6EDF2",
  border: "#D0DCE5",
  text: "#0A0F14",
  muted: "#5C7080",
  lime: "#37BB54", // ForgeFit Logo Green
  limeSoft: "#E0F2C2",
  blue: "#133875", // ForgeFit Logo Blue
  blueSoft: "#D6EEFA",
  success: "#37BB54", // ForgeFit Logo Green
  warning: "#B37700",
  danger: "#CC1A1A",
  white: "#000000",
};

// Evaluate once on file load based on system preference (requires app reload to change)
export const palette =
  Appearance.getColorScheme() === "light" ? lightPalette : darkPalette;

export function AppCard({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? (
        <Pressable
          onPress={onAction}
          style={({ pressed }) => [
            styles.textAction,
            pressed && styles.pressed,
          ]}>
          <Text style={styles.textActionLabel}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  icon = "arrow-forward",
  variant = "lime",
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  icon?: keyof typeof MaterialIcons.glyphMap;
  variant?: "lime" | "ghost" | "blue" | "danger";
  disabled?: boolean;
}) {
  const variantStyle =
    variant === "ghost"
      ? styles.buttonGhost
      : variant === "blue"
        ? styles.buttonBlue
        : variant === "danger"
          ? styles.buttonDanger
          : styles.buttonLime;
  const textStyle =
    variant === "ghost"
      ? styles.buttonGhostText
      : variant === "lime"
        ? styles.buttonLimeText
        : styles.buttonDarkText;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        variantStyle,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}>
      <Text style={textStyle}>{label}</Text>
      <MaterialIcons
        name={icon}
        size={19}
        color={variant === "ghost" ? palette.text : palette.bg}
      />
    </Pressable>
  );
}

export function IconButton({
  icon,
  onPress,
  label,
  accent = false,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
  label?: string;
  accent?: boolean;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        accent && styles.iconButtonAccent,
        pressed && styles.pressed,
      ]}>
      <MaterialIcons
        name={icon}
        size={20}
        color={accent ? palette.bg : palette.text}
      />
    </Pressable>
  );
}

export function Metric({
  label,
  value,
  detail,
  tone = "lime",
}: {
  label: string;
  value: string;
  detail?: string;
  tone?: "lime" | "blue" | "white";
}) {
  const valueColor =
    tone === "blue"
      ? palette.blue
      : tone === "white"
        ? palette.text
        : palette.lime;
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color: valueColor }]}>{value}</Text>
      {detail ? <Text style={styles.metricDetail}>{detail}</Text> : null}
    </View>
  );
}

export function Chip({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "lime" | "blue" | "success" | "warning";
}) {
  const chipStyle =
    tone === "lime"
      ? styles.chipLime
      : tone === "blue"
        ? styles.chipBlue
        : tone === "success"
          ? styles.chipSuccess
          : tone === "warning"
            ? styles.chipWarning
            : styles.chip;
  const textStyle =
    tone === "lime"
      ? styles.chipTextLime
      : tone === "blue"
        ? styles.chipTextBlue
        : tone === "success"
          ? styles.chipTextSuccess
          : tone === "warning"
            ? styles.chipTextWarning
            : styles.chipText;
  return (
    <View style={[styles.chip, chipStyle]}>
      <Text style={textStyle}>{label}</Text>
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  detail,
  children,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  detail: string;
  children?: ReactNode;
}) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <MaterialIcons name={icon} color={palette.lime} size={28} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDetail}>{detail}</Text>
      {children ? <View style={styles.emptyAction}>{children}</View> : null}
    </View>
  );
}

export function AppInput({
  label,
  ...props
}: { label?: string } & TextInputProps) {
  return (
    <View style={styles.inputGroup}>
      {label ? <Text style={styles.inputLabel}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={palette.muted}
        style={styles.input}
        {...props}
      />
    </View>
  );
}

export function NumberStep({
  value,
  onChange,
  step = 1,
  min = 0,
  suffix = "",
}: {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  suffix?: string;
}) {
  return (
    <View style={styles.stepper}>
      <Pressable
        onPress={() =>
          onChange(Math.max(min, Math.round((value - step) * 100) / 100))
        }
        style={({ pressed }) => [styles.stepButton, pressed && styles.pressed]}>
        <MaterialIcons name="remove" size={18} color={palette.text} />
      </Pressable>
      <Text style={styles.stepValue}>
        {value}
        {suffix}
      </Text>
      <Pressable
        onPress={() => onChange(Math.round((value + step) * 100) / 100)}
        style={({ pressed }) => [
          styles.stepButton,
          styles.stepButtonPlus,
          pressed && styles.pressed,
        ]}>
        <MaterialIcons name="add" size={18} color={palette.bg} />
      </Pressable>
    </View>
  );
}

export function BarChart({
  values,
  labels,
}: {
  values: number[];
  labels: string[];
}) {
  const highest = Math.max(...values, 1);
  return (
    <View style={styles.chart}>
      <View style={styles.bars}>
        {values.map((value, index) => (
          <View key={`${labels[index]}-${index}`} style={styles.barSlot}>
            <View
              style={[
                styles.bar,
                {
                  height: `${Math.max(12, Math.round((value / highest) * 100))}%`,
                  backgroundColor:
                    index === values.length - 1 ? palette.lime : palette.blue,
                },
              ]}
            />
            <Text style={styles.barLabel}>{labels[index]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={palette.lime} />
      <Text style={styles.loadingText}>Cargando tu diario local…</Text>
    </View>
  );
}

export const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 22,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 11,
    marginTop: 8,
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  textAction: { paddingVertical: 5, paddingLeft: 12 },
  textActionLabel: { color: palette.lime, fontSize: 13, fontWeight: "800" },
  button: {
    minHeight: 48,
    borderRadius: 15,
    paddingHorizontal: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  buttonLime: { backgroundColor: palette.lime },
  buttonBlue: { backgroundColor: palette.blue },
  buttonDanger: { backgroundColor: palette.danger },
  buttonGhost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: palette.border,
  },
  buttonLimeText: { color: palette.bg, fontWeight: "900", fontSize: 14 },
  buttonDarkText: { color: palette.bg, fontWeight: "900", fontSize: 14 },
  buttonGhostText: { color: palette.text, fontWeight: "800", fontSize: 14 },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
  iconButton: {
    height: 40,
    width: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.surfaceAlt,
    borderWidth: 1,
    borderColor: palette.border,
  },
  iconButtonAccent: {
    backgroundColor: palette.lime,
    borderColor: palette.lime,
  },
  metric: { flex: 1, gap: 3 },
  metricLabel: {
    color: palette.muted,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    fontWeight: "800",
  },
  metricValue: { fontSize: 24, fontWeight: "900", letterSpacing: -0.8 },
  metricDetail: { color: palette.muted, fontSize: 11 },
  chip: {
    alignSelf: "flex-start",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: palette.surfaceAlt,
  },
  chipLime: { backgroundColor: palette.limeSoft },
  chipBlue: { backgroundColor: palette.blueSoft },
  chipSuccess: { backgroundColor: "#143426" },
  chipWarning: { backgroundColor: "#3D3013" },
  chipText: { color: palette.muted, fontSize: 11, fontWeight: "800" },
  chipTextLime: { color: palette.lime, fontSize: 11, fontWeight: "800" },
  chipTextBlue: { color: palette.blue, fontSize: 11, fontWeight: "800" },
  chipTextSuccess: { color: palette.success, fontSize: 11, fontWeight: "800" },
  chipTextWarning: { color: palette.warning, fontSize: 11, fontWeight: "800" },
  emptyState: {
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 18,
  },
  emptyIcon: {
    height: 58,
    width: 58,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.limeSoft,
    marginBottom: 14,
  },
  emptyTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  emptyDetail: {
    color: palette.muted,
    fontSize: 14,
    textAlign: "center",
    marginTop: 7,
    lineHeight: 20,
  },
  emptyAction: { width: "100%", marginTop: 18 },
  inputGroup: { gap: 6 },
  inputLabel: { color: palette.muted, fontSize: 12, fontWeight: "800" },
  input: {
    minHeight: 48,
    color: palette.text,
    fontSize: 15,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: palette.surfaceAlt,
    borderColor: palette.border,
    borderWidth: 1,
  },
  stepper: { flexDirection: "row", alignItems: "center", gap: 9 },
  stepButton: {
    height: 32,
    width: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.surfaceAlt,
    borderColor: palette.border,
    borderWidth: 1,
  },
  stepButtonPlus: { backgroundColor: palette.lime, borderColor: palette.lime },
  stepValue: {
    minWidth: 42,
    color: palette.text,
    fontSize: 14,
    fontWeight: "900",
    textAlign: "center",
  },
  chart: { height: 138, paddingTop: 8 },
  bars: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 8,
  },
  barSlot: {
    flex: 1,
    height: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 6,
  },
  bar: { width: "100%", borderRadius: 8, minHeight: 8 },
  barLabel: { color: palette.muted, fontSize: 10, fontWeight: "700" },
  loading: {
    flex: 1,
    backgroundColor: palette.bg,
    alignItems: "center",
    justifyContent: "center",
    gap: 15,
  },
  loadingText: { color: palette.muted, fontSize: 14 },
});
