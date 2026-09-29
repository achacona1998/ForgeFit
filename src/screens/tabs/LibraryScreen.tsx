import { useState, useMemo } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useFitness } from "@/context/fitness-context";
import { AppInput, AppCard, Chip, palette } from "@/components/app/ui";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function LibraryScreen() {
  const navigation = useNavigation();
  const { database } = useFitness();
  const [search, setSearch] = useState("");
  const [muscleFilter, setMuscleFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const muscles = useMemo(() => {
    const set = new Set<string>();
    database.exercises.forEach((e) => {
      e.directMuscles?.forEach((m) => set.add(m));
      e.muscleGroups?.forEach((m) => set.add(m)); // fallback
    });
    return Array.from(set).sort();
  }, [database.exercises]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    database.exercises.forEach((e) => {
      if (e.category) set.add(e.category);
    });
    return Array.from(set).sort();
  }, [database.exercises]);

  const filteredExercises = useMemo(() => {
    return database.exercises
      .filter((e) => {
        if (search) {
          const query = search.toLowerCase();
          const matchesName = e.name.toLowerCase().includes(query);
          const matchesAlias = e.aliases?.some((a) =>
            a.toLowerCase().includes(query),
          );
          if (!matchesName && !matchesAlias) return false;
        }
        if (muscleFilter) {
          const hasDirect = e.directMuscles?.includes(muscleFilter);
          const hasLegacy = e.muscleGroups?.includes(muscleFilter);
          if (!hasDirect && !hasLegacy) return false;
        }
        if (categoryFilter) {
          if (e.category !== categoryFilter) return false;
        }
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [database.exercises, search, muscleFilter, categoryFilter]);

  return (
    <View style={[styles.container, { padding: 0 }]}>
      <View
        style={{
          padding: 16,
          gap: 12,
          backgroundColor: palette.surface,
          borderBottomWidth: 1,
          borderBottomColor: palette.border,
        }}>
      <AppInput
        placeholder="Buscar ejercicio o alias..."
        value={search}
        onChangeText={setSearch}
      />

      <View>
        <Text
          style={{
            color: palette.muted,
            fontSize: 12,
            fontWeight: "bold",
            marginBottom: 8,
          }}>
          FILTRAR POR MÚSCULO
        </Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={["Todos", ...muscles]}
          keyExtractor={(item) => item}
          renderItem={({ item }) => {
            const isSelected =
              item === "Todos"
                ? muscleFilter === null
                : muscleFilter === item;
            return (
              <Pressable
                onPress={() =>
                  setMuscleFilter(item === "Todos" ? null : item)
                }
                style={{ marginRight: 8 }}>
                <Chip label={item} tone={isSelected ? "lime" : "neutral"} />
              </Pressable>
            );
          }}
        />
      </View>

      <View>
        <Text
          style={{
            color: palette.muted,
            fontSize: 12,
            fontWeight: "bold",
            marginBottom: 8,
          }}>
          FILTRAR POR CATEGORÍA
        </Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={["Todas", ...categories]}
          keyExtractor={(item) => item}
          renderItem={({ item }) => {
            const isSelected =
              item === "Todas"
                ? categoryFilter === null
                : categoryFilter === item;
            return (
              <Pressable
                onPress={() =>
                  setCategoryFilter(item === "Todas" ? null : item)
                }
                style={{ marginRight: 8 }}>
                <Chip label={item} tone={isSelected ? "blue" : "neutral"} />
              </Pressable>
            );
          }}
        />
      </View>
    </View>

    <FlatList
      contentContainerStyle={{ padding: 16, gap: 12 }}
      data={filteredExercises}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => navigation.navigate("ExerciseDetail", { id: item.id })}>
        <AppCard>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: palette.text,
                  fontSize: 16,
                  fontWeight: "bold",
                }}>
                {item.name}
              </Text>
              <Text
                style={{
                  color: palette.muted,
                  fontSize: 13,
                  marginTop: 4,
                }}>
                {item.directMuscles?.join(", ") ||
                  item.muscleGroups.join(", ")}
              </Text>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={palette.muted}
            />
          </View>
        </AppCard>
        </Pressable>
      )}
    />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.bg,
  },
});