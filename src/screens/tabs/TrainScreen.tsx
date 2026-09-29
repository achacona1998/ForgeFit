import { View, Text } from "react-native";

export default function TrainScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>Entrenar</Text>
      <Text style={{ fontSize: 16, color: "gray" }}>
        Aquí se mostrará el entrenamiento del día.
      </Text>
    </View>
  );
}