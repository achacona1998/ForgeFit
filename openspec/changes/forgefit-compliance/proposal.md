# ForgeFit — Especificación de Desarrollo: Cumplimiento de Producto

**Cambio**: forgefit-compliance
**Fecha**: 2026-09-27
**Estado**: Propuesto
**Propósito**: Cubrir las brechas entre la implementación actual y la especificación integral del producto

## Resumen

La implementación actual de ForgeFit cumple aproximadamente el 70% de la especificación integral. Este documento define los cambios necesarios para alcanzar el 100% de cumplimiento funcional según los criterios de aceptación definidos en `ForgeFit_Especificacion_Integral.md`.

## Capacidades a Agregar

### 1. Navegación Completa (9 tabs)
- Agregar tabs dedicadas: Entrenar, Biblioteca, Medidas, PRs
- Pantalla de detalle por ejercicio con historial
- Eliminar el tab "Más" como catch-all

### 2. Workout Engine Completo
- Temporizador de descanso con countdown visible
- Flujo FST-7 con indicador "Serie N/7"
- Flujo de superseries y biseries
- Navegación ejercicio → ejercicio
- Marcar series como omitidas
- Rating de técnica por serie (Excelente/Aceptable/Pobre)
- Diferenciación visual datos previos vs actuales

### 3. Biblioteca de Ejercicios Expandida
- Aliases para ejercicios
- Filtros por músculo, equipo, categoría
- Campos: directMuscles, secondaryMuscles, videoUrl, notes
- Pantalla de biblioteca dedicada con búsqueda avanzada

### 4. Schema de Datos Completo
- Tablas separadas: routineVersions, trainingDays, exerciseTemplates, setLogs
- Entity FitnessDatabase completa: trainingBlocks, mesocycles, microcycles, workoutRules, backupsMetadata
- Campos SetLog: type, techniqueRating, restPlannedSeconds, restActualSeconds, skipped
- Migration de datos existentes a nuevo schema

### 5. Analytics y Gráficas
- Selector de periodo (7d, 30d, 3m, 6m, 1y, todo)
- Gráficas: peso, grasa, perímetros, volumen, adherencia
- Gráficas por ejercicio (peso, reps, volumen, RIR)
- Gráfica de volumen por grupo muscular
- Gráfica de adherencia

### 6. Contexto de Recuperación y Progresión
- Formulario de recuperación por sesión (energía, fatiga, sueño, sensaciones, dolor)
- Pantalla de configuración de progresión por ejercicio
- Visualización de semanas de doble progresión
- Flujo de confirmación de deload

## Capacidades Modificadas

| Módulo | Cambio |
|--------|--------|
| Navegación | De 4 tabs a 9 tabs |
| Workout | De registro simple a motor completo |
| Biblioteca | De búsqueda básica a filtros avanzados |
| Progreso | De 1 gráfica a 6 tipos de gráficas |
| Schema | De schema plano a relacional completo |
| Datos de set | De arrays anidados a tabla separada |
| Deload | De inline a entidad con confirmación |

## Capacidades Removidas

| Módulo | Razón |
|--------|-------|
| Tab "Más" | Redistribuido a tabs dedicadas |
| Almacenamiento de sets como arrays anidados | Reemplazado por tabla setLogs separada |

## Dependencias entre Fases

```
Fase 1: Schema/Data Migration (BASE — todos dependen de esto)
    ↓
Fase 2: Workout Engine + Rest Timer
    ↓
Fase 3: Navegación (nuevos tabs)
    ↓
Fase 4: Biblioteca expandida
    ↓
Fase 5: Analytics y Gráficas
    ↓
Fase 6: Recovery + Progresión config
    ↓
Fase 7: Tests unitarios + integración
```

## Criterios de Aceptación (§43 de la especificación)

| # | Criterio | Estado Actual | Objetivo |
|---|---------|---------------|----------|
| 1-12 | ✅ Ya cubiertos | 12/22 | — |
| 13 | ❌ Descanso automático | Sin timer | Agregar |
| 14 | ❌ Biseries/Superseries/FST-7 | Solo configurables | Agregar flujo |
| 15 | ❌ Mesociclos/Microciclos | Strings en rutina | Tablas separadas |
| 16 | ❌ Deload con confirmación | Funcional sin confirmación | Agregar UI |
| 17 | ❌ Gráficas útiles | 1 BarChart | 6+ tipos |
| 18 | ❌ Progreso por ejercicio | Sin gráficas | Agregar |
| 19-22 | ✅ Cubiertos | — | — |
| TOTAL | | 15/22 | **22/22** |

## Riesgos

1. **Migración de datos**: Mover sets de arrays anidados a tabla `setLogs` requiere script de migración
2. **Tamaño de la change**: 6 dominios pueden ser grandes — se recomiendan sub-changes por dominio
3. **Compatibilidad con New Arch**: Las gráficas y componentes nuevos deben funcionar con `newArchEnabled: false`
4. **PWA**: No cubierta en este change — requiere `vite-plugin-pwa` o equivalente para Expo
