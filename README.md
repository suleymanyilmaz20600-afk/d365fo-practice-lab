# D365FO Finance + SCM + X++ Practice Lab — Phase 6 Complete

Bu repo, D365FO Finance + SCM + X++ eğitim kitabına paralel ilerleyen browser tabanlı çalışma ortamıdır.

## Tamamlanan fazlar
- **Faz 1:** D365FO benzeri shell, modül menüleri, Finance/SCM ekranları.
- **Faz 2:** GL journal validate/post/voucher; AP/AR invoice-payment-settlement; posting profile, VAT, exchange-rate ve FX farkı pratikleri.
- **Faz 2.1:** X++ Practice Center — iş bağlamı / sorun / istek / soru / başarı kriterleri / ipuçları / referans yaklaşım.
- **Faz 3:** Production Troubleshooting Lab — evidence-first diagnosis, standard fix, validation ve mentor review.
- **Faz 4:** SCM Junior Transaction Engine — product master, PO, receipt, vendor invoice, inventory, sales, planning, firming ve costing/Finance bridge.
- **Faz 5:** X++ Developer Lab — Foundation → Mid+ 12 lab: OOP, metadata/AOT, query/join, transactions, set-based performance, extension/CoC, SysOperation/batch, Data Entity/OData, security, testing ve code review.
- **Faz 6:** End-to-End Techno-Functional Capstone — discovery, fit-gap, Finance setup, master data, P2P, O2C, close, production incident, X++ change request, UAT, cutover, go-live ve handover.

## Faz 6 capstone senaryosu
Kurgusal **Anatolia Office Systems / AOS1** legal entity’si üzerinden Finance + SCM + X++ birbirine bağlanır. Kullanıcı önce gereksinimi anlamalı, sonra standard/configuration/process/custom kararını vermeli; transaction ve accounting etkisini takip etmeli; production incident’i evidence ile teşhis etmeli ve ancak kritik UAT/cutover koşulları sağlandıktan sonra handover gate’i kapatmalıdır.

### Capstone milestone’ları
1. Discovery & scope
2. Fit-gap & solution strategy
3. Finance foundation
4. Master data readiness
5. P2P end-to-end
6. O2C end-to-end
7. Month-end close
8. Production incident
9. X++ change request
10. UAT, cutover & go-live
11. Handover & final assessment

> Faz 5/6 içindeki browser analyzer gerçek X++ compiler/debugger değildir. Pattern-based öğretim ve design/code-review simülasyonudur. Gerçek compile/debug için desteklenen D365FO developer environment gerekir.

İlerleme `localStorage` üzerinde tutulur. Faz 6 ayrıca capstone progress’ini JSON olarak dışa aktarabilir.
