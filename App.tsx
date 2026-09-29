import React, { useEffect, useState } from "react";
import { Platform, StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from "@react-navigation/bottom-tabs";
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import * as NavigationBar from "expo-navigation-bar";
import {
  Home,
  Dumbbell,
  ListTodo,
  BookOpen,
  TrendingUp,
  Ruler,
  Trophy,
  Calendar,
  Settings,
  PlusCircle,
  LayoutDashboard,
  Dumbbell as DumbbellIcon,
} from "lucide-react-native";

import { ThemeProvider } from "@/lib/theme-provider";
import { FitnessProvider } from "@/context/fitness-context";
import { colors } from "@/components/app/ui";

// Import all screens
import HomeScreen from "@/src/screens/tabs/HomeScreen";
import TrainScreen from "@/src/screens/tabs/TrainScreen";
import RoutineScreen from "@/src/screens/tabs/RoutineScreen";
import LibraryScreen from "@/src/screens/tabs/LibraryScreen";
import ProgressScreen from "@/src/screens/tabs/ProgressScreen";
import MeasurementsScreen from "@/src/screens/tabs/MeasurementsScreen";
import PRsScreen from "@/src/screens/tabs/PRsScreen";
import CalendarScreen from "@/src/screens/tabs/CalendarScreen";
import SettingsScreen from "@/src/screens/tabs/SettingsScreen";
import WorkoutScreen from "@/src/screens/workout/WorkoutDetailScreen";
import ExerciseDetailScreen from "@/src/screens/exercise/ExerciseDetailScreen";
import SessionDetailScreen from "@/src/screens/session/SessionDetailScreen";
import RoutineBuilderScreen from "@/src/screens/RoutineBuilderScreen";
import RecordsScreen from "@/src/screens/RecordsScreen";
import EquipmentScreen from "@/src/screens/EquipmentScreen";
import CalendarModalScreen from "@/src/screens/CalendarModalScreen";
import OAuthCallbackScreen from "@/src/screens/OAuthCallbackScreen";

// Types
type RootStackParamList = {
  MainTabs: undefined;
  WorkoutDetail: { id: string };
  ExerciseDetail: { id: string };
  SessionDetail: { id: string };
  RoutineBuilder: undefined;
  Records: undefined;
  Equipment: undefined;
  CalendarModal: undefined;
  OAuthCallback: undefined;
};

type MainTabParamList = {
  Home: undefined;
  Train: undefined;
  Routine: undefined;
  Library: undefined;
  Progress: undefined;
  Measurements: undefined;
  PRs: undefined;
  Calendar: undefined;
  Settings: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Custom tab bar with lucide icons
function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps<MainTabParamList>) {
  const insets = useSafeAreaInsets();

  const tabs = [
    { name: "Home", label: "Inicio", icon: Home, focusedIcon: LayoutDashboard },
    { name: "Train", label: "Entrenar", icon: Dumbbell, focusedIcon: DumbbellIcon },
    { name: "Routine", label: "Rutina", icon: ListTodo, focusedIcon: ListTodo },
    { name: "Library", label: "Biblioteca", icon: BookOpen, focusedIcon: BookOpen },
    { name: "Progress", label: "Progreso", icon: TrendingUp, focusedIcon: TrendingUp },
    { name: "Measurements", label: "Medidas", icon: Ruler, focusedIcon: Ruler },
    { name: "PRs", label: "PRs", icon: Trophy, focusedIcon: Trophy },
    { name: "Calendar", label: "Calendario", icon: Calendar, focusedIcon: Calendar },
    { name: "Settings", label: "Ajustes", icon: Settings, focusedIcon: Settings },
  ] as const;

  return (
    <View
      style={{
        paddingBottom: Math.max(insets.bottom, 8),
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
        borderTopWidth: 1,
        paddingTop: 7,
        paddingBottom: Math.max(insets.bottom, 8),
      }}
      className="absolute bottom-0 left-0 right-0 z-50">
      <View className="flex-row items-center justify-around pb-3">
        {tabs.map((tab) => {
          const index = state.routes.findIndex((r) => r.name === tab.name);
          const isFocused = state.index === index;
          const { options } = descriptors[state.routes[index].key];

          const onPress = () => {
            const route = state.routes[index];
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (event.defaultPrevented) return;
            navigation.navigate(route.name as never);
          };

          const activeColor = colors.lime;
          const inactiveColor = colors.muted;

          return (
            <Pressable
              key={tab.name}
              onPress={onPress}
              onLongPress={() => navigation.emit({ type: "tabLongPress", target: route.key })}
              className="items-center justify-center active:scale-90"
              accessibilityRole="button"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? tab.label}>
              <tab.icon
                color={isFocused ? activeColor : inactiveColor}
                size={isFocused ? 24 : 22}
                strokeWidth={isFocused ? 2.5 : 2}
              />
              <Text
                className={[
                  "mt-1 text-[10px] font-black uppercase tracking-widest",
                  isFocused ? "text-lime" : "text-muted",
                ].join(" ")}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function MainTabsNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.lime,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 62,
          paddingTop: 7,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "800" },
      }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Train" component={TrainScreen} />
      <Tab.Screen name="Routine" component={RoutineScreen} />
      <Tab.Screen name="Library" component={LibraryScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Measurements" component={MeasurementsScreen} />
      <Tab.Screen name="PRs" component={PRsScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "fade",
        cardStyle: { backgroundColor: colors.background },
      }}>
      <RootStack.Screen name="MainTabs" component={MainTabsNavigator} />
      <RootStack.Screen
        name="WorkoutDetail"
        component={WorkoutScreen}
        options={{
          presentation: "card",
          animation: "slide_from_right",
        }}
      />
      <RootStack.Screen
        name="ExerciseDetail"
        component={ExerciseDetailScreen}
        options={{
          presentation: "card",
          animation: "slide_from_right",
        }}
      />
      <RootStack.Screen
        name="SessionDetail"
        component={SessionDetailScreen}
        options={{
          presentation: "card",
          animation: "slide_from_right",
        }}
      />
      <RootStack.Screen
        name="RoutineBuilder"
        component={RoutineBuilderScreen}
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <RootStack.Screen
        name="Records"
        component={RecordsScreen}
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <RootStack.Screen
        name="Equipment"
        component={EquipmentScreen}
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <RootStack.Screen
        name="CalendarModal"
        component={CalendarModalScreen}
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <RootStack.Screen
        name="OAuthCallback"
        component={OAuthCallbackScreen}
        options={{
          presentation: "card",
          animation: "fade",
        }}
      />
    </RootStack.Navigator>
  );
}

export default function App() {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    // Enable immersive mode on Android
    if (Platform.OS === "android") {
      NavigationBar.setVisibilityAsync("hidden").catch(() => {});
    }
    setBooting(false);
  }, []);

  if (booting) {
    return (
      <SafeAreaProvider>
        <ThemeProvider>
          <StatusBar hidden={true} style="light" />
          <View className="flex-1 items-center justify-center bg-background">
            <Text className="text-sm text-on-surface-variant">Cargando...</Text>
          </View>
        </ThemeProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <FitnessProvider>
          <StatusBar hidden={true} style="light" />
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </FitnessProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}