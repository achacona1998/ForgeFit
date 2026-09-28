import { View, Text } from "react-native";

export default function LibraryScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>Biblioteca</Text>
      <Text style={{ fontSize: 16, color: "gray" }}>
        Buscador de ejercicios y filtros.
      </Text>
    </View>
  );
}
