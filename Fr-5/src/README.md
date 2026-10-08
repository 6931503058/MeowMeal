## FR-5: AI Portion demo

This standalone, framework-free JavaScript demo uses native browser modules. Open
`index.html` in a local static web server to try the AI Portion flow. The analysis
is mocked in `src/portion-analysis.mjs`; no camera, image recognition, or external
AI service is used.

The low-light / blurry simulation enters the fallback flow and offers retry or
manual entry. FR-2 is intentionally not implemented here. To connect its screen,
pass an `onManualPortionRequest` callback when calling
`mountAiPortionScreen(root, { onManualPortionRequest })` in `src/app.mjs`. The
callback receives `{ source: 'fr-5-ai-portion' }`. Until the callback is provided,
the fallback displays a clear not-connected-yet placeholder.