import { Platform } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import type { FitnessDatabase } from "@/types/fitness";

export interface BackupPayload {
  schemaVersion: number;
  exportDate: string;
  appVersion: string;
  data: FitnessDatabase;
}

export const createBackupPayload = (data: FitnessDatabase): BackupPayload => ({
  schemaVersion: 1,
  exportDate: new Date().toISOString(),
  appVersion: "1.0.0",
  data,
});

export const validateBackup = (input: unknown): BackupPayload => {
  if (!input || typeof input !== "object") throw new Error("El archivo no contiene un backup válido.");
  const backup = input as Partial<BackupPayload>;
  if (backup.schemaVersion !== 1 || !backup.data || typeof backup.data !== "object") {
    throw new Error("Formato o versión de backup incompatible.");
  }
  const data = backup.data as Partial<FitnessDatabase>;
  if (!Array.isArray(data.routines) || !Array.isArray(data.sessions) || !Array.isArray(data.exercises)) {
    throw new Error("El backup está incompleto o no supera la validación de integridad.");
  }
  return backup as BackupPayload;
};

export const exportDatabase = async (data: FitnessDatabase) => {
  const payload = createBackupPayload(data);
  const contents = JSON.stringify(payload, null, 2);
  const filename = `pulso-fit-backup-${payload.exportDate.slice(0, 10)}.json`;

  if (Platform.OS === "web") {
    const blob = new Blob([contents], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
    return filename;
  }

  const directory = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;
  if (!directory) throw new Error("No se pudo acceder al almacenamiento local.");
  const uri = `${directory}${filename}`;
  await FileSystem.writeAsStringAsync(uri, contents, { encoding: FileSystem.EncodingType.UTF8 });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: "application/json", dialogTitle: "Guardar backup de Pulso Fit" });
  }
  return filename;
};

export const pickBackup = async (): Promise<BackupPayload | null> => {
  const result = await DocumentPicker.getDocumentAsync({
    type: ["application/json", "text/json", "text/plain"],
    copyToCacheDirectory: true,
  });
  if (result.canceled) return null;

  const asset = result.assets[0];
  let contents = "";
  if (Platform.OS === "web" && asset.file) {
    contents = await asset.file.text();
  } else {
    contents = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.UTF8 });
  }
  return validateBackup(JSON.parse(contents));
};

const csvEscape = (value: string | number | undefined) => {
  const text = value === undefined ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const databaseToCsv = (data: FitnessDatabase) => {
  const rows = [["fecha", "rutina", "día", "ejercicio", "serie", "peso_kg", "reps", "rir", "rpe", "volumen_kg", "estado"]];
  data.sessions.forEach((session) => session.exercises.forEach((exercise) => exercise.sets.forEach((set) => rows.push([
    session.scheduledDate, session.routineName, session.trainingDayName, exercise.name, String(set.order), String(set.weight), String(set.reps), set.rir === undefined ? "" : String(set.rir), set.rpe === undefined ? "" : String(set.rpe), String(set.weight * set.reps), session.status,
  ]))));
  return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
};

export const exportCsv = async (data: FitnessDatabase) => {
  const filename = `pulso-fit-sesiones-${new Date().toISOString().slice(0, 10)}.csv`;
  const contents = databaseToCsv(data);
  if (Platform.OS === "web") {
    const blob = new Blob([contents], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; anchor.click(); URL.revokeObjectURL(url);
    return filename;
  }
  const directory = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;
  if (!directory) throw new Error("No se pudo acceder al almacenamiento local.");
  const uri = `${directory}${filename}`;
  await FileSystem.writeAsStringAsync(uri, contents, { encoding: FileSystem.EncodingType.UTF8 });
  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: "text/csv", dialogTitle: "Exportar sesiones CSV" });
  return filename;
};
