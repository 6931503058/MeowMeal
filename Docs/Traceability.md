
## Traceability

Problem → Requirement → Design → Feature (screen) → Test

| Problem | Requirement | Design | Feature (screen) | Test |
|---------|-------------|--------|------------------|------|
| Discharged post op/chronic cats lack static baselines; caregivers forget specific vet prescribed target volumes during home recovery. | FR-1 Add/ edit cat profile | week5 | week6-7 Status:Pass | week7 Result:Pass |
| Mushy wet recovery food smears unpredictably and fails camera logging in low light; caregivers need reliable manual entry. | FR-2 | Cloud Firestore transaction for join/leave with capacity checking. | Join/Leave button with live attendee count (current/max). Status:Pass | TC-4, TC-5, TC-6, TC-7. Result:Pass |
| Cats conceal illness; owners overlook subtle consecutive appetite loss until severe complications occur. | FR-3 | Cloud Firestore real-time listeners on session records. | Live-updating session list with status indicators (Open, Almost Full, Full, Joined, Closed). Status:Pass | TC-8, TC-9. Result:Pass |
| Vets need longitudinal intake evidence, but owners rely on vague memory. | FR-4 | Embedded Google Maps view centred on the saved coordinates, with an "Open in Google Maps" link. | View Location screen and map preview on the session details. Status:Pass | TC-10. Result:Pass |
| Manual visual estimation of mushy/wet prescription diet is tedious and inconsistent across different household members. | FR-5 | Per-session message collection in Cloud Firestore, opened only for participants. | Room Chat for joined attendees. Status:Pass | TC-11, TC-12, TC-15. Result:Pass |
