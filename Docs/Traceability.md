
## Traceability

Problem → Requirement → Design → Feature (screen) → Test

| Problem | Requirement | Design | Feature (screen) | Test |
|---------|-------------|--------|------------------|------|
| Discharged post op/chronic cats lack static baselines; caregivers forget specific vet prescribed target volumes during home recovery. | FR-1 Add/ edit cat profile | week5 | week6-7 Status:Pass | week7 Result:Pass |
| Mushy wet recovery food smears unpredictably and fails camera logging in low light; caregivers need reliable manual entry. | FR-2 Log meal intake manually | week5 | week6-7 Status:Pass | week7 Result:Pass Result:Pass |
| Cats conceal illness; owners overlook subtle consecutive appetite loss until severe complications occur. | FR-3 Early intake anomaly alert (Golden Thread) | Anomaly Detector service running a daily aggregation check against a 5 consecutive-day drop below prescribed target. | Server-side alert job + push notification dialog prompting vet consultation | test_trigger_alert_on_5_consecutive_drops()test_reset_counter_on_normal_meal() Result:Pass |
| Vets need longitudinal intake evidence, but owners rely on vague memory. | FR-4 Historical intake trend view | w5 |  Status:Pass |  Result:Pass |
| Manual visual estimation of mushy/wet prescription diet is tedious and inconsistent across different household members. | FR-5 Visual remaining food estimation (AI) | 5 | 6-7 | 7 Result:Pass |
