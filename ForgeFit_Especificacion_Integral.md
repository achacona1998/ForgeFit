# ForgeFit — Especificación Integral de Producto

**Versión:** 1.0  
**Estado:** Documento maestro de producto y arquitectura  
**Tipo:** PWA offline-first, local-first  
**Nombre provisional:** ForgeFit  

---

## 1. Resumen ejecutivo

**ForgeFit** es un sistema operativo personal de entrenamiento: una aplicación offline-first que permite planificar una rutina una vez, ejecutar sesiones con registro rápido, conservar un historial inmutable y convertir los datos reales en objetivos explicables para el siguiente entrenamiento.

No es una copia de un diario físico, una libreta digital ni solamente un generador de rutinas. Es un producto que conecta cuatro capas:

```text
PLANIFICACIÓN
     ↓
WORKOUT ENGINE
     ↓
EJECUCIÓN Y REGISTRO
     ↓
ANÁLISIS Y PROGRESIÓN
```

La propuesta de valor es:

> Configura tu rutina una vez; ForgeFit recuerda qué te toca, muestra tu última ejecución, guía el entrenamiento, guarda lo que hiciste y prepara el siguiente objetivo.

---

## 2. Problema

El seguimiento de entrenamiento suele estar repartido entre PDFs, hojas de cálculo, notas, cronómetros y aplicaciones desconectadas. Eso obliga al usuario a recordar pesos, repeticiones, descansos, progresión y cambios de rutina de forma manual.

Problemas concretos:

- La rutina se reescribe o consulta manualmente cada sesión.
- El rendimiento anterior no está disponible de forma inmediata.
- Los descansos se controlan con una herramienta separada.
- Los históricos se vuelven inconsistentes al modificar una rutina.
- Los PRs, el volumen y la adherencia requieren cálculos manuales.
- Muchas aplicaciones dependen de cuenta, conexión o suscripción.
- Las sugerencias de progresión suelen ser opacas o modifican planes sin control explícito.

---

## 3. Solución

ForgeFit centraliza planificación, ejecución, historial y análisis en una aplicación local.

```text
CONFIGURAR RUTINA UNA VEZ
          ↓
GENERAR SESIONES FUTURAS
          ↓
ABRIR ENTRENAMIENTO DEL DÍA
          ↓
VER OBJETIVO Y RENDIMIENTO ANTERIOR
          ↓
REGISTRAR SERIES Y DESCANSOS
          ↓
FINALIZAR SESIÓN
          ↓
ACTUALIZAR HISTORIAL, VOLUMEN Y PRs
          ↓
PREPARAR OBJETIVO DE LA SIGUIENTE SESIÓN
```

El producto debe ser completamente funcional sin Internet y mantener los datos en el dispositivo por defecto.

---

## 4. Principios de producto

### 4.1 Offline-first real

Las funciones críticas deben funcionar sin conexión:

- Crear, editar, duplicar y activar rutinas.
- Consultar la biblioteca de ejercicios.
- Generar sesiones.
- Registrar entrenamientos.
- Ejecutar temporizadores.
- Consultar historial y progreso.
- Registrar medidas y PRs.
- Exportar e importar backups.

No se requiere servidor, login, API externa, CDN ni autenticación para usar el producto.

### 4.2 Local-first y privacidad

Todos los datos se almacenan localmente en IndexedDB. La arquitectura debe permitir sincronización futura opcional, pero nunca convertirla en requisito del flujo principal.

### 4.3 Rutina no es sesión

La rutina es una plantilla que define lo esperado. La sesión conserva lo que realmente ocurrió.

```text
RUTINA: qué debería realizarse
SESIÓN: qué se realizó realmente
```

Editar una rutina jamás debe alterar sesiones históricas. Las sesiones deben guardar snapshots o referencias versionadas de la configuración usada.

### 4.4 Automatización con confirmación

ForgeFit puede analizar, detectar, calcular y sugerir. No debe modificar la planificación de forma silenciosa.

### 4.5 Velocidad durante el entrenamiento

Completar una serie debe requerir pocos toques. La interfaz prioriza valores previos, botones grandes, entradas numéricas simples, temporizador visible y navegación clara.

### 4.6 Analítica útil y explicable

Toda gráfica, alerta o sugerencia debe responder una pregunta práctica. Las señales de estancamiento, deload o recuperación no son diagnósticos médicos.

---

## 5. Usuario objetivo

Personas que entrenan fuerza, hipertrofia, powerbuilding o rutinas estructuradas y desean:

- Registrar peso, repeticiones, RIR/RPE y descansos.
- Progresar de forma consistente.
- Mantener control total sobre su programación.
- Usar la aplicación en gimnasio sin depender de señal o Wi-Fi.
- Consultar métricas, medidas y evolución corporal.
- Conservar y exportar sus datos.

---

## 6. Propuesta de valor

> ForgeFit es un sistema operativo personal de entrenamiento que funciona sin Internet, recuerda tu programación y tu rendimiento, registra tu ejecución real y prepara el siguiente paso de tu progreso.

Preguntas que debe responder de forma inmediata:

1. ¿Qué me toca entrenar hoy?
2. ¿Qué hice la última vez?
3. ¿Qué objetivo debería intentar ahora?
4. ¿Cómo está evolucionando mi rendimiento?
5. ¿Estoy cumpliendo mi planificación?

---

