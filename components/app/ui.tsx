import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { type ReactNode, useState } from "react";
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

import Svg, { Path } from "react-native-svg";

export function Logo({
  width = 32,
  height = 32,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 875 751">
      <Path
        fill={palette.blueSoft}
        d="M532,359h78l54,1l1,3l-15,22l-12,17l-14,19l-11,14l-13,16l-8,10l-12,14l-13,15l-16,17l-7,7l-7,8l-15,14l-11,11 l-8,7l-11,10l-11,9l-15,13l-10,8l-18,14l-14,10l-9,6l-4,4h-2l2-6l81-162l1-3l-29,3l-27,5l-32,8l-23,8l-22,9l-4,2l-14,27l-16,32 l-10,19l-10,21l-10,19l-10,21l-10,19l-11,23l-13,26l-10,21l-8,16l-8,15H86l2-6l14-28l13-28l12-24l11-23l19-39l11-22l12-22l10-17 l10-15l12-16l9-11l9-10l7-8l15-15l8-7l13-11l19-14l21-14l21-12l22-11l26-11l34-11l26-6l26-5l24-3l21-2L532,359z"
      />
      <Path
        fill={palette.blue}
        d="M397,115h40l19,4l16,7l13,9l10,10l8,12l5,14v14l-3,6l-5,4l-22,10l-16,8l-21,11l-23,13l-22,13l-20,13l-20,14 l-16,13l-10,8l-13,11l-15,14l-6,5l-6,7h-2l2-6l12-23l11-23l11-22l10-19l7-15l-37,9l-29,9l-21,8l-29,13l-23,12l-18,11l-12,8l-14,10 l-14,11l-10,9l-8,7l-11,13l-12,20l-5,12l-2,9v19l3,12l7,12l7,8l14,9l16,5l26,3h25l-2,6l-14,27l-20,40l-5,2l-27,3h-17l-24-3l-19-5 l-16-7l-10-6l-10-8l-7-7l-10-14l-8-16l-4-14l-1-5v-28l4-20l9-25l7-16l11-20l16-24l9-11l9-10l7-8l31-31l8-7l14-12l14-11l19-14l27-18 l20-12l28-15l27-13l32-13l20-7l27-8l36-8L397,115z"
      />
      <Path
        fill={palette.lime}
        d="M872,36h3l-2,6l-12,19l-13,21l-11,18l-12,20l-13,21l-12,19l-12,20l-12,19l-16,26l-12,19l-13,20l-15,24l-9,14 l-1-4l9-36l9-41l-45,19l-30,13l-28,12l-24,10l-26,11l-34,14l-26,11l-34,14l-26,11l-30,12l-46,17l-30,13l-28,15l-12,8l-19,13l-15,13 l-8,7l-16,15l-8,8l-9,11l-12,15l-12,17l-8,13l-1-2l12-25l15-29l11-18l22-33l14-19l11-13l9-11l9-9l7-8l16-16l11-9l10-9l17-13l18-13 l15-10l21-12l34-18l116-58l19-10l16-8l35-17l19-10l32-16l21-10l17-9l32-16l25-12l19-10l56-28L872,36z"
      />
      <Path
        fill={palette.lime}
        d="M532,359h78l54,1l1,3l-15,22l-12,17l-14,19l-11,14l-13,16l-8,10l-12,14l-13,15l-16,17l-7,7l-7,8l-15,14l-11,11 l-8,7l-11,10l-11,9l-15,13l-10,8l-18,14l-14,10l-5,2l2-4l10-11l7-8l11-12l7-8l9-10l9-11l12-14l10-13l12-15l10-14l13-18l10-15l9-15 l10-16l12-21l5-12h-22l-27,1l-34,3l-29,4l-35,8l-33,10l-29,11l-29,14l-17,9l-22,13l-18,13l-15,11l-10,8l-12,11l-13,12l-12,11l-8,8 l-9,11l-9,10l-10,13l-9,11l-13,18l-13,20l-11,19l-10,16l-6,11l-1-2l20-41l14-29l13-26l12-22l10-17l10-15l12-16l9-11l9-10l7-8l15-15 l8-7l13-11l19-14l21-14l21-12l22-11l26-11l34-11l26-6l26-5l24-3l21-2L532,359z"
      />
      <Path
        fill={palette.blueSoft}
        d="M383,0h175l23,3l13,5l10,6l12,12l8,16l3,16l-1,17l-4,15l-6,12l-9,13l-8,16l-5,9l-7,6l-21,12l-13,7l-4-2l-8-17 l-9-14l-9-11l-10-9l-14-8l-14-6l-6-3l-3-4l-4-18l-6-12l-9-10l-16-11l-15-10L391,7l-8-5V0z"
      />
    </Svg>
  );
}

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
  isFocused: externalIsFocused,
  ...props
}: { label?: string; isFocused?: boolean } & TextInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <View style={styles.inputGroup}>
      {label ? <Text style={styles.inputLabel}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={palette.muted}
        style={[
          styles.input,
          (isFocused || externalIsFocused) && styles.inputFocused,
        ]}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
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
      <Logo width={64} height={64} />
      <ActivityIndicator
        size="large"
        color={palette.lime}
        style={{ marginTop: 24 }}
      />
      <Text style={styles.loadingText}>Cargando tu diario local…</Text>
      <Text style={styles.attributionText}>Creado por achadev</Text>
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
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
    height: 64,
    width: 64,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.limeSoft,
    marginBottom: 16,
    shadowColor: palette.lime,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyTitle: {
    color: palette.text,
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.5,
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
  inputFocused: {
    borderColor: palette.lime,
    backgroundColor: palette.surface,
    shadowColor: palette.lime,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
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
  loadingText: { color: palette.muted, fontSize: 14, fontWeight: "600" },
  attributionText: {
    color: palette.muted,
    fontSize: 12,
    position: "absolute",
    bottom: 40,
    opacity: 0.5,
  },
});
