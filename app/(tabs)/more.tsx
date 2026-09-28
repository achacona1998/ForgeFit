import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import {
  AppCard,
  AppInput,
  Chip,
  IconButton,
  LoadingScreen,
  palette,
  PrimaryButton,
  SectionHeader,
} from "@/components/app/ui";
import {
  exportCsv,
  exportDatabase,
  pickBackup,
} from "@/features/export-import";
import { Appearance } from "react-native";
import { useFitness } from "@/context/fitness-context";

export default function MoreScreen() {
  const router = useRouter();
  const {
    hydrated,
    database,
    createCustomExercise,
    removeCustomExercise,
    updateSettings,
    updateProfile,
    mergeDatabase,
    replaceDatabase,
    resetDatabase,
  } = useFitness();
  const [showLibrary, setShowLibrary] = useState(false);
  const [showNewExercise, setShowNewExercise] = useState(false);
  const [exerciseName, setExerciseName] = useState("");
  const [athleteName, setAthleteName] = useState(database.profile.name);

  if (!hydrated) return <LoadingScreen />;

  const saveCustomExercise = async () => {
    if (!exerciseName.trim()) {
      Alert.alert(
        "Nombre requerido",
        "Escribe un nombre para guardar el ejercicio local.",
      );
      return;
    }
    await createCustomExercise({
      name: exerciseName.trim(),
      muscleGroups: ["Personalizado"],
      equipment: "Otro",
      category: "Personalizado",
    });
    setExerciseName("");
    setShowNewExercise(false);
  };

  const handleExport = async () => {
    try {
      const filename = await exportDatabase(database);
      Alert.alert(
        "Backup listo",
        `Se creó ${filename}. Guarda el archivo en un lugar seguro.`,
      );
    } catch {
      Alert.alert(
        "No se pudo exportar",
        "Inténtalo de nuevo desde un dispositivo compatible.",
      );
    }
  };

  const handleImport = async () => {
    try {
      const backup = await pickBackup();
      if (!backup) return;
      Alert.alert(
        "Backup validado",
        "Elige cómo incorporar los datos. Reemplazar borra el contenido local actual.",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Combinar", onPress: () => void mergeDatabase(backup.data) },
          {
            text: "Reemplazar",
            style: "destructive",
            onPress: () => void replaceDatabase(backup.data),
          },
        ],
      );
    } catch (error) {
      Alert.alert(
        "Importación inválida",
        error instanceof Error ? error.message : "No se pudo leer el archivo.",
      );
    }
  };

  const handleCsv = async () => {
    try {
      const filename = await exportCsv(database);
      Alert.alert("CSV listo", `Se creó ${filename}.`);
    } catch {
      Alert.alert(
        "No se pudo exportar",
        "Inténtalo de nuevo desde un dispositivo compatible.",
      );
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Más</Text>
          <Text style={styles.subtitle}>
            Tu cuenta no existe. Tus datos sí.
          </Text>
        </View>
        <View style={styles.localBadge}>
          <MaterialIcons name="lock" size={13} color={palette.success} />
          <Text style={styles.localBadgeText}>100% LOCAL</Text>
        </View>
      </View>
      <View style={{ alignItems: "center", marginVertical: 8 }}>
        <Text style={{ color: palette.muted, fontSize: 11, opacity: 0.6 }}>Creado por achadev</Text>
      </View>

      <SectionHeader title="Perfil" />
      <AppCard style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {database.profile.name.slice(0, 1).toUpperCase()}
          </Text>
        </View>
        <View style={styles.profileField}>
          <AppInput
            label="Nombre"
            value={athleteName}
            onChangeText={setAthleteName}
            onBlur={() => void updateProfile(athleteName.trim() || "Atleta")}
            returnKeyType="done"
          />
        </View>
      </AppCard>

      <SectionHeader
        title="Biblioteca local"
        action={showLibrary ? "Cerrar" : "Explorar"}
        onAction={() => setShowLibrary((value) => !value)}
      />
      <AppCard>
        <View style={styles.libraryIntro}>
          <View style={styles.menuIcon}>
            <MaterialIcons
              name="fitness-center"
              size={20}
              color={palette.blue}
            />
          </View>
          <View style={styles.menuText}>
            <Text style={styles.menuTitle}>
              {database.exercises.length} ejercicios disponibles
            </Text>
            <Text style={styles.menuCopy}>
              No se consulta ninguna API: la biblioteca vive en el dispositivo.
            </Text>
          </View>
          <IconButton
            icon="add"
            label="Añadir ejercicio"
            accent
            onPress={() => setShowNewExercise((value) => !value)}
          />
        </View>
        {showNewExercise ? (
          <View style={styles.newExercise}>
            <AppInput
              label="Nombre del ejercicio"
              value={exerciseName}
              onChangeText={setExerciseName}
              placeholder="Ej. Remo en máquina"
              returnKeyType="done"
              onSubmitEditing={() => void saveCustomExercise()}
            />
            <PrimaryButton
              label="Guardar personalizado"
              icon="add"
              onPress={() => void saveCustomExercise()}
            />
          </View>
        ) : null}
        {showLibrary ? (
          <View style={styles.exerciseList}>
            {database.exercises.map((exercise) => (
              <View key={exercise.id} style={styles.exerciseRow}>
                <View style={styles.exerciseRowText}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseMeta}>
                    {exercise.muscleGroups.join(" · ")} · {exercise.equipment}
                  </Text>
                </View>
                {exercise.isCustom ? (
                  <Pressable
                    onPress={() =>
                      Alert.alert(
                        "Eliminar ejercicio",
                        `¿Eliminar “${exercise.name}” de la biblioteca?`,
                        [
                          { text: "Cancelar", style: "cancel" },
                          {
                            text: "Eliminar",
                            style: "destructive",
                            onPress: () =>
                              void removeCustomExercise(exercise.id),
                          },
                        ],
                      )
                    }
                    style={({ pressed }) => [
                      styles.deleteButton,
                      pressed && styles.pressed,
                    ]}>
                    <MaterialIcons
                      name="delete-outline"
                      size={19}
                      color={palette.danger}
                    />
                  </Pressable>
                ) : (
                  <Chip label="BASE" />
                )}
              </View>
            ))}
          </View>
        ) : null}
      </AppCard>

      <SectionHeader title="Planificación" />
      <Pressable
        onPress={() => router.push("/calendar" as never)}
        style={({ pressed }) => [styles.menuCard, pressed && styles.pressed]}>
        <View style={[styles.menuIcon, styles.menuIconBlue]}>
          <MaterialIcons name="calendar-month" size={20} color={palette.blue} />
        </View>
        <View style={styles.menuText}>
          <Text style={styles.menuTitle}>Calendario mensual</Text>
          <Text style={styles.menuCopy}>
            Sesiones completadas, programadas, descanso y omitidas.
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={22} color={palette.muted} />
      </Pressable>

      <SectionHeader title="Datos y copias" />
      <View style={styles.stack}>
        <Pressable
          onPress={() => void handleExport()}
          style={({ pressed }) => [styles.menuCard, pressed && styles.pressed]}>
          <View style={[styles.menuIcon, styles.menuIconLime]}>
            <MaterialIcons
              name="file-download"
              size={20}
              color={palette.lime}
            />
          </View>
          <View style={styles.menuText}>
            <Text style={styles.menuTitle}>Exportar backup</Text>
            <Text style={styles.menuCopy}>
              JSON versionado con todo tu diario local.
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={palette.muted} />
        </Pressable>
        <Pressable
          onPress={() => void handleCsv()}
          style={({ pressed }) => [styles.menuCard, pressed && styles.pressed]}>
          <View style={[styles.menuIcon, styles.menuIconLime]}>
            <MaterialIcons name="table-chart" size={20} color={palette.lime} />
          </View>
          <View style={styles.menuText}>
            <Text style={styles.menuTitle}>Exportar sesiones CSV</Text>
            <Text style={styles.menuCopy}>
              Tabla compatible con Excel y hojas de cálculo.
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={palette.muted} />
        </Pressable>
        <Pressable
          onPress={() => void handleImport()}
          style={({ pressed }) => [styles.menuCard, pressed && styles.pressed]}>
          <View style={[styles.menuIcon, styles.menuIconBlue]}>
            <MaterialIcons name="file-upload" size={20} color={palette.blue} />
          </View>
          <View style={styles.menuText}>
            <Text style={styles.menuTitle}>Importar backup</Text>
            <Text style={styles.menuCopy}>
              Validar, combinar o reemplazar; nunca automático.
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={palette.muted} />
        </Pressable>
      </View>

      <SectionHeader title="Rendimiento" />
      <Pressable
        onPress={() => router.push("/records" as never)}
        style={({ pressed }) => [styles.menuCard, pressed && styles.pressed]}>
        <View style={[styles.menuIcon, styles.menuIconTrophy]}>
          <MaterialIcons
            name="emoji-events"
            size={20}
            color={palette.warning}
          />
        </View>
        <View style={styles.menuText}>
          <Text style={styles.menuTitle}>Rendimientos máximos</Text>
          <Text style={styles.menuCopy}>
            {database.records.length} PRs · Añadir registro manual
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={22} color={palette.muted} />
      </Pressable>

      <SectionHeader title="Preferencias" />
      <AppCard style={styles.settingsCard}>
        <SettingRow
          label="Mostrar RIR"
          detail="En el modo entrenamiento"
          value={database.settings.showRir}
          onValueChange={(showRir) => void updateSettings({ showRir })}
        />
        <View style={styles.rule} />
        <SettingRow
          label="Mostrar RPE"
          detail="Preparado para tus sesiones"
          value={database.settings.showRpe}
          onValueChange={(showRpe) => void updateSettings({ showRpe })}
        />
        <View style={styles.rule} />
        <SettingRow
          label="Celebrar PRs"
          detail="Al finalizar una sesión"
          value={database.settings.prCelebration}
          onValueChange={(prCelebration) =>
            void updateSettings({ prCelebration })
          }
        />
        <View style={styles.rule} />
        <Pressable
          onPress={() => router.push("/equipment" as never)}
          style={styles.themeRow}>
          <View>
            <Text style={styles.settingName}>Perfil de equipamiento</Text>
            <Text style={styles.settingDetail}>
              Barra {database.settings.equipmentProfile?.barWeight ?? 20} kg
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={palette.muted} />
        </Pressable>
        <View style={styles.rule} />
        <View style={styles.themeRow}>
          <View>
            <Text style={styles.settingName}>Tema visual</Text>
            <Text style={styles.settingDetail}>
              Sincronizado con tu sistema (requiere reiniciar)
            </Text>
          </View>
          <Chip
            label={Appearance.getColorScheme() === "light" ? "CLARO" : "OSCURO"}
            tone="blue"
          />
        </View>
      </AppCard>

      <SectionHeader title="Zona de datos" />
      <AppCard style={styles.dangerCard}>
        <Text style={styles.dangerTitle}>Eliminar todos los datos locales</Text>
        <Text style={styles.dangerCopy}>
          Borra rutinas, sesiones, medidas y PRs de este dispositivo. Exporta un
          backup antes de continuar.
        </Text>
        <View style={styles.dangerAction}>
          <PrimaryButton
            label="Eliminar datos"
            icon="delete-outline"
            variant="danger"
            onPress={() =>
              Alert.alert(
                "Eliminar datos locales",
                "Esta acción no se puede deshacer. ¿Confirmas que quieres borrar toda la información del dispositivo?",
                [
                  { text: "Cancelar", style: "cancel" },
                  {
                    text: "Eliminar todo",
                    style: "destructive",
                    onPress: () => void resetDatabase(),
                  },
                ],
              )
            }
          />
        </View>
      </AppCard>
    </ScrollView>
  );
}