## 7. Alcance funcional

### 7.1 Módulos principales

```text
Dashboard
Entrenar
Rutinas
Biblioteca de ejercicios
Historial
Progreso
Medidas corporales
PRs
Calendario
Ajustes y backups
```

### 7.2 Capacidades centrales

- Constructor de rutinas y días de entrenamiento.
- Biblioteca local de ejercicios y ejercicios personalizados.
- Generación de sesiones según rutina activa y calendario.
- Modo entrenamiento con registro por serie.
- Precarga de rendimiento anterior.
- Descanso automático y configurable.
- Biseries, superseries y FST-7.
- Progresión configurable y sugerencias con confirmación.
- Historial por sesión y ejercicio.
- PRs manuales y automáticos.
- Métricas de volumen, frecuencia y adherencia.
- Seguimiento corporal.
- Periodización: bloque, mesociclo, microciclo y deload.
- Exportación JSON/CSV e importación validada.
- PWA instalable con soporte offline.

---

## 8. Flujo principal

### 8.1 Primer uso

```text
Abrir ForgeFit
    ↓
Crear perfil básico
    ↓
Crear rutina / importar rutina / cargar ejemplo
    ↓
Elegir rutina activa
    ↓
Generar calendario inicial
    ↓
Abrir Dashboard
```

### 8.2 Día de entrenamiento

```text
Dashboard
    ↓
"Hoy toca: Pecho + Espalda A"
    ↓
Abrir entrenamiento
    ↓
Ver objetivo y última sesión
    ↓
Registrar serie
    ↓
Iniciar descanso automático
    ↓
Completar ejercicio
    ↓
Siguiente ejercicio
    ↓
Finalizar sesión
    ↓
Resumen: volumen, PRs, adherencia y siguiente objetivo
```

### 8.3 Análisis

```text
Historial actualizado
    ↓
Volumen y frecuencia por grupo muscular
    ↓
PRs y evolución por ejercicio
    ↓
Posibles estancamientos
    ↓
Objetivos preliminares de próxima sesión
```

---

## 9. Rutinas

Una rutina representa un programa de entrenamiento reutilizable y versionable.

### 9.1 Funciones

- Crear rutina desde cero.
- Duplicar rutina.
- Editar rutina sin cambiar sesiones anteriores.
- Activar una rutina.
- Archivar una rutina.
- Versionar cambios estructurales.
- Definir fechas de vigencia.
- Asociar bloque, mesociclo y microciclo.
- Importar/exportar rutinas en JSON.

### 9.2 Datos de rutina

```text
Routine
├── id
├── name
├── description
├── goal
├── active
├── daysPerWeek
├── startDate
├── endDate
├── currentVersionId
├── createdAt
└── updatedAt
```

### 9.3 Versión de rutina

```text
RoutineVersion
├── id
├── routineId
├── versionNumber
├── effectiveFrom
├── effectiveTo
├── notes
├── mesocycleId
├── microcycleId
├── createdAt
└── createdByAction
```

Cada sesión debe enlazarse con la versión aplicada o guardar un snapshot equivalente.

---

## 10. Constructor de rutinas

El constructor debe funcionar como editor por bloques.

### 10.1 Flujo de creación

```text
Nueva rutina
    ↓
Nombre y objetivo
    ↓
Días por semana
    ↓
Crear días de entrenamiento
    ↓
Añadir ejercicios
    ↓
Configurar series, reps, RIR/RPE y descanso
    ↓
Definir protocolo y progresión
    ↓
Reordenar o agrupar bloques
    ↓
Guardar y activar
```

### 10.2 Operaciones disponibles

- Añadir ejercicio desde biblioteca.
- Crear ejercicio personalizado.
- Reordenar mediante arrastrar y soltar.
- Duplicar ejercicio o bloque.
- Eliminar ejercicio.
- Agrupar ejercicios como biserie o superserie.
- Configurar FST-7.
- Añadir notas y tempo.
- Configurar prioridad.
- Configurar tipo de progresión.
- Configurar incremento de carga.

### 10.3 Configuración de una plantilla de ejercicio

```text
ExerciseTemplate
├── id
├── trainingDayId
├── exerciseId
├── order
├── sets
├── repRangeMin
├── repRangeMax
├── targetWeight
├── targetRIRMin
├── targetRIRMax
├── targetRPE
├── restMinSeconds
├── restMaxSeconds
├── tempo
├── progressionType
├── progressionConfig
├── protocol
├── supersetGroup
├── priority
├── notes
└── enabled
```

---

## 11. Biblioteca de ejercicios

La biblioteca debe ser local, buscable y extensible.

### 11.1 Datos de ejercicio

```text
Exercise
├── id
├── name
├── aliases[]
├── muscleGroups[]
├── directMuscles[]
├── secondaryMuscles[]
├── equipment
├── category
├── instructions
├── videoUrl
├── notes
├── isCustom
├── createdAt
└── updatedAt
```

### 11.2 Funciones

- Buscar por nombre, músculo, equipo o categoría.
- Filtrar por grupo muscular.
- Crear ejercicios personalizados.
- Editar o eliminar únicamente ejercicios propios.
- Mostrar instrucciones locales.
- Soportar enlaces de video opcionales sin depender de ellos para entrenar.

### 11.3 Categorías sugeridas

```text
compound
machine
isolation
core
bodyweight
cable
free_weight
custom
```

