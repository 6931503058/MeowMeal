const ANALYSIS_DELAY_MS = 800;

function wait(milliseconds) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function validatePrediction(prediction) {
  if (!prediction || typeof prediction !== 'object') {
    throw new TypeError('The portion model must return a prediction object.');
  }

  const { portionPercent, confidencePercent } = prediction;
  if (
    !Number.isInteger(portionPercent) ||
    portionPercent < 0 ||
    portionPercent > 100 ||
    !Number.isFinite(confidencePercent) ||
    confidencePercent < 0 ||
    confidencePercent > 100
  ) {
    throw new RangeError(
      'The portion model must return portionPercent (integer 0–100) and confidencePercent (0–100).',
    );
  }

  return {
    portionPercent,
    confidencePercent,
    imageCondition: 'model',
  };
}

export async function analyzePortion(image, { onAnalyzeImage, demoCondition } = {}) {
  if (typeof onAnalyzeImage === 'function') {
    return validatePrediction(await onAnalyzeImage(image));
  }

  if (demoCondition !== 'clear' && demoCondition !== 'poor') {
    throw new Error('No image-analysis model is configured. Provide onAnalyzeImage to analyze photos.');
  }

  await wait(ANALYSIS_DELAY_MS);

  if (demoCondition === 'poor') {
    return {
      portionPercent: null,
      confidencePercent: 42,
      imageCondition: demoCondition,
    };
  }

  return {
    portionPercent: 75,
    confidencePercent: 85,
    imageCondition: demoCondition,
  };
}
