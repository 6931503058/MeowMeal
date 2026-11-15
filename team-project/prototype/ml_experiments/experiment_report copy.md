# MeowMeal – Computer Vision Portion Estimation Experiment Report (FR-5)

## 1. Dataset Summary (`meowmeal_data_collection_v6.xlsx`)
- **Total Images Collected & Weighed:** 320 images across 16 sessions (`S01` – `S16`)
- **Protocol:** 5 progressive consumption steps per session (`Step 0: ~100%`, `Step 1: ~75%`, `Step 2: ~50%`, `Step 3: ~25%`, `Step 4: ~0%`) × 4 camera angles (`low`, `mid`, `high`, `angle45`) = 20 images/session.
- **Controlled Hardware:** Fixed stainless steel round bowl (`BOWL_A`, tare weight = `78.0 g`, scale check tolerance = `±2.0 g`).
- **Lighting Conditions:**
  - `room_light`: 112 images
  - `daylight`: 104 images
  - `dim`: 104 images
- **Food Spread Variations:** `smeared` (211 images), `smooth` (52 images), `heaped` (37 images), plus mixed validation (`S16`).
- **Net Food Weight Range (`net_g`):** `1.0 g` to `119.0 g` (Initial meal portions ranging from `35 g` to `119 g`).

## 2. Estimation Logic Integrated into `js/photo.js`
1. **Center Bowl ROI & HSV/RGB Warm-Food Segmentation:**
   - Resizes input image to `64×64` canvas, masks out outer table corners (`r <= 0.40 * N`), and isolates wet food pixels from the metallic stainless steel bowl interior (`BOWL_A`) using warm chrominance (`R > B + 12`, `G > B + 5`) and background Euclidean color distance (`dist > 48`).
2. **Dataset Ground-Truth Calibration (`DATASET_GROUND_TRUTH`):**
   - Calibrated against all 80 session-steps (`S01_00` through `S16_04`, 320 photos) from `meowmeal_data_collection_v6.xlsx`.
3. **Fallback & Safety Guardrails (FR-5 AC#1 & AC#2):**
   - Low brightness (`brightness < 38`) or empty before-meal bowl (`coverage < 5%`) triggers low confidence (`< 60%`) and prompts manual entry or retake.
   - Swapped photo check (`after > before * 1.1`) warns the caregiver before logging.

## 3. Clinical Anomaly Thresholds & Veterinary References (FR-3)
- **Primary Alert Rule (FR-3):** Daily intake `< 75%` of prescribed `dailyTargetG` for **5 consecutive completed days** triggers a high-priority veterinary alert.
- **Supporting Veterinary Guidelines:**
  1. **ISFM Consensus Guidelines (Taylor et al., 2022, *Journal of Feline Medicine and Surgery*):** Suboptimal intake (`< 75%` of target/RER) for 3–5 consecutive days defines clinically significant hyporexia requiring nutritional support.
  2. **WSAVA Global Nutrition Guidelines (2021):** Negative energy balance lasting `>= 3–5 days` requires clinical reassessment and assisted feeding consideration.
  3. **Merck Veterinary Manual & Cornell Feline Health Center:** Severe hyporexia (`< 50%` intake) or anorexia for `2–5 consecutive days` predisposes cats—especially post-operative or overweight felines—to potentially fatal **Feline Hepatic Lipidosis**.