---

## 12. Workout Engine

El **Workout Engine** es el núcleo del producto. Interpreta la rutina activa y su historial para crear y controlar una sesión real.

```text
Routine + RoutineVersion
          ↓
      Workout Engine
          ├── Session Generator
          ├── Previous Performance Resolver
          ├── Workout Flow Engine
          ├── Progression Engine
          ├── Rest Engine
          ├── Superset Engine
          ├── FST-7 Engine
          ├── PR Engine
          ├── Volume Engine
          ├── Adherence Engine
          └── Analytics Engine
          ↓
       Real Session
          ↓
       IndexedDB
```

### 12.1 Responsabilidades

- Generar sesiones programadas.
- Determinar el entrenamiento del día.
- Cargar objetivos y última ejecución.
- Determinar ejercicio, bloque y serie siguientes.
- Gestionar protocolos especiales.
- Registrar descansos programados y reales.
- Calcular volumen y métricas de sesión.
- Detectar PRs.
- Crear objetivos preliminares futuros.
- Detectar señales de estancamiento.
- Proponer cambios sin aplicarlos automáticamente.

---

## 13. Generación de sesiones

Las sesiones se deben generar lógicamente sin duplicar datos innecesariamente. Puede haber sesiones programadas futuras o creación bajo demanda al abrir una fecha.

### 13.1 Estados

```text
scheduled
in_progress
completed
skipped
cancelled
```

Las sesiones omitidas no deben eliminarse: forman parte de la adherencia y el calendario.

### 13.2 Datos de sesión

```text
Session
├── id
├── routineId
├── routineVersionId
├── trainingDayId
├── date
├── status
├── startedAt
├── completedAt
├── durationSeconds
├── sessionNotes
├── recoveryContext
├── blockId
├── mesocycleId
├── microcycleId
├── createdAt
└── updatedAt
```

### 13.3 Ejercicio dentro de sesión

```text
SessionExercise
├── id
├── sessionId
├── exerciseId
├── templateSnapshot
├── order
├── blockGroupId
├── status
├── notes
├── previousPerformanceSnapshot
└── createdAt
```

### 13.4 Registro de serie

```text
SetLog
├── id
├── sessionExerciseId
├── setNumber
├── type
├── plannedWeight
├── plannedRepsMin
├── plannedRepsMax
├── plannedRIR
├── actualWeight
├── actualReps
├── actualRIR
├── actualRPE
├── techniqueRating
├── restPlannedSeconds
├── restActualSeconds
├── completedAt
├── notes
└── skipped
```

---

## 14. Modo entrenamiento

Es la pantalla más importante y debe priorizar velocidad, legibilidad y operación móvil.

### 14.1 Información visible

```text
ENTRENAMIENTO DE HOY
Nombre del día
Fecha
Duración
Estado
Progreso de sesión
```

Para cada ejercicio:

```text
Nombre del ejercicio
Objetivo: series × rango de repeticiones
Peso objetivo
RIR/RPE objetivo
Descanso
Notas
Última ejecución
Serie actual
```

### 14.2 Interacción por serie

```text
Peso [ 100 ] kg
Reps [ 10 ]
RIR  [ 2 ]
RPE  [ 8 ]
Técnica [Excelente | Aceptable | Deficiente]

[Completar serie]
```

### 14.3 Reglas UX

- Usar como valores iniciales la última ejecución o la configuración objetivo.
- Diferenciar claramente datos anteriores y datos actuales.
- Permitir añadir, editar, eliminar y marcar series como omitidas.
- Mostrar botones grandes para aumentar/disminuir valores.
- Mantener el temporizador visible.
- Permitir ir al ejercicio anterior o siguiente.
- Permitir notas rápidas por ejercicio y por sesión.
- Evitar modales repetitivos durante el entrenamiento.

---

## 15. Rendimiento anterior

Al abrir un ejercicio, ForgeFit debe recuperar la última sesión completada del mismo ejercicio.

```text
ÚLTIMA SESIÓN
100 kg × 10 — RIR 2
100 kg × 9  — RIR 2
100 kg × 8  — RIR 1

ACTUAL
Peso [100] kg
Reps [10]
RIR [2]
```

La precarga facilita el registro, pero no debe alterar el historial ni obligar al usuario a repetir esos valores.

---

## 16. Descanso automático

Al completar una serie:

```text
SERIE COMPLETADA
       ↓
INICIAR DESCANSO
       ↓
COUNTDOWN
       ↓
SIGUIENTE SERIE O BLOQUE
```

### 16.1 Acciones

- Iniciar automáticamente o de forma manual.
- Pausar.
- Reanudar.
- Reiniciar.
- Añadir 15, 30 o 60 segundos.
- Reducir tiempo.
- Saltar descanso.
- Cambiar descanso para la sesión sin modificar la plantilla.

### 16.2 Valores de referencia configurables

```text
Compuestos: 90–180 s
Aislamientos: 60–90 s
FST-7: 30–45 s
Superseries: 60–90 s después del par
```

---

## 17. Protocolos especiales

### 17.1 Biseries

Ejemplo:

```text
A1. Dragon Flag
A2. Cable Crunch

Flujo:
A1 → A2 → descanso → repetir
```

Cada ejercicio conserva sus series individuales, pero el motor los agrupa visualmente y define el descanso tras completar la pareja.

