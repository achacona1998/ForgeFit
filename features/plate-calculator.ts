export interface PlateCalculation {
  barWeight: number;
  targetWeight: number;
  platesPerSide: number[];
  actualWeight: number;
  remainder: number;
}

export function calculatePlates(
  targetWeight: number,
  barWeight: number,
  availablePlates: number[]
): PlateCalculation {
  // Sort plates descending
  const sortedPlates = [...availablePlates].sort((a, b) => b - a);
  
  // Need to find weight to put on ONE side
  let remainingWeightPerSide = (targetWeight - barWeight) / 2;
  
  if (remainingWeightPerSide <= 0) {
    return {
      barWeight,
      targetWeight,
      platesPerSide: [],
      actualWeight: barWeight,
      remainder: 0
    };
  }

  const platesPerSide: number[] = [];
  
  for (const plate of sortedPlates) {
    // How many pairs of this plate can we fit?
    const count = Math.floor(remainingWeightPerSide / plate);
    for (let i = 0; i < count; i++) {
      platesPerSide.push(plate);
      remainingWeightPerSide -= plate;
    }
  }

  // Handle JS floating point precision issues
  remainingWeightPerSide = Math.round(remainingWeightPerSide * 100) / 100;

  const actualWeight = barWeight + (platesPerSide.reduce((sum, p) => sum + p, 0) * 2);

  return {
    barWeight,
    targetWeight,
    platesPerSide,
    actualWeight,
    remainder: remainingWeightPerSide * 2 // total remainder across both sides
  };
}