function SettingRow({
  label,
  detail,
  value,
  onValueChange,
}: {
  label: string;
  detail: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.settingRow}>
      <View>
        <Text style={styles.settingName}>{label}</Text>
        <Text style={styles.settingDetail}>{detail}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: palette.border, true: "#526E20" }}
        thumbColor={value ? palette.lime : palette.muted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bg },
  content: { padding: 18, paddingBottom: 34, gap: 13 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 6,
  },
  title: {
    color: palette.text,
    fontSize: 25,
    fontWeight: "900",
    letterSpacing: -0.7,
  },
  subtitle: { color: palette.muted, fontSize: 13, marginTop: 3 },
  localBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: "#143426",
    borderRadius: 999,
  },
  localBadgeText: {
    color: palette.success,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  profileCard: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    height: 48,
    width: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.lime,
  },
  avatarText: { color: palette.bg, fontSize: 20, fontWeight: "900" },
  profileField: { flex: 1 },
  libraryIntro: { flexDirection: "row", alignItems: "center", gap: 10 },
  menuIcon: {
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.surfaceAlt,
    borderRadius: 13,
  },
  menuIconLime: { backgroundColor: palette.limeSoft },
  menuIconBlue: { backgroundColor: palette.blueSoft },
  menuIconTrophy: { backgroundColor: "#3D3013" },
  menuText: { flex: 1 },
  menuTitle: { color: palette.text, fontSize: 14, fontWeight: "900" },
  menuCopy: {
    color: palette.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  newExercise: {
    gap: 10,
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderColor: palette.border,
  },
  exerciseList: {
    gap: 7,
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: palette.border,
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 7,
  },
  exerciseRowText: { flex: 1 },
  exerciseName: { color: palette.text, fontSize: 13, fontWeight: "800" },
  exerciseMeta: { color: palette.muted, fontSize: 11, marginTop: 2 },
  deleteButton: { padding: 6 },
  stack: { gap: 9 },
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    padding: 13,
    borderRadius: 17,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  settingsCard: { paddingVertical: 3 },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  settingName: { color: palette.text, fontWeight: "800", fontSize: 14 },
  settingDetail: { color: palette.muted, marginTop: 3, fontSize: 11 },
  rule: { height: 1, backgroundColor: palette.border },
  themeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  dangerCard: { borderColor: "#573134", backgroundColor: "#241719" },
  dangerTitle: { color: palette.danger, fontSize: 14, fontWeight: "900" },
  dangerCopy: { color: "#D5A5A5", fontSize: 12, lineHeight: 17, marginTop: 5 },
  dangerAction: { marginTop: 14 },
  pressed: { opacity: 0.7 },
});