### 17.2 Superseries

Ejemplo:

```text
A1. Curl inclinado
A2. Extensión de tríceps

Flujo:
A1 → A2 → descanso → repetir
```

### 17.3 FST-7

Protocolo configurable:

```text
7 series
10–15 repeticiones
30–45 s de descanso
```

La interfaz debe mostrar claramente el progreso:

```text
Serie 1/7
Serie 2/7
...
Serie 7/7
```

### 17.4 Peso corporal

Soportar ejercicios con:

- Peso corporal solamente.
- Carga externa adicional.
- Asistencia de máquina o banda.
- Repeticiones, RIR/RPE y notas.

---

## 18. Progresión

La progresión se configura por ejercicio y se basa en reglas transparentes.

### 18.1 Tipos

```text
DOUBLE_PROGRESSION
FIXED_REPS
RIR_BASED
FST7
SUPERSET
BODYWEIGHT
CUSTOM
```

### 18.2 Doble progresión

Para un ejercicio de 3 × 8–12:

```text
Semana 1: 8 / 8 / 8
Semana 2: 9 / 9 / 8
Semana 3: 10 / 10 / 9
Semana 4: 12 / 12 / 12
```

Regla base:

```text
IF todas las series alcanzan maxReps
AND el RIR real cumple el objetivo configurado
THEN sugerir incremento de carga
```

Ejemplo de salida:

```text
Objetivo sugerido
Aumentar a 102.5 kg la próxima sesión.

Motivo:
Completaste todas las series en el máximo del rango respetando el RIR objetivo.
```

### 18.3 Acciones del usuario

```text
[Aceptar sugerencia]
[Editar objetivo]
[Mantener carga]
[Desactivar sugerencias para este ejercicio]
```

### 18.4 Configuración de progresión

```text
ProgressionConfig
├── type
├── loadIncrement
├── customIncrement
├── minRIR
├── maxRIR
├── allSetsRequired
├── successRule
├── failureRule
└── userNotes
```

---

## 19. PR Engine

El motor de récords personales debe detectar automáticamente y permitir registrar manualmente:

- Mayor peso levantado.
- Mayor número de repeticiones con una carga determinada.
- Mayor volumen por sesión.
- Mejor rendimiento estimado.
- Mejor rendimiento mensual.

Ejemplo:

```text
NUEVO PR

Press banca
120 kg × 5

Anterior:
117.5 kg × 5
```

### 19.1 Datos de PR

```text
PersonalRecord
├── id
├── exerciseId
├── sessionId
├── recordType
├── weight
├── reps
├── volume
├── estimatedPerformance
├── achievedAt
├── monthKey
└── source
```

Las notificaciones de PR deben poder desactivarse.

---

## 20. Historial

### 20.1 Historial de sesiones

Lista filtrable por:

- Fecha.
- Rutina.
- Día de entrenamiento.
- Estado.
- Mesociclo.
- Ejercicio.

Cada entrada muestra:

```text
Fecha
Rutina
Día
Duración
Volumen
Estado
PRs
Notas
```

### 20.2 Detalle de sesión

```text
Sesión
├── ejercicios
├── series
├── pesos
├── repeticiones
├── RIR/RPE
├── descansos
├── notas
├── contexto de recuperación
├── volumen
└── PRs detectados
```

### 20.3 Historial por ejercicio

Debe incluir:

- Fecha.
- Series y repeticiones.
- Peso.
- RIR/RPE.
- Volumen.
- Descanso.
- Notas.
- Tendencias.
- Mejores marcas.

---

## 21. Métricas y analítica

### 21.1 Métricas base

```text
Volumen total
Volumen por grupo muscular
Series realizadas
Repeticiones totales
Peso total movido
Sesiones completadas
Duración promedio
RIR promedio
RPE promedio
PRs
Adherencia
Frecuencia por grupo muscular
```

### 21.2 Fórmulas orientativas

Volumen externo por serie:

```text
volumen = peso × repeticiones
```

Volumen de sesión:

```text
volumen de sesión = Σ volumen de todas las series completadas
```

Adherencia:

```text
adherencia = sesiones completadas / sesiones programadas
```

Las fórmulas deben ser configurables cuando el usuario quiera incluir peso corporal, asistencia, series de calentamiento o contribución secundaria de músculos.

### 21.3 Volumen muscular

Cada ejercicio puede definir músculos directos y secundarios. El usuario puede decidir si los músculos secundarios cuentan como:

```text
0 %
25 %
50 %
100 %
```

---

## 22. Dashboard

El dashboard debe presentar información accionable.

```text
HOY
└── Entrenamiento del día

ESTA SEMANA
├── sesiones completadas / programadas
├── adherencia
├── volumen
├── tiempo entrenado
└── PRs

PROGRESO
├── ejercicios progresando
├── ejercicios estables
└── posibles estancamientos

CUERPO
├── peso actual
├── % de grasa
└── últimas medidas
```

Ejemplo:

```text
Press banca      ↑ +2 reps
Sentadilla       ↑ +5 kg
Romanian Deadlift → estable
Curl femoral     PR
```

---

## 23. Detector de estancamiento

El sistema identifica patrones registrados, no diagnósticos médicos.

Regla inicial sugerida:

```text
IF últimas 4 sesiones de un ejercicio
no muestran mejora relevante en carga, reps, volumen o rendimiento estimado
THEN marcar como posible estancamiento
```

