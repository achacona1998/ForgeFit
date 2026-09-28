import { View, Text } from "react-native";

export default function CalendarScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>Calendario</Text>
      <Text style={{ fontSize: 16, color: "gray" }}>
        Historial de entrenamientos.
      </Text>
    </View>
  );
}
