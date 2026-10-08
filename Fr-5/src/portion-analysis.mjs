const ANALYSIS_DELAY_MS = 800;

function wait(milliseconds) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

export async function analyzePortion(imageCondition = 'clear') {
  if (imageCondition !== 'clear' && imageCondition !== 'poor') {
    throw new Error(`Unsupported image condition: ${imageCondition}`);
  }

  await wait(ANALYSIS_DELAY_MS);

  if (imageCondition === 'poor') {
    return {
      portionPercent: null,
      confidencePercent: 42,
      imageCondition,
    };
  }

  return {
    portionPercent: 75,
    confidencePercent: 85,
    imageCondition,
  };
}