Salida sugerida:

```text
POSIBLE ESTANCAMIENTO

Press banca
No se detectó un cambio relevante durante las últimas 4 sesiones.

Revisa recuperación, RIR, descanso, volumen o carga.
```

El usuario puede ignorar, ocultar o revisar la señal.

---

## 24. Deload y periodización

### 24.1 Jerarquía

```text
Bloque
  ↓
Mesociclo
  ↓
Microciclo
  ↓
Semana
  ↓
Sesión
```

### 24.2 Deload

La aplicación puede ofrecer una semana de descarga reduciendo volumen aproximadamente 40–50%, pero nunca aplicarla automáticamente.

Posibles señales:

- Rendimiento repetidamente por debajo del objetivo.
- Descenso sostenido de repeticiones.
- Ausencia prolongada de progreso.
- Menor volumen completado.
- Contexto de fatiga elevado reportado por el usuario.

Acciones:

```text
[Mantener programación]
[Crear semana de descarga]
[Editar manualmente]
```

---

## 25. Seguimiento corporal

### 25.1 Medidas estándar

```text
Fecha
Peso
Porcentaje de grasa
Pecho
Hombros
Bíceps derecho
Bíceps izquierdo
Cintura
Cadera
Muslo derecho
Muslo izquierdo
Pantorrilla derecha
Pantorrilla izquierda
```

### 25.2 Métricas personalizadas

El usuario puede añadir campos propios: por ejemplo, perímetro de cuello, presión arterial, pasos diarios o cualquier métrica personal.

### 25.3 Datos de medida

```text
Measurement
├── id
├── date
├── weight
├── bodyFatPercentage
├── values
├── notes
└── createdAt
```

`values` puede almacenar métricas adicionales por clave.

---

## 26. Recuperación y contexto

Por sesión, de forma opcional:

```text
Energía
Fatiga
Sueño
Sensaciones
Dolor o molestias
Notas
```

Por serie, opcionalmente:

```text
Técnica: Excelente | Aceptable | Deficiente
```

Estos datos contextualizan tendencias; no deben producir diagnósticos médicos ni recomendaciones clínicas.

---

## 27. Gráficas

Las gráficas deben ser seleccionables por periodo:

```text
7 días
30 días
3 meses
6 meses
1 año
Todo
```

### 27.1 Rendimiento por ejercicio

- Peso por tiempo.
- Repeticiones por tiempo.
- Volumen por tiempo.
- RIR por tiempo.
- Rendimiento estimado por tiempo.

### 27.2 Cuerpo

- Peso por tiempo.
- Porcentaje de grasa por tiempo.
- Perímetros por tiempo.

### 27.3 Entrenamiento

- Volumen semanal.
- Volumen mensual.
- Sesiones completadas.
- Adherencia.
- Frecuencia muscular.

---

## 28. Calendario

Vista mensual y semanal con estados:

```text
Completado: ✓
Programado: ○
Descanso: —
Omitido: ×
En progreso: ◐
```

Al seleccionar una fecha, el usuario puede abrir, iniciar, reprogramar o consultar la sesión correspondiente.

---

## 29. Navegación

```text
Dashboard
Entrenar
Rutina
Historial
Progreso
Medidas
PRs
Calendario
Ajustes
```

`Entrenar` debe ser el acceso principal y más visible en un día programado.

---

## 30. Pantallas

### 30.1 Dashboard

- Entrenamiento de hoy.
- Resumen semanal.
- Volumen.
- Adherencia.
- PRs recientes.
- Tendencias de ejercicios.
- Peso y últimas medidas.

### 30.2 Entrenar

- Estado de sesión.
- Ejercicio actual.
- Objetivo.
- Historial anterior.
- Registro de series.
- Temporizador.
- Progreso.

### 30.3 Rutinas

- Lista de rutinas.
- Rutina activa.
- Duplicar, editar, archivar.
- Constructor por días y bloques.

### 30.4 Biblioteca de ejercicios

- Buscador.
- Filtros por músculo/equipo/categoría.
- Crear ejercicio personalizado.

### 30.5 Historial

- Lista de sesiones.
- Filtros.
- Detalle completo de sesión.

### 30.6 Progreso

- Historial por ejercicio.
- Gráficas.
- Volumen muscular.
- Adherencia.
- Estancamientos.

### 30.7 Medidas

- Nueva medida.
- Tabla histórica.
- Gráficas corporales.

### 30.8 PRs

- PRs recientes.
- PRs por ejercicio.
- Mejor rendimiento mensual.

### 30.9 Calendario

- Sesiones programadas, completadas u omitidas.

### 30.10 Ajustes

- Perfil.
- Unidades kg/lb.
- Tema claro/oscuro/sistema.
- Activar o desactivar RIR/RPE.
- Notificaciones visuales.
- Exportación e importación.
- Eliminación total de datos con confirmación.

---

## 31. Modelo de datos conceptual

```text
AthleteProfile
  │
  ├── Measurements
  │
  ├── Routines
  │      │
  │      └── RoutineVersions
  │              │
  │              └── TrainingDays
  │                      │
  │                      └── ExerciseTemplates
  │
  └── Sessions
          │
          └── SessionExercises
                  │
                  └── SetLogs

Exercise ─── ExerciseTemplates
Exercise ─── SessionExercises
Exercise ─── PersonalRecords
```

