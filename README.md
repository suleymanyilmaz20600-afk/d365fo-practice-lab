# D365FO Finance + SCM + X++ Practice Lab — Phase 5

Bu repo, D365FO Finance + SCM + X++ eğitim kitabına paralel ilerleyen browser tabanlı çalışma ortamıdır.

## Tamamlanan fazlar
- **Faz 1:** D365FO benzeri shell, modül menüleri, Finance/SCM ekranları.
- **Faz 2:** GL journal validate/post/voucher; AP/AR invoice-payment-settlement; posting profile, VAT, exchange-rate ve FX farkı pratikleri.
- **Faz 2.1:** X++ Practice Center — iş bağlamı / sorun / istek / soru / başarı kriterleri / ipuçları / referans yaklaşım.
- **Faz 3:** Production Troubleshooting Lab — 10 öğretici incident senaryosu, evidence-first diagnosis, standard fix, validation ve mentor review.
- **Faz 4:** SCM Junior Transaction Engine — product master, PO, receipt, vendor invoice, inventory, sales, planning, firming ve costing/Finance bridge.
- **Faz 5:** X++ Developer Lab — Foundation → Mid+ 12 lab: OOP, metadata/AOT, query/join, transaction integrity, set-based performance, extension/CoC, SysOperation/batch, Data Entity/OData, security-aware development, testing, code review ve techno-functional capstone.

## Faz 5 çalışma ilkeleri
- Önce standard/konfigürasyon, sonra custom.
- UI-only validation yerine business boundary düşün.
- Extension-first / upgrade-safe tasarım.
- N+1 ve row-by-row performans problemlerini tanı.
- `ttsBegin/ttsCommit`, `forUpdate`, concurrency ve idempotency düşün.
- `doUpdate()` gibi business logic bypass yöntemlerini varsayılan çözüm olarak kullanma.
- Security, integration, negative/boundary test ve rollback etkisini birlikte değerlendir.

> Not: Faz 5 browser içindeki analyzer gerçek X++ compiler/debugger değildir. Pattern-based öğretim ve code-review simülasyonudur. Gerçek compile/debug için desteklenen D365FO developer environment gerekir.

İlerleme `localStorage` üzerinde tutulur. Aynı GitHub Pages adresi güncellendiğinde veriler normalde korunur.
