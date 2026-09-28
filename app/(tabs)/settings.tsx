import { View, Text } from "react-native";

export default function SettingsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>Ajustes</Text>
      <Text style={{ fontSize: 16, color: "gray" }}>
        Configuración de la aplicación.
      </Text>
    </View>
  );
}
