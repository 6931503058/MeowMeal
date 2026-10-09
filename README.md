## MeowMeal
Feline Food Intake &amp; Early Anomaly Monitoring System
## Problem Statement (Clinical Focus)

- **What the problem is:** Post-op & chronically ill cats require strict nutritional compliance to prevent fatal relapses or hepatic lipidosis. 
Irregular wet-diet leftovers make home tracking difficult, leaving vet checkups without objective data.

- **Who faces this:** Cat Owner, Post-op/chronic feline caregivers and attending veterinarians.

- **Why it matters:** Prolonged underfeeding triggers organ failure, emergency re-hospitalization, and lost diagnostic time.

## Demo
- Web: _(add your GitHub Pages link here)_
- Screenshots: _(add images to `docs/screenshots/` and link them here)_


## Core Feature (5 FRs)

| FR | Feature | Detail |
|----|---------|----------------|
| FR-1 | Cat Profile | Add/edit name, age, weight, diagnosis context, and daily intake target, with input validation
| FR-2 | Manual meal logging | Food-remaining buttons (0/25/50/75/100%), prescription diet tag, and an "extra snack" flag excluded from alerts
| FR-3 | Early Anomaly Alert (Golden Thread) | Intake below target for 5 consecutive days triggers a high-priority alert recommending a vet visit; the counter resets after a normal day
| FR-4 | 30-day trend chart | Daily intake bar chart; shows "No logs available" when empty
| FR-5 | Visual Portion Estimation (AI)| Upload a bowl photo for an editable suggested percentage; below 60% confidence it asks for manual selection
## Out of scope
Water intake, stool/urine/litter box analysis, behavioral video tracking, physical symptom detection,
other species, automated diagnosis or prescription.
## Tech Stack

JavaScript, CSS, HTML



## Running Tests

```bash
git clone https://github.com/6931503058/MeowMeal.git
cd MeowMeal
```
Then open `meowmeal.html` in a browser. No installation needed.
Click **Sample data** to see the alert and chart immediately.
## Features

- Home
- Cat Profile
- Manual meal logging
- Early anomaly alert
- 30-day trend view
- AI portion estimate


## Project Document
- [M1 Team Charter](https://drive.google.com/file/d/1BN0T683GlNzGHjN9GKIk_If5k1FUJEnk/view?usp=drive_link)
- [M2 Software Requirements Specification](https://drive.google.com/file/d/1HvYE0niH5jl0mLq1rcOxuX-44xeZwNSX/view?usp=drive_link)
## Member
| Name | ID | Role |
| --- | --- | --------|
| Khwanhathai Phoemsuk |6931503025| README.md
| Parewa Yawram |6931503058 | App Shell & Navigation
|Pattarawat nutsa | 6931503060 | FR-4: Recovery Trend Dashboard
| Puree Suesat | 6931503062 | FR-1 & FR-2: Profile & Manual Log UI
| Korawit phaichitkunchon | 6931503099 |FR-5: AI Portion Screen & Fallback Flow


## Team
Team **I don't know** · Introduction to Software Engineering (15031001)
## Disclaimer 
MeowMeal is not a diagnostic tool and does not replace a veterinary exam.
If your cat shows abnormal symptoms, please consult a veterinarian.
