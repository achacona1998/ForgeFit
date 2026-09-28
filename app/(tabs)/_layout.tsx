import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { palette } from "@/components/app/ui";

function TabIcon({
  name,
  color,
  focused,
}: {
  name: keyof typeof MaterialIcons.glyphMap;
  color: string;
  focused: boolean;
}) {
  return (
    <MaterialIcons
      name={name}
      size={22}
      color={focused ? palette.lime : (color as string)}
    />
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 10 : Math.max(insets.bottom, 8);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.lime,
        tabBarInactiveTintColor: palette.muted,
        tabBarStyle: {
          backgroundColor: palette.surface,
          borderTopColor: palette.border,
          height: 62 + bottomPadding,
          paddingTop: 7,
          paddingBottom: bottomPadding,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "800" },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: (props) => (
            <TabIcon
              name="home-filled"
              focused={props.focused}
              color={props.color as string}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="train"
        options={{
          title: "Entrenar",
          tabBarIcon: (props) => (
            <TabIcon
              name="fitness-center"
              focused={props.focused}
              color={props.color as string}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="routine"
        options={{
          title: "Rutina",
          tabBarIcon: (props) => (
            <TabIcon
              name="format-list-bulleted"
              focused={props.focused}
              color={props.color as string}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Biblioteca",
          tabBarIcon: (props) => (
            <TabIcon
              name="library-books"
              focused={props.focused}
              color={props.color as string}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progreso",
          tabBarIcon: (props) => (
            <TabIcon
              name="insights"
              focused={props.focused}
              color={props.color as string}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="measurements"
        options={{
          title: "Medidas",
          tabBarIcon: (props) => (
            <TabIcon
              name="straighten"
              focused={props.focused}
              color={props.color as string}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="prs"
        options={{
          title: "PRs",
          tabBarIcon: (props) => (
            <TabIcon
              name="emoji-events"
              focused={props.focused}
              color={props.color as string}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendario",
          tabBarIcon: (props) => (
            <TabIcon
              name="calendar-month"
              focused={props.focused}
              color={props.color as string}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Ajustes",
          tabBarIcon: (props) => (
            <TabIcon
              name="settings"
              focused={props.focused}
              color={props.color as string}
            />
          ),
        }}
      />
    </Tabs>
  );
}
