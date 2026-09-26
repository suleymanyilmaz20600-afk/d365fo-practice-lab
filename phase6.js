(function(){
  const KEY='d365fo-practice-lab-phase6-v1';
  const VERSION='6.0';
  const seed=()=>({version:VERSION,done:{},discovery:{},fitgap:{},setup:{},master:{},p2p:{},o2c:{},close:{},incident:{cause:'',fix:''},xpp:'',xppPass:false,uat:{},cutover:{},reflection:'',notes:{}});
  let s=load();
  function load(){try{return Object.assign(seed(),JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){return seed()}}
  function save(){localStorage.setItem(KEY,JSON.stringify(s))}
  function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
  function set(html,path){const p=document.querySelector('#page');if(!p)return;p.innerHTML='<div class="page-wrap p6-shell">'+html+'</div>';const c=document.querySelector('#breadcrumb');if(c)c.textContent=path||'Capstone > End-to-End Project'}
  function toast(m){const t=document.querySelector('#toast');if(!t)return;t.textContent=m;t.classList.remove('hidden');setTimeout(()=>t.classList.add('hidden'),2200)}
  const project={
    company:'Anatolia Office Systems',legalEntity:'AOS1',country:'Türkiye',accountingCurrency:'TRY',reportingCurrency:'EUR',goLive:'2027-01-01',
    scope:'Finance + Procurement + Inventory + Sales + sınırlı X++ extension',
    story:'AOS1; ofis mobilyası ve kurumsal sarf malzemesi satan, USD/EUR ile alım-satım yapan kurgusal bir şirkettir. Şirket yeni D365FO geçişinde finansal kontrolü artırmak, stok süreçlerini standardize etmek ve yalnız gerçek gap olan alanlarda extension kullanmak istiyor.'
  };
  const milestones=[
    ['discovery','Discovery & scope','İhtiyaçları, kapsamı, varsayımları ve açık soruları ayır.'],
    ['fitgap','Fit-gap & solution strategy','Standard / configuration / process / custom kararını gerekçelendir.'],
    ['setup','Finance foundation','Legal entity, ledger, calendar, dimensions, posting yaklaşımı.'],
    ['master','Master data readiness','Vendor, customer ve product verisini go-live öncesi temizle.'],
    ['p2p','P2P end-to-end','PO → product receipt → vendor invoice → payment/settlement.'],
    ['o2c','O2C end-to-end','Sales order → reservation → packing slip → invoice → collection.'],
    ['close','Month-end close','Subledger, bank, FX, fixed asset ve GL kapanış bağımlılıklarını sırala.'],
    ['incident','Production incident','Physical/financial inventory ve AP farkını evidence-first teşhis et.'],
    ['xpp','X++ change request','Gerçek gap için extension-first, config-driven ve testable tasarım yap.'],
    ['uat','UAT, cutover & go-live','Kritik testleri geçir, cutover görevlerini kapat ve rollback düşün.'],
    ['handover','Handover & final assessment','Kararlarını savun, riskleri özetle ve projeyi devret.']
  ];
  const requirements=[
    {id:'r1',text:'100.000 TRY üzeri vendor invoice, onaysız post edilemesin.',best:'config',why:'Önce standard workflow/approval ve mevcut kontrol noktaları araştırılır; custom ilk seçenek değildir.'},
    {id:'r2',text:'Foreign vendor borçları domestic AP hesabından ayrı takip edilsin.',best:'config',why:'Vendor posting profile ve vendor group ile standard configuration çözümüdür.'},
    {id:'r3',text:'Vendor master üzerinde A/B/C RiskCategory alanı tutulsun ve raporlansın.',best:'custom',why:'Standartta karşılayan alan yoksa EDT/enum + table/form extension gibi küçük, upgrade-safe extension uygundur.'},
    {id:'r4',text:'Purchase order confirmation öncesi bütçe yeterliliği kontrol edilsin.',best:'config',why:'Budget control ve procurement standard kabiliyetleri önce değerlendirilir.'},
    {id:'r5',text:'Her gece vendor risk skoru şirket kurallarına göre yeniden hesaplansın.',best:'custom',why:'Kural gerçekten kuruma özgüyse SysOperation/batch tabanlı custom operasyon gerekebilir.'},
    {id:'r6',text:'Ay kapanışında açık EUR AP/AR işlemleri kapanış kuruyla değerlensin.',best:'standard',why:'Foreign currency revaluation standard Finance sürecidir.'}
  ];
  const discoveryTasks=[
    ['process','P2P ve O2C süreç sahiplerini ve onay yetkilerini belirledim.'],
    ['scope','In-scope / out-of-scope maddelerini ayırdım.'],
    ['volume','Transaction hacmi, para birimleri ve batch penceresini sordum.'],
    ['controls','SoD, budget, period-close ve audit kontrollerini topladım.'],
    ['integration','Import/OData/banka gibi entegrasyon noktalarını çıkardım.'],
    ['questions','Belirsiz gereksinimleri “çözüm” varsaymadan açık soru haline getirdim.']
  ];
  const setupQuestions=[
    {id:'currency',q:'AOS1 muhasebe para birimi ne olmalı?',options:[['TRY','TRY'],['USD','USD'],['EUR','EUR']],correct:'TRY',note:'Bu capstone varsayımında statutory/accounting currency TRY; işlem para birimleri ayrıca USD/EUR olabilir.'},
    {id:'dimensions',q:'P&L raporlama ve kontrol için hangi yaklaşım en uygun?',options:[['dims','BusinessUnit + Department + CostCenter financial dimensions'],['free','Açıklama alanına bölüm kodu yazmak'],['account','Her departman için ayrı main account açmak']],correct:'dims',note:'Boyutları hesap planını gereksiz büyütmeden yönetmek hedeflenir.'},
    {id:'foreignap',q:'Foreign vendor liability hangi yöntemle ayrılmalı?',options:[['posting','Vendor group/posting profile ile ayrı summary account'],['manual','Her ay manuel reclass'],['code','Vendor id hard-code eden X++']],correct:'posting',note:'Standard posting profile çözümü önce gelir.'},
    {id:'period',q:'Late accrual kapalı aya geldiyse ne yapılmalı?',options:[['governed','Finance onayıyla period policy izlenir; gerekirse açık döneme tarih veya yetkili reopen'],['bypass','Kontrol bypass edilir'],['sysdate','Browser/system tarihi değiştirilir']],correct:'governed',note:'Fiscal period control governance mekanizmasıdır.'}
  ];
  const masterRows=[
    {id:'v1',type:'Vendor',key:'V-100',data:'Group=FOREIGN, Currency=EUR, Payment terms=30D',correct:'valid',reason:'Referans değerler mevcut ve kullanım amacıyla uyumlu.'},
    {id:'v2',type:'Vendor',key:'V-101',data:'Group=EUX, Currency=EUR',correct:'issue',reason:'EUX vendor group hedef şirkette tanımlı değil.'},
    {id:'c1',type:'Customer',key:'C-200',data:'Currency=USD, Payment terms=30D',correct:'valid',reason:'Bu senaryo için temel referans değerleri geçerli.'},
    {id:'p1',type:'Product',key:'D0001',data:'Site=1, Warehouse=11, Item group=FG',correct:'valid',reason:'Satılabilir finished-good ürünü için senaryo setup’ıyla uyumlu.'},
    {id:'p2',type:'Product',key:'M0099',data:'Site=1, Warehouse=99 (yok), Item group=RM',correct:'issue',reason:'Warehouse 99 hedef şirkette yok; import/go-live öncesi referans veri düzeltilmeli.'},
    {id:'v3',type:'Vendor',key:'V-100',data:'Duplicate account number',correct:'issue',reason:'AccountNum duplicate; unique key/data migration kuralı ihlali.'}
  ];
  const p2pQs=[
    {id:'p21',q:'PO confirmation neyi temsil eder?',o:[['commit','Sipariş koşullarının vendor’a karşı taahhüt/confirmed duruma gelmesi'],['stock','Stok miktarının fiziksel artması'],['ap','AP liability oluşması']],c:'commit'},
    {id:'p22',q:'Product receipt post edildiğinde ana etki nedir?',o:[['physical','Mal kabulü ve physical inventory update'],['invoice','Vendor invoice/AP settlement'],['payment','Bank payment']],c:'physical'},
    {id:'p23',q:'Vendor invoice post edildiğinde ana etki nedir?',o:[['financial','Financial inventory/cost ve AP liability güncellemesi'],['onlyphysical','Yalnız physical stok'],['sales','Customer receivable']],c:'financial'},
    {id:'p24',q:'Invoice ile receipt miktarı uyuşmazsa ilk yaklaşım?',o:[['match','Matching/tolerance ve gerçek business quantity/price evidence kontrolü'],['force','Tolerance’ı sınırsız artır'],['manual','Doğrudan GL journal ile kapat']],c:'match'},
    {id:'p25',q:'Payment sonrası invoice açık kalıyorsa?',o:[['settlement','Settlement, amount, cash discount/credit note ve residual evidence kontrol edilir'],['delete','Invoice silinir'],['sysadmin','Kullanıcıya SysAdmin verilir']],c:'settlement'}
  ];
  const o2cQs=[
    {id:'o21',q:'Sales reservation neyi etkiler?',o:[['availability','Available physical miktarı ve stok tahsisini'],['ar','Direkt customer receivable'],['glclose','Fiscal period status']],c:'availability'},
    {id:'o22',q:'Packing slip ana olarak hangi güncellemedir?',o:[['physical','Physical issue/shipment'],['financial','Customer invoice/financial revenue'],['cash','Bank receipt']],c:'physical'},
    {id:'o23',q:'Sales invoice post edildiğinde?',o:[['financial','Revenue/COGS/AR gibi financial posting akışı oluşur (setup’a bağlı)'],['reserve','Sadece reservation oluşur'],['po','Purchase order yaratılır']],c:'financial'},
    {id:'o24',q:'Customer payment geldi fakat invoice kapanmadı. İlk inceleme?',o:[['settle','Payment journal posting + settlement/marking + remaining amount'],['hardcode','X++ ile balance=0'],['delete','Transaction history sil']],c:'settle'},
    {id:'o25',q:'Inactive customer için özel form buton kontrolü yeterli mi?',o:[['boundary','Hayır; tüm entry path’leri kapsayan business validation/standard credit-hold yaklaşımı düşünülmeli'],['yes','Evet, form button her yolu kapsar'],['admin','Sadece SysAdmin kontrol etsin']],c:'boundary'}
  ];
  const closeTasks=[
    ['post','Unposted/subledger interface işlemlerini ve exception’ları temizle.'],
    ['ap','AP/AR açık işlemleri, settlement ve aging kontrol et.'],
    ['bank','Bank reconciliation farklarını açıkla ve gerçek banka hareketlerini kaydet.'],
    ['fa','Fixed asset acquisition/depreciation proposal ve posting’leri tamamla.'],
    ['fx','Açık foreign-currency AP/AR için revaluation çalıştır ve sonucu incele.'],
    ['inventory','Inventory physical/financial update ve valuation exception’larını gözden geçir.'],
    ['gl','Trial balance/reconciliation sonrası dönem durumunu yetkili süreçle kapat.']
  ];
  const uatCases=[
    ['UAT-01','Foreign vendor PO → receipt → invoice → AP posting','P2P / Finance'],
    ['UAT-02','Sales order → packing slip → invoice → AR','O2C / Finance'],
    ['UAT-03','EUR open AP/AR revaluation','Month-end'],
    ['UAT-04','High-value vendor invoice approval/control','Workflow / X++ gap'],
    ['UAT-05','Vendor import with invalid group rejected cleanly','Data management'],
    ['UAT-06','Treasury clerk least-privilege posting access','Security / SoD']
  ];
  const cutoverTasks=[
    ['freeze','Master-data freeze zamanı ve owner belirlendi.'],
    ['opening','Opening balances / open AP-AR / inventory cutover reconciliation hazır.'],
    ['security','Production role assignments ve SoD review tamam.'],
    ['batch','Batch jobs, recurrence, service account/owner ve monitoring planı doğrulandı.'],
    ['integration','Integration endpoints, credentials ownership ve retry/support planı doğrulandı.'],
    ['backup','Legacy extract ve migration evidence saklama planı hazır.'],
    ['rollback','Go/no-go kriterleri ve rollback/contingency kararı tanımlı.'],
    ['hypercare','Hypercare ticket kanalı, severity ve escalation owner’ları belli.']
  ];
  function doneCount(){return milestones.filter(x=>s.done[x[0]]).length}
  function progress(){return Math.round(doneCount()/milestones.length*100)}
  function fitgapScore(){return requirements.filter(r=>s.fitgap[r.id]===r.best).length}
  function setupScore(){return setupQuestions.filter(q=>s.setup[q.id]===q.correct).length}
  function masterScore(){return masterRows.filter(r=>s.master[r.id]===r.correct).length}
  function quizScore(arr,key){return arr.filter(q=>s[key][q.id]===q.c).length}
  function allTrue(obj,ids){return ids.every(id=>!!obj[id])}
  function canComplete(id){
    if(id==='discovery')return allTrue(s.discovery,discoveryTasks.map(x=>x[0]));
    if(id==='fitgap')return requirements.every(r=>s.fitgap[r.id])&&fitgapScore()===requirements.length;
    if(id==='setup')return setupScore()===setupQuestions.length;
    if(id==='master')return masterScore()===masterRows.length;
    if(id==='p2p')return quizScore(p2pQs,'p2p')===p2pQs.length;
    if(id==='o2c')return quizScore(o2cQs,'o2c')===o2cQs.length;
    if(id==='close')return allTrue(s.close,closeTasks.map(x=>x[0]));
    if(id==='incident')return s.incident.cause==='receipt-only'&&s.incident.fix==='post-invoice';
    if(id==='xpp')return !!s.xppPass;
    if(id==='uat')return uatCases.every(x=>s.uat[x[0]]==='Pass')&&allTrue(s.cutover,cutoverTasks.map(x=>x[0]));
    if(id==='handover')return milestones.slice(0,-1).every(x=>s.done[x[0]])&&String(s.reflection||'').trim().length>=80;
    return false;
  }
  function bindComplete(id){const b=document.querySelector('#p6complete');if(!b)return;b.disabled=!canComplete(id);b.onclick=()=>{if(!canComplete(id)){toast('Mentor gate henüz geçilmedi.');return}s.done[id]=true;save();toast('Milestone tamamlandı');renderHome()}}
  function gate(id,msg){return `<div class="p6-gate ${canComplete(id)?'ok':''}"><b>Mentor gate</b><div class="p6-small">${msg}</div><div class="p6-actions"><button id="p6complete" class="p6-btn good" ${canComplete(id)?'':'disabled'}>${s.done[id]?'✓ Tamamlandı':'Milestone’u tamamla'}</button><button id="p6back" class="p6-btn">Capstone ana sayfa</button></div></div>`}
  function bindBack(){const b=document.querySelector('#p6back');if(b)b.onclick=renderHome}
  function renderHome(){
    const pct=progress();
    const html=`<div class="p6-hero"><div class="p6-panel"><div class="p6-meta"><span class="p6-chip">Faz 6 · Final Capstone</span><span class="p6-chip">Legal entity: ${project.legalEntity}</span><span class="p6-chip">Go-live: ${project.goLive}</span></div><h1>End-to-End D365FO Techno-Functional Capstone</h1><p>${project.story}</p><div class="p6-callout"><b>Çalışma kuralı</b><br>Bu faz, önceki fazların yerine geçmez. Eğitime başladığında Faz 1 → 5’i tamamladıktan sonra buraya gel. Burada doğru menü ezberinden çok; requirement → standard/config/custom → transaction → accounting impact → troubleshooting → test → cutover zinciri ölçülür.</div></div><div class="p6-panel"><h3>Project charter</h3><p><b>Şirket:</b> ${project.company}</p><p><b>Ülke:</b> ${project.country}</p><p><b>Accounting:</b> ${project.accountingCurrency}</p><p><b>Reporting:</b> ${project.reportingCurrency}</p><p><b>Scope:</b> ${project.scope}</p></div></div>
      <div class="p6-kpis"><div class="p6-kpi">Tamamlanan milestone<b>${doneCount()}/${milestones.length}</b></div><div class="p6-kpi">Fit-gap doğruluğu<b>${fitgapScore()}/${requirements.length}</b></div><div class="p6-kpi">UAT Pass<b>${uatCases.filter(x=>s.uat[x[0]]==='Pass').length}/${uatCases.length}</b></div><div class="p6-kpi">Capstone ilerleme<b>${pct}%</b></div></div><div class="p6-progress"><i style="width:${pct}%"></i></div>
      <h2 class="section-title">Project workstreams</h2><div class="p6-milestones">${milestones.map((m,i)=>`<button class="p6-ms ${s.done[m[0]]?'done':''}" data-ms="${m[0]}"><span class="num">${s.done[m[0]]?'✓':i+1}</span><span><b>${m[1]}</b><br><span class="p6-small">${m[2]}</span></span></button>`).join('')}</div>
      <div class="p6-grid2"><div class="p6-panel"><h3>Çapraz modül hedefi</h3><div class="p6-timeline"><div class="p6-stage"><b>Requirement</b>Business need</div><span class="p6-arrow">→</span><div class="p6-stage"><b>Fit-gap</b>Standard first</div><span class="p6-arrow">→</span><div class="p6-stage"><b>Process</b>P2P / O2C</div><span class="p6-arrow">→</span><div class="p6-stage"><b>Finance</b>Posting / close</div><span class="p6-arrow">→</span><div class="p6-stage"><b>Dev</b>Only real gap</div><span class="p6-arrow">→</span><div class="p6-stage"><b>Release</b>UAT / cutover</div></div></div><div class="p6-panel"><h3>Final değerlendirme</h3><p>Milestone’ların tamamı bitmeden handover gate açılmaz. Yanlış seçimlerde cevap doğrudan kilitlenmez; evidence ve mentor açıklamasıyla tekrar deneyebilirsin.</p><button class="p6-btn" id="p6export">Progress JSON dışa aktar</button></div></div>`;
    set(html,'Capstone > Project cockpit');
    document.querySelectorAll('[data-ms]').forEach(b=>b.onclick=()=>renderMilestone(b.dataset.ms));
    const ex=document.querySelector('#p6export');if(ex)ex.onclick=()=>{const blob=new Blob([JSON.stringify(s,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='d365fo-capstone-progress.json';a.click();URL.revokeObjectURL(a.href)};
  }
  function renderMilestone(id){
    if(id==='discovery')return renderDiscovery();if(id==='fitgap')return renderFitgap();if(id==='setup')return renderSetup();if(id==='master')return renderMaster();if(id==='p2p')return renderQuiz('p2p','P2P end-to-end',p2pQs,'Procurement and sourcing > Purchase orders');if(id==='o2c')return renderQuiz('o2c','O2C end-to-end',o2cQs,'Sales and marketing > Sales orders');if(id==='close')return renderClose();if(id==='incident')return renderIncident();if(id==='xpp')return renderXpp();if(id==='uat')return renderUat();if(id==='handover')return renderHandover();
  }
  function renderDiscovery(){
    set(`<h1>1 · Discovery & scope</h1><div class="p6-grid2"><div class="p6-panel"><h3>Stakeholder brief</h3><p>Finance; hızlı close, doğru AP/AR ve audit trail istiyor. Procurement; PO approval ve budget kontrolü istiyor. Warehouse; physical stock ile financial inventory farklarının anlaşılmasını istiyor. IT; mümkün olan her yerde standard ve upgrade-safe çözüm istiyor.</p><div class="p6-warn"><b>Danışman tuzağı:</b> Kullanıcının söylediği çözümü doğrudan requirement kabul etme. “Bize bir buton yapın” cümlesinin altındaki gerçek business need’i bul.</div></div><div class="p6-panel"><h3>Discovery notes</h3><textarea id="p6notes" class="p6-textarea" placeholder="Açık sorular, hacim, owner, kontrol, entegrasyon, kabul kriterleri...">${esc(s.notes.discovery||'')}</textarea></div></div><div class="p6-panel"><h3>Discovery checklist</h3>${discoveryTasks.map(x=>`<label class="p6-task"><input type="checkbox" data-d="${x[0]}" ${s.discovery[x[0]]?'checked':''}><span>${x[1]}</span></label>`).join('')}</div>${gate('discovery','Tüm discovery maddelerini bilinçli olarak işaretle. Not alanını kendi soruların için kullan; checkbox tek başına gerçek projede yeterli değildir.')}`,'Capstone > Discovery & scope');
    document.querySelectorAll('[data-d]').forEach(x=>x.onchange=()=>{s.discovery[x.dataset.d]=x.checked;save();renderDiscovery()});const n=document.querySelector('#p6notes');if(n)n.oninput=()=>{s.notes.discovery=n.value;save()};bindComplete('discovery');bindBack();
  }
  function renderFitgap(){
    const opts=[['','Seç...'],['standard','Standard feature'],['config','Configuration / workflow'],['process','Process change'],['custom','Custom extension']];
    set(`<h1>2 · Fit-gap & solution strategy</h1><div class="p6-callout">Her requirement için “custom” demeden önce standard davranışı, konfigürasyonu, workflow/security ve process seçeneğini araştır. Bu capstone’daki cevaplar eğitim senaryosunun varsayımlarına göredir.</div><div class="p6-panel"><table class="p6-table"><thead><tr><th>Requirement</th><th>Kararın</th><th>Mentor feedback</th></tr></thead><tbody>${requirements.map(r=>`<tr><td>${r.text}</td><td><select class="p6-select" data-r="${r.id}">${opts.map(o=>`<option value="${o[0]}" ${s.fitgap[r.id]===o[0]?'selected':''}>${o[1]}</option>`).join('')}</select></td><td>${s.fitgap[r.id]?`<span class="${s.fitgap[r.id]===r.best?'p6-success':'p6-warn'}">${s.fitgap[r.id]===r.best?'✓ Uygun yaklaşım':'Tekrar değerlendir'}<br><span class="p6-small">${r.why}</span></span>`:'—'}</td></tr>`).join('')}</tbody></table></div><div class="p6-kpis"><div class="p6-kpi">Doğru karar<b>${fitgapScore()}/${requirements.length}</b></div></div>${gate('fitgap','Tüm requirement’larda bu senaryo için uygun solution category’yi bul. Ama gerçek projede karar öncesi mevcut sürüm ve konfigürasyon doğrulanır.')}`,'Capstone > Fit-gap');
    document.querySelectorAll('[data-r]').forEach(x=>x.onchange=()=>{s.fitgap[x.dataset.r]=x.value;save();renderFitgap()});bindComplete('fitgap');bindBack();
  }
  function renderSetup(){
    set(`<h1>3 · Finance foundation</h1><div class="p6-grid2"><div class="p6-panel"><h3>Design assumptions</h3><p><b>Legal entity:</b> AOS1</p><p><b>Accounting currency:</b> TRY</p><p><b>Reporting currency:</b> EUR</p><p><b>Calendar:</b> Jan–Dec</p><p><b>Core dimensions:</b> BusinessUnit, Department, CostCenter</p></div><div class="p6-panel"><h3>Ne kurarsın?</h3><p>Ledger/COA, fiscal calendar, account structures, dimensions, AP/AR posting profiles, bank, sales tax, currencies/rates ve module parameters birbirinden bağımsız ezber maddeleri değil; transaction posting’in önkoşullarıdır.</p></div></div>${setupQuestions.map(q=>`<div class="p6-panel"><h3>${q.q}</h3>${q.options.map(o=>`<button class="p6-choice ${s.setup[q.id]===o[0]?'selected':''}" data-q="${q.id}" data-v="${o[0]}">${o[1]}</button>`).join('')}${s.setup[q.id]?`<div class="${s.setup[q.id]===q.correct?'p6-success':'p6-warn'}">${q.note}</div>`:''}</div>`).join('')}<div class="p6-kpis"><div class="p6-kpi">Design check<b>${setupScore()}/${setupQuestions.length}</b></div></div>${gate('setup','Dört design kararının da business gerekçesini anlayarak doğru seç.')}`,'Capstone > Finance foundation');
    document.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{s.setup[b.dataset.q]=b.dataset.v;save();renderSetup()});bindComplete('setup');bindBack();
  }
  function renderMaster(){
    set(`<h1>4 · Master data readiness</h1><div class="p6-callout">Migration’da “500 kaydın 498’i geçti” demek yeterli değildir. Başarısız ve duplicate kayıtların nedeni, referans data bağımlılığı ve reprocess planı görünür olmalı.</div><div class="p6-panel"><table class="p6-table"><thead><tr><th>Type</th><th>Key</th><th>Data</th><th>Assessment</th><th>Review</th></tr></thead><tbody>${masterRows.map(r=>`<tr><td>${r.type}</td><td>${r.key}</td><td>${r.data}</td><td><select class="p6-select" data-m="${r.id}"><option value="">Seç...</option><option value="valid" ${s.master[r.id]==='valid'?'selected':''}>Valid</option><option value="issue" ${s.master[r.id]==='issue'?'selected':''}>Issue</option></select></td><td>${s.master[r.id]?`<span class="${s.master[r.id]===r.correct?'p6-success':'p6-warn'}">${r.reason}</span>`:'—'}</td></tr>`).join('')}</tbody></table></div><div class="p6-kpis"><div class="p6-kpi">Data-quality check<b>${masterScore()}/${masterRows.length}</b></div></div>${gate('master','Tüm satırlarda valid/issue ayrımını doğru yap ve nedenini incele.')}`,'Capstone > Master data');
    document.querySelectorAll('[data-m]').forEach(x=>x.onchange=()=>{s.master[x.dataset.m]=x.value;save();renderMaster()});bindComplete('master');bindBack();
  }
  function renderQuiz(key,title,qs,path){
    set(`<h1>${key==='p2p'?'5':'6'} · ${title}</h1><div class="p6-timeline">${(key==='p2p'?['PO','Confirm','Product receipt','Vendor invoice','Payment','Settlement']:['Sales order','Reserve','Packing slip','Invoice','Payment','Settlement']).map((x,i,a)=>`<div class="p6-stage"><b>${x}</b>${i===0?'Start':i===a.length-1?'Close':'Process'}</div>${i<a.length-1?'<span class="p6-arrow">→</span>':''}`).join('')}</div><div class="p6-sep"></div>${qs.map(q=>`<div class="p6-panel"><h3>${q.q}</h3>${q.o.map(o=>`<button class="p6-choice ${s[key][q.id]===o[0]?'selected':''}" data-k="${key}" data-q="${q.id}" data-v="${o[0]}">${o[1]}</button>`).join('')}${s[key][q.id]?`<div class="${s[key][q.id]===q.c?'p6-success':'p6-warn'}">${s[key][q.id]===q.c?'✓ Süreç etkisi doğru yorumlandı.':'Physical / financial / subledger etkisini tekrar düşün.'}</div>`:''}</div>`).join('')}<div class="p6-kpis"><div class="p6-kpi">Process score<b>${quizScore(qs,key)}/${qs.length}</b></div></div>${gate(key,'Her adımı sadece menü olarak değil, stok ve muhasebe etkisiyle ilişkilendir.')}`,`Capstone > ${path}`);
    document.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{s[b.dataset.k][b.dataset.q]=b.dataset.v;save();renderQuiz(key,title,qs,path)});bindComplete(key);bindBack();
  }
  function renderClose(){
    set(`<h1>7 · Month-end close</h1><div class="p6-grid2"><div class="p6-panel"><h3>Controller request</h3><p>“Ayı kapatmadan önce AP/AR, banka, stok, fixed assets ve FX kaynaklı farkların GL’ye açıklanabilir şekilde geldiğinden emin olmak istiyorum.”</p></div><div class="p6-panel"><h3>Danışman yaklaşımı</h3><p>Close sadece GL period’u Closed yapmak değildir. Önce subledger completeness ve reconciliation, sonra valuation/periodic jobs, sonra control/review gelir.</p></div></div><div class="p6-panel"><h3>Close checklist</h3>${closeTasks.map(x=>`<label class="p6-task"><input type="checkbox" data-c="${x[0]}" ${s.close[x[0]]?'checked':''}><span>${x[1]}</span></label>`).join('')}</div>${gate('close','Yedi kapanış kontrolünü tamamla. Gerçek projede checklist owner, due date ve evidence ile yönetilir.')}`,'Capstone > Month-end close');
    document.querySelectorAll('[data-c]').forEach(x=>x.onchange=()=>{s.close[x.dataset.c]=x.checked;save();renderClose()});bindComplete('close');bindBack();
  }
  function renderIncident(){
    const causes=[['receipt-only','PO product receipt posted; physical inventory updated, fakat vendor invoice financial update henüz post edilmedi.'],['posting-profile','Vendor posting profile tek başına physical/financial inventory farkını oluşturdu.'],['security','Warehouse kullanıcısında SysAdmin olmadığı için AP oluşmadı.'],['fx','EUR revaluation product receipt’i vendor invoice’a dönüştürmedi.']];
    const fixes=[['post-invoice','Receipt/invoice matching evidence’ını doğrula; gerçek vendor invoice’ı post et ve inventory/AP financial update’i yeniden reconcile et.'],['manual-gl','AP ve inventory hesaplarına manuel GL journal atıp belge akışını bırak.'],['fake-receipt','Yeni bir receipt daha post ederek finansal miktarı artırmaya çalış.'],['disable-match','Matching/tolerance kontrollerini kapat ve invoice’ı körlemesine geçir.']];
    set(`<h1>8 · Production incident</h1><div class="p6-danger"><b>INC-6001 · Severity High</b><br>Warehouse, PO-9012 için 100 adet mal kabul etti. On-hand physical quantity arttı. Controller ise inventory financial quantity/value ile AP liability’nin beklenen seviyede olmadığını söylüyor. Product receipt mevcut; vendor invoice henüz post edilmemiş.</div><div class="p6-grid2"><div class="p6-panel"><h3>Evidence</h3><ul><li>PO status: Received / invoiced değil</li><li>Product receipt: PR-9012 mevcut</li><li>Physical on-hand: +100</li><li>Financial inventory: invoice öncesi beklenen final update yok</li><li>AP vendor transaction: invoice yok</li><li>Vendor invoice document sistemde Draft</li></ul></div><div class="p6-panel"><h3>İlk prensip</h3><p>Semptomu GL journal ile örtme. Source document lifecycle → inventory transaction status → subledger → voucher zincirini izle.</p></div></div><div class="p6-panel"><h3>Kök neden</h3>${causes.map(x=>`<button class="p6-choice ${s.incident.cause===x[0]?'selected':''}" data-ic="${x[0]}">${x[1]}</button>`).join('')}</div><div class="p6-panel"><h3>Çözüm</h3>${fixes.map(x=>`<button class="p6-choice ${s.incident.fix===x[0]?'selected':''}" data-if="${x[0]}">${x[1]}</button>`).join('')}</div>${s.incident.cause&&s.incident.fix?`<div class="${canComplete('incident')?'p6-success':'p6-warn'}">${canComplete('incident')?'✓ Root cause ile business document çözümü birbiriyle tutarlı.':'Evidence zinciriyle seçimini tekrar karşılaştır.'}</div>`:''}${gate('incident','Doğru root cause + source-document temelli düzeltme kombinasyonunu seç.')}`,'Capstone > Production incident');
    document.querySelectorAll('[data-ic]').forEach(b=>b.onclick=()=>{s.incident.cause=b.dataset.ic;save();renderIncident()});document.querySelectorAll('[data-if]').forEach(b=>b.onclick=()=>{s.incident.fix=b.dataset.if;save();renderIncident()});bindComplete('incident');bindBack();
  }
  function renderXpp(){
    const starter=s.xpp||`// Business request\n// AOS1: configured threshold üzerindeki vendor invoice post edilirken\n// Project dimension boşsa posting durmalı. Diğer legal entity'ler etkilenmemeli.\n\n// Tasarım / pseudo X++:\n`;
    set(`<h1>9 · X++ change request</h1><div class="p6-grid2"><div class="p6-panel"><h3>Requirement</h3><p>AOS1 şirketinde konfigüre edilebilir yüksek-tutar eşiğinin üzerindeki vendor invoice post edilirken Project dimension zorunlu olsun. Batch/import/intercompany gibi UI dışı yollar da korunmalı.</p><div class="p6-warn">Bu browser analyzer gerçek X++ compiler değildir. Burada amaç extension point, configuration, transaction boundary ve test düşüncesini ölçmektir.</div></div><div class="p6-panel"><h3>Acceptance criteria</h3><ul><li>Threshold magic number değil, parameter/config üzerinden gelir.</li><li>Legal entity scope kontrollüdür; şirket adı kod içine kör hard-code edilmez.</li><li>Form-only validation değildir.</li><li>Extension/CoC veya uygun business validation boundary düşünülür.</li><li>Kullanıcıya label tabanlı açıklayıcı hata verilir.</li><li>Boundary + batch/import regression test planı vardır.</li></ul></div></div><textarea id="p6code" class="p6-code">${esc(starter)}</textarea><div class="p6-actions"><button id="p6analyze" class="p6-btn primary">Design review çalıştır</button></div><div id="p6review"></div>${gate('xpp','Analyzer’ın altı design kontrolünü de geçir. Gerçek uygulamada uygun standard extension point mevcut sürüm metadata’sında doğrulanmalıdır.')}`,'Capstone > X++ change request');
    document.querySelector('#p6code').oninput=e=>{s.xpp=e.target.value;save()};document.querySelector('#p6analyze').onclick=()=>{const code=document.querySelector('#p6code').value;const checks=[[/parameter|config|parm|threshold/i,'Threshold configuration/parameter olarak düşünülmüş mü?'],[/company|legal entity|dataArea|company policy|scope/i,'Legal entity scope düşünülmüş mü?'],[/ExtensionOf|CoC|chain of command|business layer|validate|posting/i,'UI dışını kapsayan business extension/validation boundary var mı?'],[/label|error|message/i,'Kullanıcı mesajı/label yaklaşımı var mı?'],[/test|boundary|batch|import|regression/i,'Test ve UI dışı yollar düşünülmüş mü?'],[/(100000|doUpdate\(|userId\s*==)/i,'Anti-pattern kontrolü']],rows=[];let pass=0;checks.forEach((c,i)=>{let ok;if(i===5)ok=!c[0].test(code);else ok=c[0].test(code);if(ok)pass++;rows.push(`<div class="p6-check ${ok?'ok':'bad'}">${ok?'✓':'✗'} ${i===5?'Magic number / doUpdate / user hard-code anti-patterni yok mu?':c[1]}</div>`)});s.xpp=code;s.xppPass=pass===checks.length;save();document.querySelector('#p6review').innerHTML=`<div class="p6-panel"><b>Design review: ${pass}/${checks.length}</b>${rows.join('')}</div>`;const comp=document.querySelector('#p6complete');if(comp)comp.disabled=!canComplete('xpp')};bindComplete('xpp');bindBack();
  }
  function renderUat(){
    set(`<h1>10 · UAT, cutover & go-live</h1><div class="p6-panel"><h3>Critical UAT pack</h3><table class="p6-table"><thead><tr><th>Case</th><th>Scenario</th><th>Workstream</th><th>Result</th></tr></thead><tbody>${uatCases.map(x=>`<tr><td>${x[0]}</td><td>${x[1]}</td><td>${x[2]}</td><td><select class="p6-select" data-u="${x[0]}"><option value="">Not run</option><option value="Pass" ${s.uat[x[0]]==='Pass'?'selected':''}>Pass</option><option value="Fail" ${s.uat[x[0]]==='Fail'?'selected':''}>Fail</option></select></td></tr>`).join('')}</tbody></table></div><div class="p6-panel"><h3>Cutover readiness</h3>${cutoverTasks.map(x=>`<label class="p6-task"><input type="checkbox" data-co="${x[0]}" ${s.cutover[x[0]]?'checked':''}><span>${x[1]}</span></label>`).join('')}</div><div class="${uatCases.some(x=>s.uat[x[0]]==='Fail')?'p6-danger':'p6-callout'}"><b>Go/no-go kuralı:</b> Kritik UAT fail varken veya cutover owner/rollback planı eksikken yalnız takvim baskısı nedeniyle go-live onayı verme.</div>${gate('uat','Altı kritik UAT case Pass ve sekiz cutover maddesi tamam olmalı.')}`,'Capstone > UAT & cutover');
    document.querySelectorAll('[data-u]').forEach(x=>x.onchange=()=>{s.uat[x.dataset.u]=x.value;save();renderUat()});document.querySelectorAll('[data-co]').forEach(x=>x.onchange=()=>{s.cutover[x.dataset.co]=x.checked;save();renderUat()});bindComplete('uat');bindBack();
  }
  function renderHandover(){
    const prereq=milestones.slice(0,-1).filter(x=>s.done[x[0]]).length;const score=Math.round(prereq/(milestones.length-1)*85)+(s.reflection.trim().length>=80?15:0);
    set(`<h1>11 · Handover & final assessment</h1><div class="p6-final"><div class="p6-grid2"><div><h2>Project closeout</h2><p>Burada bir “sertifika” üretmiyoruz. Ama tamamladığın evidence seti; requirement reasoning, transaction knowledge, troubleshooting, X++ design ve release discipline’i birlikte gözden geçirmen için final kontrol görevi görür.</p></div><div><div class="p6-score">${score}/100</div><div>${prereq}/${milestones.length-1} prerequisite milestone tamamlandı</div></div></div></div><div class="p6-grid2"><div class="p6-panel"><h3>Handover paketi</h3><ul><li>Scope & requirement log</li><li>Fit-gap decision log</li><li>Configuration/design rationale</li><li>Master-data exceptions</li><li>P2P/O2C/UAT evidence</li><li>Known issues & workarounds</li><li>X++ design + test notes</li><li>Cutover / rollback / hypercare ownership</li></ul></div><div class="p6-panel"><h3>Interview reflection</h3><p class="p6-small">En az 80 karakter: Bu projede standard mı custom mı kararını nasıl verdin? Production incident geldiğinde hangi evidence sırasını izlersin? Finance + SCM + X++ bağlantısını nasıl açıklarsın?</p><textarea id="p6reflection" class="p6-textarea">${esc(s.reflection)}</textarea></div></div>${milestones.slice(0,-1).every(x=>s.done[x[0]])?'<div class="p6-success"><b>Prerequisites complete.</b> Reflection’ı tamamladıktan sonra final gate açılır.</div>':'<div class="p6-warn"><b>Capstone henüz kapanamaz.</b> Önce eksik workstream milestone’larını tamamla.</div>'}${gate('handover','Önceki 10 milestone tamam + en az 80 karakterlik kendi reasoning özetin gerekli.')}`,'Capstone > Handover');
    const r=document.querySelector('#p6reflection');r.oninput=()=>{s.reflection=r.value;save();const b=document.querySelector('#p6complete');if(b)b.disabled=!canComplete('handover')};bindComplete('handover');bindBack();
  }
  function install(){
    const oldRender=window.render;
    if(typeof oldRender==='function')window.render=function(name){if(name==='capstone'||name==='phase6')return renderHome();if(String(name).startsWith('capstone:'))return renderMilestone(String(name).split(':')[1]);return oldRender(name)};
    const oldModules=window.renderModules;
    if(typeof oldModules==='function')window.renderModules=function(){oldModules();setTimeout(()=>{const nc=document.querySelector('#navContent');if(nc&&!nc.querySelector('[data-page="capstone"]')){const g=document.createElement('div');g.className='nav-group';g.innerHTML='<h4>Capstone · Faz 6</h4><button class="nav-link" data-page="capstone">End-to-End Project</button>';nc.appendChild(g);g.querySelector('button').onclick=()=>window.render('capstone')}},0)};
    const oldHome=window.renderHome;
    if(typeof oldHome==='function')window.renderHome=function(){oldHome();setTimeout(()=>{const host=document.querySelector('.menu-columns')||document.querySelector('.cards');if(host&&!document.querySelector('[data-page="capstone"]')){const box=document.createElement('div');box.className='menu-box';box.innerHTML='<h3>Capstone · Faz 6</h3><button data-page="capstone">End-to-End Project</button><div class="muted">Finance + SCM + X++ · UAT → Cutover → Handover</div>';host.appendChild(box);box.querySelector('button').onclick=()=>window.render('capstone')}},0)};
  }
  window.phase6={renderHome,renderMilestone,version:VERSION,state:()=>s};
  install();
})();