### 31.1 Entidades

```text
AthleteProfile
Routine
RoutineVersion
TrainingDay
Exercise
ExerciseTemplate
Session
SessionExercise
SetLog
Measurement
PersonalRecord
TrainingBlock
Mesocycle
Microcycle
WorkoutRule
AppSettings
Backup
```

---

## 32. IndexedDB y Dexie

### 32.1 Tablas sugeridas

```text
profiles
routines
routineVersions
trainingDays
exercises
exerciseTemplates
sessions
sessionExercises
setLogs
measurements
personalRecords
trainingBlocks
mesocycles
microcycles
workoutRules
settings
backupsMetadata
```

### 32.2 Índices recomendados

```text
routines: id, active, updatedAt
routineVersions: id, routineId, effectiveFrom
trainingDays: id, routineVersionId, weekday, order
exercises: id, name, category, isCustom
exerciseTemplates: id, trainingDayId, exerciseId, order
sessions: id, routineId, routineVersionId, date, status
sessionExercises: id, sessionId, exerciseId, order
setLogs: id, sessionExerciseId, completedAt
measurements: id, date
personalRecords: id, exerciseId, achievedAt, recordType
```

### 32.3 Reglas de integridad

- IDs generados localmente, preferiblemente UUID.
- Cambios estructurales de rutina crean una nueva versión.
- Las sesiones completadas conservan snapshot de plantilla.
- Importaciones se validan antes de escribirse.
- Las operaciones críticas usan transacciones Dexie.
- Las migraciones incrementan `schemaVersion`.

---

## 33. Arquitectura técnica

### 33.1 Stack recomendado

```text
React
TypeScript
Vite
Tailwind CSS
Dexie + IndexedDB
React Router
Zustand
Recharts
vite-plugin-pwa
Vitest
React Testing Library
Playwright
```

### 33.2 Estructura de carpetas

```text
src/
├── app/
│   ├── router.tsx
│   ├── providers.tsx
│   └── app-config.ts
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── forms/
│   ├── charts/
│   └── feedback/
│
├── features/
│   ├── dashboard/
│   ├── routines/
│   ├── workouts/
│   ├── exercises/
│   ├── progression/
│   ├── measurements/
│   ├── records/
│   ├── calendar/
│   ├── analytics/
│   └── settings/
│
├── engine/
│   ├── workout-engine/
│   ├── progression-engine/
│   ├── rest-engine/
│   ├── superset-engine/
│   ├── fst7-engine/
│   ├── pr-engine/
│   ├── volume-engine/
│   └── adherence-engine/
│
├── db/
│   ├── database.ts
│   ├── schemas/
│   ├── migrations/
│   └── repositories/
│
├── models/
├── services/
├── store/
├── hooks/
├── pages/
├── utils/
├── data/
└── types/
```

### 33.3 Separación de responsabilidades

- `features`: interfaz y casos de uso de cada módulo.
- `engine`: reglas puras y cálculo de dominio, sin componentes React.
- `db`: persistencia, migraciones y repositorios Dexie.
- `models` y `types`: contratos del dominio.
- `services`: importación, exportación, notificaciones y efectos externos locales.
- `store`: estado efímero de interfaz y sesión activa, no fuente definitiva de datos históricos.

---

## 34. Reglas de negocio

### 34.1 Rutina versus historial

- Editar una rutina no modifica sesiones completadas.
- Las sesiones futuras usan la versión de rutina vigente.
- Las sesiones en progreso conservan su snapshot al iniciarse.

### 34.2 Validaciones

- Peso no negativo.
- Repeticiones enteras no negativas.
- RIR dentro del rango configurado.
- RPE válido según escala activada.
- Descanso no negativo.
- Fechas válidas.
- Series y rangos de repeticiones coherentes.
- No permitir referencias a ejercicios inexistentes.

### 34.3 Eliminación

- No borrar sesiones históricas al borrar o archivar un ejercicio o rutina.
- Preferir archivado lógico para rutinas y ejercicios personalizados usados en historial.
- Pedir confirmación explícita para eliminar todos los datos.

### 34.4 Importación

Nunca sobrescribir automáticamente. Ofrecer:

```text
Reemplazar datos
Combinar datos
Cancelar
```

---

## 35. Backup e importación

### 35.1 Exportación JSON

Formato sugerido:

```json
{
  "schemaVersion": 1,
  "exportDate": "2026-09-25T00:00:00.000Z",
  "appVersion": "1.0.0",
  "data": {
    "profile": {},
    "routines": [],
    "routineVersions": [],
    "trainingDays": [],
    "exercises": [],
    "exerciseTemplates": [],
    "sessions": [],
    "sessionExercises": [],
    "setLogs": [],
    "measurements": [],
    "personalRecords": [],
    "settings": {}
  }
}
```

Nombre sugerido:

```text
forgefit-backup-YYYY-MM-DD.json
```

### 35.2 Exportación CSV

Proveer CSV separados para:

- Sesiones.
- Series.
- Ejercicios.
- Medidas.
- PRs.

### 35.3 Validación de importación

Validar:

- Versión del esquema.
- Estructura.
- Integridad de IDs.
- Referencias entre entidades.
- Fechas.
- Valores numéricos.
- Duplicados.

---

## 36. PWA y offline

La aplicación debe poder instalarse y ejecutar la experiencia principal en ausencia total de red.

