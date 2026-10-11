## FR-5: AI Portion demo

This standalone, framework-free JavaScript demo uses native browser modules.
Serve the repository root with a local static web server and open `index.html` to
try the AI Portion flow. The analysis is mocked in `Fr-5/src/portion-analysis.mjs`.
A selected image is previewed locally and is not sent to a server or external AI
service in demo mode.

Choose a bowl photo to preview it, then run the analysis. Without a model callback,
the screen uses a clearly labeled simulated result for UI testing. The suggested
portion can be edited from 0–100%. The low-confidence simulation enters a fallback
flow with manual portion choices (0/25/50/75/100), retry, and an optional FR-2
integration action.

No trained portion-estimation model is currently included in this project. To
connect one, import `mountAiPortionScreen` and pass the view's root element along
with an `onAnalyzeImage` callback. The callback receives the selected browser
`File` and must resolve to `{ portionPercent, confidencePercent }`, where the
portion is an integer from 0 to 100 and confidence is a number from 0 to 100:

```js
mountAiPortionScreen(root, {
  onAnalyzeImage: async (imageFile) => {
    // Pass imageFile to a real inference implementation.
    return model.predict(imageFile);
  },
  onManualPortionRequest: ({ source }) => openManualMealEntry(source),
  onBack: () => app.show('home'),
});
```

Invalid model results and inference errors are surfaced in the screen instead of
being replaced by simulated predictions. The image is passed only to the callback;
that integration determines whether it is processed locally or sent to a service.
The Back button uses `onBack` when provided; otherwise it returns to a same-origin
browser referrer or falls back to `../index.html` for the main MeowMeal app.
The returned object has a `destroy()` method to remove event listeners and release
the local image preview when the view unmounts.