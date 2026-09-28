import { View, Text } from "react-native";

export default function PrsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>PRs</Text>
      <Text style={{ fontSize: 16, color: "gray" }}>
        Récords personales por ejercicio.
      </Text>
    </View>
  );
}