### 36.1 Requisitos

- Manifesto de PWA.
- Service worker.
- Cache de assets de aplicación.
- No depender de fuentes o iconos remotos en ejecución.
- Indicador discreto de estado offline/online.
- Recuperación limpia tras actualizar la aplicación.
- Estrategia de migración de base de datos.

### 36.2 Criterio

```text
Abrir app
    ↓
Desconectar Internet
    ↓
Cerrar app
    ↓
Abrir nuevamente
    ↓
Todos los datos y flujos críticos continúan disponibles
```

---

## 37. UX/UI

### 37.1 Prioridades

1. Velocidad.
2. Legibilidad.
3. Registro rápido.
4. Uso cómodo durante el entrenamiento.
5. Historial accesible.
6. Gráficas con propósito.
7. Integridad de datos.

### 37.2 Diseño visual

- Mobile-first para modo entrenamiento.
- Diseño adaptable a tablet y escritorio.
- Tema oscuro como opción especialmente útil en gimnasio.
- Tipografía grande y contraste alto durante la sesión.
- Acciones principales visibles y alcanzables.
- Inputs numéricos sin fricción.
- Evitar exceso de tarjetas, texto y navegación durante ejecución.

### 37.3 Accesibilidad

- Navegación por teclado en escritorio.
- Áreas táctiles amplias.
- Contraste suficiente.
- Etiquetas de formularios explícitas.
- No depender únicamente del color para estados.

---

## 38. Datos de ejemplo

La primera ejecución debe ofrecer:

```text
Crear desde cero
Cargar rutina de ejemplo
Importar rutina
```

La rutina de ejemplo debe demostrar:

- Cinco días de entrenamiento.
- Rangos de repeticiones diferentes.
- RIR y RPE.
- Descansos.
- Biseries y superseries.
- FST-7.
- Historial inicial.
- Medidas corporales.
- PRs.

---

## 39. Rutina de referencia

### Lunes — Pecho + Espalda A

- Dragon Flag + Cable Crunch.
- Press inclinado con mancuernas.
- Press plano con barra.
- Crossover en polea.
- Remo con barra.

### Martes — Piernas A / Cuádriceps

- Elevación de talones de pie.
- Elevación de talones sentado.
- Sentadilla con barra.
- Sentadilla búlgara.
- Zancadas caminando.
- Extensión de cuádriceps FST-7.

### Miércoles — Hombros + Brazos

- Hanging Leg Raise + Cable Crunch.
- Press de hombros con mancuernas.
- Elevaciones laterales FST-7.
- Pájaros con mancuernas.
- Curl inclinado + extensión de tríceps sobre la cabeza.
- Curl martillo + extensión de tríceps en polea.

### Jueves — Pecho + Espalda B

- Elevación de talones de pie.
- Elevación de talones sentado.
- Press inclinado en máquina.
- Jalón unilateral en polea.
- Remo unilateral con mancuerna.
- Extensión lumbar a 45°.

### Viernes — Piernas B / Femoral + Glúteos

- Ab Wheel + Pallof Press.
- Romanian Deadlift.
- Hip Thrust.
- Sentadilla sumo.
- Curl femoral FST-7.

Esta rutina es una semilla de ejemplo; la aplicación debe permitir cualquier distribución o programación personalizada.

---

## 40. Roadmap de implementación

### Fase 1 — Foundation

- Configurar React, TypeScript, Vite y Tailwind.
- Definir tipos de dominio.
- Configurar Dexie, esquema e índices.
- Crear repositorios.
- Crear migraciones iniciales.
- Configurar rutas y layout base.

### Fase 2 — Biblioteca y rutinas

- Biblioteca local de ejercicios.
- Ejercicios personalizados.
- CRUD de rutinas.
- Días de entrenamiento.
- Plantillas de ejercicios.
- Rutina activa y duplicación.

### Fase 3 — Sesiones y Workout Engine básico

- Generación de sesiones.
- Estados de sesión.
- Snapshots de plantilla.
- Resolución de rendimiento anterior.
- Flujo de ejercicios y series.

### Fase 4 — Modo entrenamiento

- Registro de peso, reps, RIR/RPE y técnica.
- Temporizador de descanso.
- Progreso de sesión.
- Notas.
- Finalización y resumen de sesión.

### Fase 5 — Progresión y PRs

- Doble progresión.
- Objetivos de siguiente sesión.
- Configuración de incrementos.
- PR Engine.
- Comparación de rendimiento.

### Fase 6 — Protocolos especiales

- Superseries.
- Biseries.
- FST-7.
- Peso corporal y asistencia.

### Fase 7 — Historial y analítica

- Historial de sesiones.
- Historial por ejercicio.
- Volumen.
- Frecuencia.
- Adherencia.
- Dashboard.
- Estancamiento inicial.

### Fase 8 — Cuerpo y periodización

- Medidas corporales.
- Gráficas de composición corporal.
- Bloques, mesociclos y microciclos.
- Deload con confirmación.

### Fase 9 — Backup y PWA

- Exportación JSON y CSV.
- Importación y validación.
- PWA.
- Service worker.
- Pruebas offline.

### Fase 10 — QA y optimización

- Unit tests de motores.
- Tests de repositorios.
- Tests de integración.
- Tests E2E.
- Optimización de consultas y renderizados.
- Accesibilidad.
- Revisión visual final.

