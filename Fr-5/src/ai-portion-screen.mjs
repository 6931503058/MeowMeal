import { analyzePortion } from './portion-analysis.mjs';

const STATES = Object.freeze({
  READY: 'READY',
  ANALYZING: 'ANALYZING',
  SUCCESS: 'SUCCESS',
  FALLBACK: 'FALLBACK',
});

export function mountAiPortionScreen(
  root,
  { onManualPortionRequest, onAnalyzeImage, onBack } = {},
) {
  if (!(root instanceof HTMLElement)) {
    throw new TypeError('The AI Portion screen requires a root HTML element.');
  }

  let state = STATES.READY;
  let result = null;
  let errorMessage = '';
  let integrationMessage = '';
  let selectedImage = null;
  let imageUrl = null;
  let isManualResult = false;
  let manualPortionPercent = '75';

  function render() {
    const isAnalyzing = state === STATES.ANALYZING;
    const isModelConnected = typeof onAnalyzeImage === 'function';
    const status = isAnalyzing
      ? '<p class="status" role="status">Analyzing the bowl photo…</p>'
      : '';
    const error = errorMessage
      ? `<p class="message message--warning" role="alert">${errorMessage}</p>`
      : '';
    const integration = integrationMessage
      ? `<p class="integration-note" role="status">${integrationMessage}</p>`
      : '';

    let outcome = '';

    if (state === STATES.SUCCESS) {
      outcome = `
        <section class="result-card" aria-labelledby="result-title">
          <p class="eyebrow">${isManualResult ? 'Manual entry' : 'Analysis complete'}</p>
          <h2 id="result-title">${isManualResult ? 'Selected portion' : 'Estimated portion'}</h2>
          <dl class="result-list">
            <div>
              <dt><label for="portion-percent">Portion (%)</label></dt>
              <dd>
                <input id="portion-percent" data-action="edit-portion" type="number"
                  min="0" max="100" step="1" value="${result.portionPercent}"
                  aria-label="Estimated portion percentage">
              </dd>
            </div>
            ${
              isManualResult
                ? ''
                : `<div><dt>Confidence</dt><dd>${result.confidencePercent}%</dd></div>`
            }
          </dl>
          <button class="button button--primary" type="button" data-action="retry" ${selectedImage ? '' : 'disabled'}>
            Analyze this photo again
          </button>
        </section>`;
    } else if (state === STATES.FALLBACK) {
      outcome = `
        <section class="result-card result-card--warning" aria-labelledby="fallback-title">
          <p class="eyebrow">Image quality issue</p>
          <h2 id="fallback-title">We couldn’t analyze this photo reliably</h2>
          <p class="message">
            Confidence is below 60%. Choose the portion manually, or try this photo again.
          </p>
          <p class="confidence">Confidence: <strong>${result.confidencePercent}%</strong></p>
          <label for="manual-portion">Select the remaining portion</label>
          <select id="manual-portion" data-action="select-manual-portion">
            ${[0, 25, 50, 75, 100]
              .map(
                (percent) =>
                  `<option value="${percent}" ${manualPortionPercent === String(percent) ? 'selected' : ''}>${percent}%</option>`,
              )
              .join('')}
          </select>
          <div class="button-row">
            <button class="button button--primary" type="button" data-action="save-manual">
              Use selected portion
            </button>
            <button class="button button--secondary" type="button" data-action="retry" ${selectedImage ? '' : 'disabled'}>
              Retry analysis
            </button>
            <button class="button button--secondary" type="button" data-action="manual">
              Open manual meal entry (FR-2)
            </button>
          </div>
          ${integration}
        </section>`;
    }

    root.innerHTML = `
      <section class="portion-screen" aria-labelledby="screen-title">
        <button class="button button--secondary back-button" type="button" data-action="back">
          ← Back
        </button>
        <header class="screen-header">
          <p class="eyebrow">MeowMeal · Demo</p>
          <h1 id="screen-title">AI Portion</h1>
          <p>Upload a bowl photo to get a suggested portion estimate.</p>
        </header>
        <div class="camera-card">
          ${
            selectedImage
              ? '<img data-role="photo-preview" alt="Preview of the uploaded bowl photo" hidden style="max-width:100%;max-height:220px;object-fit:contain">'
              : '<div class="bowl-illustration" aria-hidden="true"><span></span></div>'
          }
          <p data-role="photo-name">${selectedImage ? '' : 'Choose a photo of your cat’s bowl.'}</p>
          <label class="button button--secondary" for="portion-photo" ${isAnalyzing ? 'aria-disabled="true"' : ''}>
            ${selectedImage ? 'Choose another photo' : 'Choose bowl photo'}
          </label>
          <input id="portion-photo" data-action="select-photo" type="file" accept="image/*" hidden ${isAnalyzing ? 'disabled' : ''}>
        </div>
        ${error}
        ${status}
        ${
          state === STATES.READY || isAnalyzing
            ? `<div class="button-row">
                <button class="button button--primary" type="button" data-action="photo" ${isAnalyzing || !selectedImage ? 'disabled' : ''}>
                  ${isAnalyzing ? 'Analyzing…' : 'Analyze photo'}
                </button>
                ${
                  isModelConnected
                    ? ''
                    : `<button class="button button--secondary" type="button" data-action="poor" ${isAnalyzing || !selectedImage ? 'disabled' : ''}>
                        Simulate confidence below 60%
                      </button>`
                }
              </div>`
            : ''
        }
        ${outcome}
        <p class="demo-note">${
          isModelConnected
            ? 'Connected image analysis is enabled. The selected photo is passed to the onAnalyzeImage callback.'
            : 'Demo only: the photo is previewed locally; analysis is simulated and no image is sent to an AI service.'
        }</p>
      </section>`;

    const preview = root.querySelector('[data-role="photo-preview"]');
    if (preview && imageUrl) {
      preview.src = imageUrl;
      preview.hidden = false;
    }
    const photoName = root.querySelector('[data-role="photo-name"]');
    if (photoName && selectedImage) {
      photoName.textContent = selectedImage.name;
    }
  }

  async function runAnalysis(imageCondition) {
    if (state === STATES.ANALYZING) {
      return;
    }
    if (!selectedImage) {
      errorMessage = 'Choose a bowl photo before starting the analysis.';
      render();
      return;
    }

    state = STATES.ANALYZING;
    result = null;
    errorMessage = '';
    integrationMessage = '';
    isManualResult = false;
    render();

    try {
      result = await analyzePortion(selectedImage, {
        onAnalyzeImage: imageCondition === 'clear' ? onAnalyzeImage : undefined,
        demoCondition: typeof onAnalyzeImage === 'function' ? undefined : imageCondition,
      });
      state = result.confidencePercent < 60 ? STATES.FALLBACK : STATES.SUCCESS;
      manualPortionPercent = '75';
    } catch (error) {
      state = STATES.READY;
      errorMessage = 'Photo analysis could not be completed. Please try again.';
      console.error('AI Portion analysis failed.', error);
    }

    render();
  }

  async function handleManualPortionRequest() {
    integrationMessage = '';

    if (typeof onManualPortionRequest !== 'function') {
      integrationMessage =
        'FR-2 is not connected yet. Connect this action with the onManualPortionRequest callback.';
      render();
      return;
    }

    try {
      await onManualPortionRequest({ source: 'fr-5-ai-portion' });
    } catch (error) {
      integrationMessage = 'Could not open the FR-2 manual portion screen. Please try again.';
      console.error('FR-2 manual portion integration failed.', error);
      render();
    }
  }

  function clearSelectedImage() {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
      imageUrl = null;
    }
    selectedImage = null;
  }

  function handlePhotoSelection(file) {
    if (!file) {
      return;
    }

    clearSelectedImage();
    if (!file.type.startsWith('image/')) {
      state = STATES.READY;
      result = null;
      errorMessage = 'Choose a valid image file.';
      render();
      return;
    }

    try {
      selectedImage = file;
      imageUrl = URL.createObjectURL(file);
      state = STATES.READY;
      result = null;
      errorMessage = '';
      integrationMessage = '';
      isManualResult = false;
    } catch (error) {
      selectedImage = null;
      state = STATES.READY;
      result = null;
      errorMessage = 'The selected photo could not be previewed. Please choose another image.';
      console.error('AI Portion photo preview failed.', error);
    }

    render();
  }

  function handleChange(event) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) {
      return;
    }

    if (target.dataset.action === 'select-photo') {
      handlePhotoSelection(target.files?.[0]);
      return;
    }

    if (target.dataset.action === 'select-manual-portion') {
      manualPortionPercent = target.value;
      return;
    }

    if (target.dataset.action === 'edit-portion' && state === STATES.SUCCESS) {
      const value = Number(target.value);
      if (target.value.trim() === '' || !Number.isInteger(value) || value < 0 || value > 100) {
        errorMessage = 'Enter a whole-number portion between 0 and 100.';
        render();
        return;
      }

      result.portionPercent = value;
      errorMessage = '';
      render();
    }
  }

  function handleClick(event) {
    const target = event.target;
    const button = target instanceof Element ? target.closest('button[data-action]') : null;
    if (!button || !root.contains(button)) {
      return;
    }

    if (button.dataset.action === 'back') {
      if (typeof onBack === 'function') {
        onBack();
      } else {
        const referrer = document.referrer;
        const sameOriginReferrer =
          referrer && new URL(referrer).origin === window.location.origin;

        if (sameOriginReferrer) {
          window.history.back();
        } else {
          window.location.assign('../index.html');
        }
      }
      return;
    }

    if (state === STATES.ANALYZING) {
      return;
    }

    switch (button.dataset.action) {
      case 'photo':
        void runAnalysis('clear');
        break;
      case 'retry':
        void runAnalysis('clear');
        break;
      case 'poor':
        void runAnalysis('poor');
        break;
      case 'save-manual':
        result = {
          portionPercent: Number(manualPortionPercent),
          confidencePercent: null,
          imageCondition: 'manual',
        };
        isManualResult = true;
        state = STATES.SUCCESS;
        errorMessage = '';
        integrationMessage = '';
        render();
        break;
      case 'manual':
        void handleManualPortionRequest();
        break;
      default:
        break;
    }
  }

  root.addEventListener('change', handleChange);
  root.addEventListener('click', handleClick);

  render();

  return {
    destroy() {
      root.removeEventListener('change', handleChange);
      root.removeEventListener('click', handleClick);
      clearSelectedImage();
    },
  };
}
