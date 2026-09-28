# ForgeFit - Diagnóstico Técnico y Análisis del Sistema (Actualizado con OpenSpec)

**Fecha de Análisis:** 2026-09-27
**Estado:** Diagnóstico profundo, evaluación arquitectónica y alineación con directivas OpenSpec.

---

## 1. Resumen Arquitectónico

La base de código actual demuestra una excelente adaptación de la especificación teórica hacia un entorno móvil de alto rendimiento. Las principales decisiones arquitectónicas implementadas son:

- **Plataforma Base:** React Native + Expo (SDK 56). Esta decisión mejora la visión original (PWA) garantizando un entorno _offline-first_ inquebrantable, independiente del navegador.
- **Persistencia de Datos (Local-First):** Se utiliza **SQLite local** (`expo-sqlite`) orquestado por **Drizzle ORM**. Esta es una decisión arquitectónica óptima para manejar relaciones complejas (Rutinas → Días → Ejercicios → Sesiones → Series).
- **Metodología de Desarrollo:** El proyecto está gobernado por **OpenSpec (Spec-Driven Development)**, con directivas estrictas de TDD (`strict_tdd: true`) según `openspec/config.yaml`.

---

## 2. Análisis por Capas y Brechas Detectadas (Auditoría Técnica)

El análisis del código junto con las especificaciones en `openspec/changes/forgefit-compliance/` revela que el sistema actual cumple aproximadamente el 70% de la especificación integral.

### 2.1. Capa de Datos y Esquema (SQLite + Drizzle)

- **Estado Actual:** El esquema base está creado, pero los datos de las series (`sets`) se guardan actualmente como arrays anidados en lugar de utilizar la tabla dedicada `setLogs`. El archivo `db/repositories/routines.ts` usa tipos `any` y extracciones totales en memoria.
- **Brecha OpenSpec:** La propuesta exige una migración de datos hacia un esquema relacional completo (Fase 1), separando `routineVersions`, `trainingDays`, `exerciseTemplates` y `setLogs` para habilitar consultas eficientes de analítica.

### 2.2. Capa de Lógica de Negocio (Workout Engine)

- **Estado Actual:** Generación de sesiones y lógica base aislada en `features/`. Sin embargo, falta el flujo interactivo de entrenamiento.
- **Brecha OpenSpec:** El documento `workout-engine/spec.md` requiere implementar el temporizador de descanso, soporte visual para protocolos FST-7, flujo de superseries/biseries, y la capacidad de marcar técnica y saltar series.
- **Riesgo de Calidad (TDD):** Aunque `config.yaml` impone `strict_tdd: true` usando Vitest, actualmente no existen pruebas unitarias que respalden la lógica core. Esto debe resolverse antes de escalar los motores.

### 2.3. Capa de Presentación (UI) e Interacción

- **Estado Actual:** Navegación básica con 4 tabs y diseño funcional, pero sin pulido visual profundo.
- **Brecha OpenSpec:**
  - **Diseño (Fase 0):** Alta prioridad para integrar branding, gradientes, glassmorphism y jerarquía tipográfica (`visual-design/spec.md`).
  - **Navegación:** Expansión de 4 a 9 tabs dedicadas (`navigation/spec.md`).
  - **Analítica:** Soporte para selectores de periodos (7d, 30d, 1y) y 6 tipos de gráficas (Volumen, adherencia, progresión por ejercicio, etc.) según `analytics/spec.md`.

---

## 3. Análisis del Plan OpenSpec (`forgefit-compliance`)

La propuesta de cambio (`proposal.md`) está estructurada de forma lógica y segura, respetando las dependencias del sistema:

1.  **Fase 0: Diseño Visual y Branding** (Mejora inmediata de UX, sin tocar lógica).
2.  **Fase 1: Data Schema Migration** (Base obligatoria para soportar el resto de features, refactorizando repositorios y activando la tabla `setLogs`).
3.  **Fase 2: Workout Engine + Rest Timer** (Construido sobre el nuevo esquema).
4.  **Fase 3: Navegación** (Nuevos tabs).
5.  **Fase 4: Biblioteca Expandida**.
6.  **Fase 5: Analytics y Gráficas**.
7.  **Fase 6: Recovery + Progresión**.
8.  **Fase 7: Tests** (Nota: Sugiero adelantar la creación de fixtures de prueba a las fases de motor y analítica para cumplir con `strict_tdd`).

---

## 4. Plan de Acción y Siguientes Pasos

De acuerdo con tus preferencias de trabajo (confirmar planes detallados, ejecución fase a fase y commits en Git), el roadmap dictado por OpenSpec es el camino a seguir.

**Recomendación Inmediata:**
Comenzar la ejecución estricta siguiendo el documento `proposal.md` de OpenSpec.

- **Paso 1:** Ejecutar la **Fase 0 (Diseño Visual y Branding)**. Integrar el logo, gradientes y refinar los componentes base en `components/app/ui.tsx`. Realizar commit.
- **Paso 2:** Ejecutar la **Fase 1 (Data Schema Migration)**. Refactorizar los repositorios para utilizar Drizzle Relational Queries, eliminar los arrays anidados y activar la tabla `setLogs`. Realizar commit.

¿Estás de acuerdo en que inicialicemos el flujo de trabajo SDD (Spec-Driven Development) y arranquemos directamente con la **Fase 0: Diseño Visual y Branding** descrita en el proposal?
