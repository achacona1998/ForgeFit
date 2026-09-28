import { View, Text } from "react-native";

export default function MeasurementsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>Medidas</Text>
      <Text style={{ fontSize: 16, color: "gray" }}>
        Registro de composición corporal.
      </Text>
    </View>
  );
}