---

## 41. MVP

El MVP debe validar el ciclo principal sin intentar abarcar todas las funciones avanzadas.

```text
Crear rutina
    ↓
Generar sesión
    ↓
Registrar series
    ↓
Guardar historial
    ↓
Ver última ejecución
    ↓
Sugerir próximo objetivo
```

### 41.1 Incluido en MVP

- Perfil básico.
- Biblioteca local mínima de ejercicios.
- Rutinas y días de entrenamiento.
- Series, reps, peso, RIR y descanso.
- Sesiones generadas.
- Modo entrenamiento.
- Temporizador.
- Historial.
- Precarga de rendimiento anterior.
- Volumen básico.
- Doble progresión básica.
- PRs básicos.
- IndexedDB/Dexie.
- Exportación/importación JSON.
- PWA offline.

### 41.2 Posterior al MVP

- Constructor visual avanzado.
- Superseries, biseries y FST-7.
- Medidas y gráficas corporales.
- Deload.
- Periodización completa.
- CSV.
- Analítica avanzada.
- Sincronización opcional.
- Apps nativas.

---

## 42. Testing

### 42.1 Base de datos

- Crear y editar rutina.
- Versionar rutina.
- Crear sesión.
- Registrar series.
- Consultar historial.
- Exportar e importar.
- Validar combinación de datos.

### 42.2 Reglas de negocio

- Generación de sesiones.
- Cálculo de volumen.
- Doble progresión.
- RIR y RPE.
- Detección de PR.
- Superseries.
- FST-7.
- Adherencia.
- Estancamiento.
- Deload.

### 42.3 Interfaz

- Crear rutina.
- Iniciar sesión.
- Completar una serie.
- Gestionar descanso.
- Finalizar sesión.
- Consultar historial.
- Restaurar backup.

### 42.4 Offline

- Abrir sin red.
- Registrar sesión sin red.
- Cerrar y reabrir sin red.
- Mantener datos intactos.
- Actualizar aplicación y ejecutar migración.

---

## 43. Criterios de aceptación

La aplicación se considera funcional cuando el usuario puede:

1. Crear una rutina de cinco días.
2. Añadir y configurar ejercicios.
3. Definir series, rangos, peso, RIR/RPE y descansos.
4. Guardar y activar una rutina.
5. Ver qué entrenamiento corresponde al día.
6. Entrenar completamente sin Internet.
7. Consultar rendimiento anterior por ejercicio.
8. Registrar cada serie rápidamente.
9. Usar descanso automático.
10. Finalizar una sesión y ver su resumen.
11. Consultar la sesión posteriormente sin pérdida de datos.
12. Ver el historial por ejercicio.
13. Detectar PRs.
14. Calcular volumen y adherencia.
15. Consultar progreso mediante métricas y gráficas útiles.
16. Registrar medidas corporales.
17. Usar biseries, superseries y FST-7.
18. Gestionar mesociclos y microciclos.
19. Crear deload con confirmación.
20. Exportar todos los datos.
21. Importar un backup validado.
22. Cerrar, desconectar Internet y abrir nuevamente sin pérdida de información.

---

## 44. No objetivos iniciales

Para proteger el foco del producto, no son prioridades de la primera versión:

- Red social.
- Feed de contenido.
- Competencias entre usuarios.
- Dependencia obligatoria de wearables.
- IA que modifique automáticamente planes sin permiso.
- Nutrición completa o contador de calorías.
- Streaming de videos de ejercicios.
- Backend requerido para entrenar.

---

## 45. Evolución futura

Después de consolidar el núcleo local, se puede agregar de forma opcional:

- Sincronización cifrada entre dispositivos.
- Exportación a servicios de salud o fitness.
- Aplicación móvil nativa con React Native/Expo.
- Aplicación de escritorio con Electron.
- Compartir rutinas mediante archivos JSON.
- Marketplace de plantillas, si se desea.
- Asistente IA local para interpretar historial, siempre con recomendaciones explicables y confirmación del usuario.
- Integración opcional con wearables.

La arquitectura debe mantener el motor de entrenamiento independiente de la UI y de cualquier proveedor cloud para habilitar estas extensiones.

---

## 46. Definición final

ForgeFit debe construirse como un **Offline Training Operating System**.

```text
RUTINA VERSIONADA
        ↓
WORKOUT ENGINE
        ↓
SESIÓN INTERACTIVA
        ↓
REGISTRO REAL E INMUTABLE
        ↓
HISTORIAL Y ANALÍTICA
        ↓
PRÓXIMO OBJETIVO EXPLICABLE
```

La experiencia final debe sentirse así:

```text
CONFIGURO MI RUTINA UNA VEZ
          ↓
FORGEFIT RECUERDA LO QUE ME TOCA
          ↓
ME MUESTRA LO QUE HICE ANTES
          ↓
REGISTRO MI ENTRENAMIENTO EN SEGUNDOS
          ↓
CONTROLA MIS DESCANSOS
          ↓
GUARDA MI HISTORIAL
          ↓
ME MUESTRA MI PROGRESO
          ↓
ME PROPONE EL SIGUIENTE OBJETIVO
```

Las prioridades innegociables son:

```text
Simplicidad
Velocidad
Offline
Privacidad
Integridad de datos
Historial
Progresión explicable
Control del usuario
```
