import { analyzePortion } from './portion-analysis.mjs';

const STATES = Object.freeze({
  READY: 'READY',
  ANALYZING: 'ANALYZING',
  SUCCESS: 'SUCCESS',
  FALLBACK: 'FALLBACK',
});

export function mountAiPortionScreen(root, { onManualPortionRequest } = {}) {
  if (!(root instanceof HTMLElement)) {
    throw new TypeError('The AI Portion screen requires a root HTML element.');
  }

  let state = STATES.READY;
  let result = null;
  let errorMessage = '';
  let integrationMessage = '';

  function render() {
    const isAnalyzing = state === STATES.ANALYZING;
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
          <p class="eyebrow">Analysis complete</p>
          <h2 id="result-title">Estimated portion</h2>
          <dl class="result-list">
            <div><dt>Portion</dt><dd>${result.portionPercent}%</dd></div>
            <div><dt>Confidence</dt><dd>${result.confidencePercent}%</dd></div>
          </dl>
          <button class="button button--primary" type="button" data-action="retry">
            Analyze again
          </button>
        </section>`;
    } else if (state === STATES.FALLBACK) {
      outcome = `
        <section class="result-card result-card--warning" aria-labelledby="fallback-title">
          <p class="eyebrow">Image quality issue</p>
          <h2 id="fallback-title">We couldn’t analyze this photo reliably</h2>
          <p class="message">
            The image appears too dark, blurry, or unclear. Please take another photo
            or enter the portion manually.
          </p>
          <p class="confidence">Confidence: <strong>${result.confidencePercent}%</strong></p>
          <div class="button-row">
            <button class="button button--primary" type="button" data-action="retry">
              Retry / take another photo
            </button>
            <button class="button button--secondary" type="button" data-action="manual">
              Switch to manual portion input (FR-2)
            </button>
          </div>
          ${integration}
        </section>`;
    }

    root.innerHTML = `
      <section class="portion-screen" aria-labelledby="screen-title">
        <header class="screen-header">
          <p class="eyebrow">MeowMeal · Demo</p>
          <h1 id="screen-title">AI Portion</h1>
          <p>Estimate how much food is in your cat’s bowl.</p>
        </header>
        <div class="camera-card" aria-hidden="true">
          <div class="bowl-illustration"><span></span></div>
          <p>${isAnalyzing ? 'Checking the bowl…' : 'Bowl photo preview'}</p>
        </div>
        ${error}
        ${status}
        ${
          state === STATES.READY || isAnalyzing
            ? `<div class="button-row">
                <button class="button button--primary" type="button" data-action="photo" ${isAnalyzing ? 'disabled' : ''}>
                  ${isAnalyzing ? 'Analyzing…' : 'Take a photo'}
                </button>
                <button class="button button--secondary" type="button" data-action="poor" ${isAnalyzing ? 'disabled' : ''}>
                  Simulate low-light / blurry photo
                </button>
              </div>`
            : ''
        }
        ${outcome}
        <p class="demo-note">Demo only: no camera, image recognition, or AI service is used.</p>
      </section>`;
  }

  async function runAnalysis(imageCondition) {
    if (state === STATES.ANALYZING) {
      return;
    }

    state = STATES.ANALYZING;
    result = null;
    errorMessage = '';
    integrationMessage = '';
    render();

    try {
      result = await analyzePortion(imageCondition);
      state = result.confidencePercent < 60 ? STATES.FALLBACK : STATES.SUCCESS;
    } catch (error) {
      state = STATES.READY;
      errorMessage = 'The demo analysis could not be completed. Please try again.';
      console.error('AI Portion demo analysis failed.', error);
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

  root.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button || !root.contains(button) || state === STATES.ANALYZING) {
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
      case 'manual':
        void handleManualPortionRequest();
        break;
      default:
        break;
    }
  });

  render();
}
