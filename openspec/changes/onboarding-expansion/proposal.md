# Propuesta: Expansión de Datos en Onboarding

## Objetivo
Mejorar la pantalla de bienvenida (Onboarding) para recopilar el **Peso Actual** y los **Días de Entrenamiento** que el usuario planea realizar a la semana. Esto permitirá inicializar la gráfica de peso corporal y ajustar mejor las rutinas generadas.

## Cambios Requeridos

### 1. Actualización de Tipos (`types/fitness.ts`)
- Añadir `weight?: number` a la interfaz `AthleteProfile`.
- Añadir `daysPerWeek?: number` a la interfaz `AthleteProfile`.

### 2. Modificación de la Interfaz (`app/(tabs)/index.tsx`)
- Añadir un nuevo campo de entrada (input numérico) para **Peso actual**.
- Añadir un selector visual (Choice Row o Stepper) para **Días de entrenamiento por semana** (ej. de 2 a 6 días).
- Actualizar la función `submit` para validar y enviar estos nuevos datos.

### 3. Lógica de Contexto (`context/fitness-context.tsx`)
- Modificar `completeOnboarding` para aceptar los nuevos campos `weight` y `daysPerWeek`.
- Si el usuario provee un `weight`, crear automáticamente el **primer registro en la tabla de Medidas (Measurements)** asociado a la fecha actual, para que la gráfica de progreso inicie con datos reales.

## Siguiente Fase
Si apruebas este plan, procederé a implementar los cambios en el código de inmediato.