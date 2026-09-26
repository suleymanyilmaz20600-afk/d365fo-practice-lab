(function(){
  const P3_KEY='d365fo-practice-lab-phase3-v1';
  const P3_VERSION='3.0';
  const d365Sources={
    vendorPosting:'https://learn.microsoft.com/en-us/dynamics365/finance/accounts-payable/vendor-posting-profiles',
    dimensions:'https://learn.microsoft.com/en-us/dynamics365/finance/general-ledger/default-dimensions',
    accountStructures:'https://learn.microsoft.com/en-us/dynamics365/finance/general-ledger/configure-account-structures',
    bank:'https://learn.microsoft.com/en-us/dynamics365/finance/cash-bank-management/advanced-bank-reconciliation-overview',
    fx:'https://learn.microsoft.com/en-us/dynamics365/finance/cash-bank-management/foreign-currency-revaluation-accounts-payable-accounts-receivable',
    fixedAssets:'https://learn.microsoft.com/en-us/dynamics365/finance/fixed-assets/set-up-fixed-assets',
    budget:'https://learn.microsoft.com/en-us/troubleshoot/dynamics-365/finance/budgeting/budget-control-troubleshooting',
    data:'https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/data-entities/data-entities-data-packages',
    security:'https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/sysadmin/role-based-security'
  };

  const p3Cases=[
    {
      id:'ap-posting-profile',no:'INC-3001',module:'Accounts payable',severity:'High',title:'Foreign vendor invoice wrong liability account',
      user:'Finance controller: “EUR vendor invoices are posting to domestic AP instead of foreign AP. Month-end trial balance is wrong.”',
      context:'Fabrikam Europe (vendor 2001) belongs to vendor group FOREIGN. Group setup points to 200200 Accounts payable - foreign, but a vendor-specific Table rule exists.',
      request:'Find why VINV-2001 resolves to the wrong summary account. Fix configuration without X++ customization.',
      path:'Accounts payable > Setup > Vendor posting profiles',
      evidence:['Vendor 2001 group = FOREIGN','Group rule FOREIGN → 200200','Table rule vendor 2001 → 200100','All rule → 200100','Posting profile search priority is Table → Group → All'],
      causes:[['table-override','A vendor-specific Table posting profile overrides the FOREIGN group rule.'],['group-bug','Vendor group FOREIGN is ignored by standard D365FO.'],['account-structure','Account structure is forcing account 200100.'],['code-bug','A custom X++ posting class is required.']],
      correctCause:'table-override',
      fixes:[['remove-table','Remove/correct the vendor-specific Table rule so the intended group rule can resolve.'],['change-all','Change the All rule to 200200 for every vendor.'],['hardcode-xpp','Hard-code vendor 2001 → 200200 in X++.'],['manual-journal','Post a manual reclass journal every month.']],
      correctFix:'remove-table',
      mentor:'Vendor posting profiles resolve the most specific configuration first: Table, then Group, then All. A correct standard configuration should be preferred over custom posting code.',
      source:d365Sources.vendorPosting
    },
    {
      id:'closed-period',no:'INC-3002',module:'General ledger',severity:'High',title:'Journal cannot be posted at month end',
      user:'Accountant: “The journal validates, but posting says the accounting date is in a closed period.”',
      context:'GJ-0831 uses accounting date 2026-08-31. August is Closed; September is Open. The journal is a late accrual requested after close.',
      request:'Determine whether the transaction should be posted to a reopened August period or moved to an approved open period. Do not bypass period controls.',
      path:'General ledger > Calendars > Ledger calendars',
      evidence:['Journal date = 2026-08-31','2026-08 status = Closed','2026-09 status = Open','User has no period-close administrator role','Business owner has not approved reopening August'],
      causes:[['period','The journal accounting date is in a closed ledger period.'],['security','The user needs System administrator.'],['dimensions','A financial dimension is invalid.'],['posting-profile','Vendor posting profile is missing.']],
      correctCause:'period',
      fixes:[['move-date','Move the accounting date to the approved open period after finance approval.'],['reopen-user','Give the accountant rights to reopen periods.'],['disable-control','Disable fiscal period validation.'],['change-session','Change the browser/system date.']],
      correctFix:'move-date',
      mentor:'Period controls are governance, not an inconvenience to bypass. The correct treatment depends on accounting policy and authorization; in this case the approved safe action is to post in the open period.',
      source:'https://learn.microsoft.com/en-us/dynamics365/finance/general-ledger/ledger-calendars-fiscal-periods'
    },
    {
      id:'dimension-combination',no:'INC-3003',module:'General ledger',severity:'Medium',title:'Expense journal fails account structure validation',
      user:'AP clerk: “Main account 600100 is valid, but D365 says the ledger account combination is invalid.”',
      context:'Expense accounts 6xxxxx require BusinessUnit + Department + CostCenter. The source document defaulted Department 022 but CostCenter is blank.',
      request:'Trace the dimension requirement and correct the transaction or configuration only if the requirement itself is wrong.',
      path:'General ledger > Chart of accounts > Structures > Configure account structures',
      evidence:['Main account = 600100 Office expenses','BusinessUnit = 001','Department = 022','CostCenter = blank','P&L account structure requires CostCenter for 6xxxxx'],
      causes:[['missing-dim','The financial dimension combination is incomplete for the active account structure.'],['main-account','Main account 600100 is inactive.'],['tax','Sales tax code is invalid.'],['currency','Exchange rate is missing.']],
      correctCause:'missing-dim',
      fixes:[['fill-costcenter','Enter the valid CostCenter from the business context and revalidate.'],['remove-segment','Remove CostCenter from the account structure globally.'],['xpp-default','Add X++ to silently default CC10 for every expense.'],['use-other-account','Use another main account to get around validation.']],
      correctFix:'fill-costcenter',
      mentor:'Account structures define valid financial dimension combinations. First fix the business data; only redesign the structure when the business requirement is actually different.',
      source:d365Sources.accountStructures
    },
    {
      id:'bank-recon',no:'INC-3004',module:'Cash and bank management',severity:'High',title:'Bank statement line will not auto-match',
      user:'Treasury: “The bank line and D365 payment look almost the same, but automatic reconciliation leaves it unmatched.”',
      context:'Statement amount = 12,500.00 USD; Finance transaction = 12,490.00 USD. Allowed penny difference = 5.00. Bank charged a 10.00 fee that is not yet recorded.',
      request:'Explain the mismatch and reconcile without hiding a real bank charge by inflating tolerance.',
      path:'Cash and bank management > Reconcile > Bank account reconciliation',
      evidence:['Bank statement = 12,500.00','Finance transaction = 12,490.00','Difference = 10.00','Allowed penny difference = 5.00','No bank fee transaction exists in Finance'],
      causes:[['bank-fee','A real 10.00 bank charge is missing from Finance, so the amounts exceed matching tolerance.'],['tolerance','The tolerance must always be increased until lines match.'],['currency','USD currency setup is invalid.'],['vendor','Vendor posting profile is wrong.']],
      correctCause:'bank-fee',
      fixes:[['record-fee','Record the legitimate bank fee/new bank transaction, then reconcile the true amounts.'],['raise-tolerance','Raise penny difference to 10,000 so all lines match.'],['edit-statement','Edit the imported bank statement amount to 12,490.'],['delete-payment','Delete the Finance payment and post it again with a guessed amount.']],
      correctFix:'record-fee',
      mentor:'Matching tolerances are not a substitute for recording genuine bank activity. Reconciliation should explain differences, not conceal them.',
      source:d365Sources.bank
    },
    {
      id:'fx-revaluation',no:'INC-3005',module:'Accounts payable',severity:'Medium',title:'Month-end AP balance ignores exchange-rate movement',
      user:'Controller: “Our open EUR payables still show the historical USD value at month end.”',
      context:'Open invoice = EUR 10,000. Original rate = 1.18 USD/EUR. Closing rate = 1.22. Foreign currency revaluation has not been run for the month.',
      request:'Update the book value of the open transaction using the month-end rate and explain unrealized vs realized FX.',
      path:'Accounts payable > Periodic tasks > Foreign currency revaluation',
      evidence:['Open amount = EUR 10,000','Historical accounting value = USD 11,800','Closing-rate value = USD 12,200','Expected unrealized loss = USD 400','Revaluation run history = none for 2026-09-30'],
      causes:[['not-run','Foreign currency revaluation has not been run for the open AP transaction.'],['settlement','The invoice is fully settled.'],['vat','VAT configuration is wrong.'],['bank','Bank reconciliation is incomplete.']],
      correctCause:'not-run',
      fixes:[['run-reval','Run/simulate AP foreign currency revaluation for the closing date and review the generated accounting.'],['edit-invoice','Change the posted invoice exchange rate to 1.22.'],['settle-fake','Create a fake payment to force an FX posting.'],['manual-only','Ignore subledger revaluation and post an unsupported manual number.']],
      correctFix:'run-reval',
      mentor:'Revaluation updates the book value of open foreign-currency transactions using a new rate. Settlement later creates realized FX based on the actual payment/settlement rate.',
      source:d365Sources.fx
    },
    {
      id:'fixed-asset-depr',no:'INC-3006',module:'Fixed assets',severity:'Medium',title:'Asset missing from depreciation proposal',
      user:'Fixed asset accountant: “FA-0007 is active, but the depreciation proposal does not include it.”',
      context:'Asset book CORP has a valid straight-line profile and placed-in-service date, but Calculate depreciation is disabled on the book.',
      request:'Find the setup reason the asset is skipped and correct it without manually calculating depreciation in Excel.',
      path:'Fixed assets > Fixed assets > Fixed assets > Books',
      evidence:['Asset = FA-0007','Book = CORP','Placed in service = 2026-01-15','Depreciation profile = SL60','Calculate depreciation = No'],
      causes:[['calc-disabled','Calculate depreciation is disabled on the asset book, so the proposal skips it.'],['asset-id','The asset number format is invalid.'],['vendor','The acquisition vendor is missing.'],['security','Only System administrator can depreciate assets.']],
      correctCause:'calc-disabled',
      fixes:[['enable-calc','Enable Calculate depreciation for the book after confirming policy, then regenerate the proposal.'],['manual-journal','Calculate depreciation in Excel and post a manual GL journal.'],['new-asset','Create a duplicate fixed asset.'],['change-date','Move the placed-in-service date backward until it appears.']],
      correctFix:'enable-calc',
      mentor:'A book can be configured not to participate in depreciation proposals. Setup should reflect the accounting/tax purpose of the book.',
      source:d365Sources.fixedAssets
    },
    {
      id:'budget-control',no:'INC-3007',module:'Budgeting / Procurement',severity:'High',title:'Purchase order budget check fails',
      user:'Procurement: “PO-30077 is urgent. Can you disable budget control so we can confirm it?”',
      context:'Available funds for Department 022 / CostCenter CC10 = 2,000 USD. New PO commitment = 5,000 USD. Budget control is intentionally enabled for purchase orders.',
      request:'Explain the budget failure and apply a governed resolution. Do not bypass the control.',
      path:'Budgeting > Setup > Budget control > Budget control configuration',
      evidence:['Budget-controlled document = Purchase order','Available budget = 2,000','PO amount = 5,000','Shortfall = 3,000','Budget control statistics show insufficient funds'],
      causes:[['insufficient','The dimension combination does not have enough available budget for the PO.'],['system-bug','Budget control randomly blocks POs.'],['vendor','Vendor 1001 is inactive.'],['fx','USD exchange rate is missing.']],
      correctCause:'insufficient',
      fixes:[['approved-transfer','Use an approved budget transfer/amendment (or reduce the PO) and rerun budget check.'],['disable-budget','Remove Purchase order from budget-controlled documents.'],['custom-bypass','Add X++ to skip budget checks for urgent POs.'],['split-po','Split the same spend into smaller POs solely to avoid the control.']],
      correctFix:'approved-transfer',
      mentor:'Budget control exists to enforce governance. Troubleshooting starts with budget-control errors/warnings and statistics; the resolution must follow the organization’s budget authority.',
      source:d365Sources.budget
    },
    {
      id:'data-import',no:'INC-3008',module:'Data management',severity:'Medium',title:'Vendor import partially fails in staging',
      user:'Data migration lead: “498 vendors imported, 2 failed. Do not rerun the entire file blindly.”',
      context:'Two staging rows contain data-quality problems: one duplicate vendor account and one vendor group value that does not exist in the target company.',
      request:'Use execution history/staging data to isolate errors, correct data or mapping, and reprocess only what is necessary.',
      path:'System administration > Workspaces > Data management',
      evidence:['Job DMF-IMPORT-88: 500 records','Succeeded = 498','Failed = 2','Row 217: duplicate AccountNum V-00120','Row 402: VendGroup = EUX does not exist'],
      causes:[['staging-errors','The import has two row-level staging/target validation errors that must be corrected.'],['framework','The Data management framework cannot import vendors.'],['capacity','Dataverse capacity is the cause of every failed row.'],['security','All failures mean the user needs System administrator.']],
      correctCause:'staging-errors',
      fixes:[['fix-reprocess','Review execution log/staging, correct the two rows or mapping, then reprocess the failed records/job appropriately.'],['rerun-all','Keep rerunning all 500 records until they pass.'],['delete-logs','Delete execution history so the import looks successful.'],['xpp-skip','Customize the entity to ignore duplicate and invalid-group validations.']],
      correctFix:'fix-reprocess',
      mentor:'Data management troubleshooting is evidence driven: execution history → staging data → execution log → mapping/reference data. Avoid broad reruns or validation bypasses.',
      source:d365Sources.data
    },
    {
      id:'security-post',no:'INC-3009',module:'System administration',severity:'High',title:'User can enter vendor payment but cannot post',
      user:'AP lead: “The new clerk can create payment journals but the Post action is unavailable. Please give access.”',
      context:'The user has an AP clerk role that allows maintenance, but not the posting duty/privilege required by the organization’s segregation-of-duties design.',
      request:'Grant the minimum appropriate access through roles/duties/privileges; do not assign System administrator.',
      path:'System administration > Security > Security configuration',
      evidence:['User can open Vendor payment journal','User can add/edit lines','Post action unavailable','Role = Accounts payable clerk','Posting duty not included in assigned role'],
      causes:[['missing-duty','The assigned security role lacks the duty/privilege for posting vendor payments.'],['browser','Browser cache controls posting rights.'],['period','All periods are closed.'],['vendor-profile','Vendor posting profile controls button visibility.']],
      correctCause:'missing-duty',
      fixes:[['least-privilege','Assign the approved role/duty that contains the posting privilege, preserving least privilege and SoD.'],['sysadmin','Assign System administrator to the clerk.'],['custom-button','Create a new X++ button that posts without security.'],['share-user','Let the clerk use another employee’s account.']],
      correctFix:'least-privilege',
      mentor:'Finance and operations security is role based: permissions → privileges → duties → roles. Solve access problems at the business-role level and respect segregation of duties.',
      source:d365Sources.security
    },
    {
      id:'settlement',no:'INC-3010',module:'Accounts payable',severity:'Medium',title:'Vendor invoice remains open after payment settlement',
      user:'AP clerk: “I paid the vendor, but the invoice still shows 20 EUR open. Can we force-close it?”',
      context:'Invoice open amount = EUR 1,020. Payment = EUR 1,000. There is no configured cash discount and no approved credit note yet.',
      request:'Explain why the transaction remains open and choose a legitimate business resolution instead of forcing settlement.',
      path:'Accounts payable > Vendors > All vendors > Transactions > Settle transactions',
      evidence:['Invoice = EUR 1,020','Payment = EUR 1,000','Remaining = EUR 20','Cash discount = none','Credit note = none'],
      causes:[['short-payment','The payment is 20 EUR short, so full settlement is mathematically impossible without another legitimate transaction.'],['bug','D365 settlement randomly leaves 20 EUR.'],['posting-profile','Changing the AP summary account will close the invoice.'],['fx','Every settlement difference is an FX difference.']],
      correctCause:'short-payment',
      fixes:[['business-resolution','Leave 20 EUR open until an approved additional payment/credit note/authorized adjustment exists, then settle.'],['force-close','Force-close the transaction with no supporting business event.'],['change-invoice','Edit the posted invoice amount to 1,000.'],['delete-payment','Delete the payment and recreate it without investigation.']],
      correctFix:'business-resolution',
      mentor:'Settlement follows real open amounts and approved adjustments. Do not convert a commercial difference into an accounting “fix” without supporting evidence.',
      source:d365Sources.vendorPosting
    }
  ];

  function p3Defaults(){
    const cases={};
    p3Cases.forEach(c=>cases[c.id]={status:'New',cause:null,fix:null,diagnosticsRun:false,mentorShown:false,notes:'',score:0,lastTouched:null});
    return {version:P3_VERSION,cases};
  }
  function p3Load(){try{const raw=JSON.parse(localStorage.getItem(P3_KEY)||'null');const base=p3Defaults();if(!raw)return base;return {version:P3_VERSION,cases:{...base.cases,...(raw.cases||{})}}}catch(e){return p3Defaults()}}
  let p3=p3Load();
  function p3Save(){localStorage.setItem(P3_KEY,JSON.stringify(p3))}
  function p3Esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
  function p3Case(id){return p3Cases.find(x=>x.id===id)||p3Cases[0]}
  function p3State(id){return p3.cases[id]||(p3.cases[id]={status:'New',cause:null,fix:null,diagnosticsRun:false,mentorShown:false,notes:'',score:0,lastTouched:null})}
  function p3Totals(){
    const solved=p3Cases.filter(c=>p3State(c.id).status==='Solved').length;
    const active=p3Cases.filter(c=>p3State(c.id).status==='In progress').length;
    const score=p3Cases.reduce((a,c)=>a+(p3State(c.id).score||0),0);
    return {solved,active,newCount:p3Cases.length-solved-active,score,max:p3Cases.length*100};
  }
  function p3Badge(status){return status==='Solved'?'ok':status==='In progress'?'warn':''}
  function p3Severity(sev){return sev==='High'?'bad':sev==='Medium'?'warn':'ok'}
  function p3Touch(s){s.lastTouched=new Date().toISOString();if(s.status==='New')s.status='In progress';p3Save()}
  function p3ResetCase(id){p3.cases[id]=p3Defaults().cases[id];p3Save();renderPhase3Case(id);toast('Vaka sıfırlandı')}
  function p3ResetAll(){if(!confirm('Faz 3 ilerlemesi sıfırlansın mı?'))return;p3=p3Defaults();p3Save();renderPhase3Center();toast('Faz 3 sıfırlandı')}

  function renderPhase3Center(){
    const t=p3Totals();
    setPage(`<div class="page-title-row"><h1 class="page-title">Production Troubleshooting Lab</h1><span class="badge warn">Phase 3</span></div>
      <p class="subtitle">Gerçek danışman refleksi: <b>belirti → kanıt → kök neden → standard çözüm → doğrulama → kullanıcı iletişimi</b>. Çözümü ezberlemek yerine sistemi teşhis et.</p>
      <div class="cards mini-cards">
        <div class="card"><h3>Solved</h3><div class="kpi small-kpi">${t.solved}/${p3Cases.length}</div><span class="muted">tamamlanan vaka</span></div>
        <div class="card"><h3>In progress</h3><div class="kpi small-kpi">${t.active}</div><span class="muted">aktif vaka</span></div>
        <div class="card"><h3>Score</h3><div class="kpi small-kpi">${t.score}/${t.max}</div><span class="muted">diagnosis + fix</span></div>
        <div class="card"><h3>Coverage</h3><div class="kpi small-kpi">10</div><span class="muted">Finance/Platform tickets</span></div>
      </div>
      <div class="commandbar"><button class="cmd primary" id="p3StartBtn">İlk açık vakayı başlat</button><button class="cmd" data-page="phase3Guide">Faz 3 çalışma rehberi</button><button class="cmd" id="p3ResetAll">Faz 3 ilerlemesini sıfırla</button></div>
      ${p3Grid()}
      <div class="info"><b>Çalışma kuralı:</b> Önce “Evidence” bölümünü oku. Kök nedeni seçmeden mentor çözümünü açma. Production ortamında önce kanıt toplanır; sonra config/code değişir.</div>
    `,'Training > Production Troubleshooting Lab');
    bindP3Rows();
    $('#p3ResetAll').onclick=p3ResetAll;
    $('#p3StartBtn').onclick=()=>{const next=p3Cases.find(c=>p3State(c.id).status!=='Solved')||p3Cases[0];renderPhase3Case(next.id)};
    document.querySelectorAll('[data-page="phase3Guide"]').forEach(b=>b.onclick=()=>render('phase3Guide'));
  }

  function p3Grid(){
    return `<div class="grid-wrap"><table class="grid"><thead><tr><th>Ticket</th><th>Module</th><th>Severity</th><th>Production symptom</th><th>Status</th><th>Score</th></tr></thead><tbody>${p3Cases.map(c=>{const s=p3State(c.id);return `<tr class="p3-row" data-p3case="${c.id}"><td><a class="link">${c.no}</a></td><td>${p3Esc(c.module)}</td><td><span class="badge ${p3Severity(c.severity)}">${c.severity}</span></td><td>${p3Esc(c.title)}</td><td><span class="badge ${p3Badge(s.status)}">${s.status}</span></td><td>${s.score||0}/100</td></tr>`}).join('')}</tbody></table></div>`
  }
  function bindP3Rows(){document.querySelectorAll('[data-p3case]').forEach(r=>r.onclick=()=>renderPhase3Case(r.dataset.p3case))}

  function renderPhase3Queue(){
    setPage(`<div class="page-title-row"><h1 class="page-title">Incident queue</h1><span class="badge warn">Training</span></div><p class="subtitle">Önceliklendirme, teşhis ve kapanış takibi.</p><div class="commandbar"><button class="cmd primary" data-page="troubleshooting">Troubleshooting Center</button></div>${p3Grid()}`,'System administration > Support > Training incident queue');
    bindP3Rows();document.querySelectorAll('[data-page="troubleshooting"]').forEach(b=>b.onclick=()=>render('troubleshooting'));
  }

  function renderPhase3Case(id){
    const c=p3Case(id),s=p3State(id);p3Touch(s);
    const idx=p3Cases.indexOf(c);
    setPage(`<div class="page-title-row"><h1 class="page-title">${c.no} · ${p3Esc(c.title)}</h1><span class="badge ${p3Severity(c.severity)}">${c.severity}</span><span class="badge ${p3Badge(s.status)}">${s.status}</span></div>
      <p class="subtitle">${p3Esc(c.module)} · Vaka ${idx+1}/${p3Cases.length}</p>
      <div class="p3-incident-banner"><div><b>Kullanıcı bildirimi</b><p>${p3Esc(c.user)}</p></div><div><b>Beklenen çalışma biçimi</b><p>Config’i rastgele değiştirme. Önce kanıtı yorumla, sonra en dar ve standard çözümü seç.</p></div></div>
      <div class="tabs p3-tabs"><button class="tab active" data-p3tab="context">1 · Context</button><button class="tab" data-p3tab="evidence">2 · Evidence</button><button class="tab" data-p3tab="diagnosis">3 · Diagnosis</button><button class="tab" data-p3tab="fix">4 · Fix</button><button class="tab" data-p3tab="review">5 · Review</button></div>
      <div id="p3TabBody"></div>
      <div class="commandbar"><button class="cmd" id="p3Prev" ${idx===0?'disabled':''}>← Önceki</button><button class="cmd" id="p3Next" ${idx===p3Cases.length-1?'disabled':''}>Sonraki →</button><div class="spacer"></div><button class="cmd" id="p3ResetCase">Vakayı sıfırla</button><button class="cmd" data-page="troubleshooting">Tüm vakalar</button></div>
    `,`Production support > ${c.no}`);
    function show(tab){
      document.querySelectorAll('[data-p3tab]').forEach(b=>b.classList.toggle('active',b.dataset.p3tab===tab));
      const body=$('#p3TabBody');
      if(tab==='context')body.innerHTML=p3ContextHtml(c,s);
      if(tab==='evidence')body.innerHTML=p3EvidenceHtml(c,s);
      if(tab==='diagnosis')body.innerHTML=p3DiagnosisHtml(c,s);
      if(tab==='fix')body.innerHTML=p3FixHtml(c,s);
      if(tab==='review')body.innerHTML=p3ReviewHtml(c,s);
      bindCaseActions(c,s,show);
    }
    document.querySelectorAll('[data-p3tab]').forEach(b=>b.onclick=()=>show(b.dataset.p3tab));
    $('#p3Prev').onclick=()=>idx>0&&renderPhase3Case(p3Cases[idx-1].id);
    $('#p3Next').onclick=()=>idx<p3Cases.length-1&&renderPhase3Case(p3Cases[idx+1].id);
    $('#p3ResetCase').onclick=()=>p3ResetCase(id);
    document.querySelectorAll('[data-page="troubleshooting"]').forEach(b=>b.onclick=()=>render('troubleshooting'));
    show('context');
  }

  function p3ContextHtml(c,s){return `<div class="p3-two-col"><section>
      <div class="lesson-card context"><h3>İş bağlamı</h3><p>${p3Esc(c.context)}</p></div>
      <div class="lesson-card request"><h3>Şirketin senden istediği</h3><p>${p3Esc(c.request)}</p></div>
      <div class="lesson-card"><h3>D365FO menü yolu</h3><div class="path">${p3Esc(c.path)}</div></div>
      </section><aside class="p3-coach"><h3>Danışman refleksi</h3><ol><li>Belirtiyi kök neden sanma.</li><li>Transaction + setup + security + period + dimension katmanlarını ayır.</li><li>Standard çözümü doğrula.</li><li>Değişiklikten önce etki alanını düşün.</li><li>Fix sonrası aynı adımla yeniden test et.</li></ol></aside></div>`}

  function p3EvidenceHtml(c,s){return `<div class="p3-two-col"><section><h2 class="section-title">Evidence pack</h2>${c.evidence.map((e,i)=>`<div class="p3-evidence"><span>${String(i+1).padStart(2,'0')}</span><div>${p3Esc(e)}</div></div>`).join('')}<div class="commandbar"><button class="cmd primary" id="p3RunDiagnostics">Run diagnostic checklist</button></div><div id="p3DiagOut">${s.diagnosticsRun?p3DiagnosticOutput(c):'<div class="muted">Henüz diagnostic checklist çalıştırılmadı.</div>'}</div></section><aside class="p3-coach"><h3>Ne aramalısın?</h3><p>Evidence birbirini doğruluyor mu? Hangi bulgu standard davranışı açıklıyor? Hangi veri sadece semptom?</p><p class="small muted">Gerçek projede aynı mantıkla voucher, subledger transaction, setup, batch history, execution log ve security trace incelenir.</p></aside></div>`}

  function p3DiagnosticOutput(c){
    const common=`<div class="successbox"><b>Diagnostic run complete.</b> Sistem değişmedi; yalnız evidence kontrol edildi.</div>`;
    const map={
      'ap-posting-profile':['Posting profile resolution sırası bulundu.','Vendor-specific rule grup kuralından daha spesifik.'],
      'closed-period':['Accounting date 2026-08-31.','Ledger calendar period = Closed.'],
      'dimension-combination':['Main account aktif.','CostCenter segmenti required fakat blank.'],
      'bank-recon':['Statement vs Finance difference = 10.00.','Allowed difference = 5.00; missing bank fee evidence var.'],
      'fx-revaluation':['Open foreign-currency transaction mevcut.','Closing-date revaluation history yok.'],
      'fixed-asset-depr':['Placed-in-service date uygun.','Book Calculate depreciation = No.'],
      'budget-control':['Budget control aktif.','Available funds PO tutarından 3,000 düşük.'],
      'data-import':['Job-level framework çalışmış: 498 başarılı.','2 row-level staging/validation hatası izole edildi.'],
      'security-post':['Menu/form erişimi var.','Posting privilege/duty assigned role içinde yok.'],
      'settlement':['Invoice 1,020 ve payment 1,000.','20 EUR için destekleyici transaction yok.']
    };
    return common+`<div class="p3-findings">${(map[c.id]||[]).map(x=>`<div>✓ ${p3Esc(x)}</div>`).join('')}</div>`
  }

  function p3DiagnosisHtml(c,s){return `<h2 class="section-title">Kök neden seç</h2><p>En iyi açıklamayı seç. “Olabilir” olanı değil, evidence’in en güçlü biçimde desteklediği nedeni seç.</p><div class="p3-choice-list">${c.causes.map(([id,text])=>`<label class="p3-choice ${s.cause===id?'selected':''}"><input type="radio" name="p3cause" value="${id}" ${s.cause===id?'checked':''}><span>${p3Esc(text)}</span></label>`).join('')}</div><div class="commandbar"><button class="cmd primary" id="p3CheckCause">Check diagnosis</button></div><div id="p3CauseResult">${s.cause?p3CauseFeedback(c,s):''}</div>`}
  function p3CauseFeedback(c,s){if(!s.cause)return '';return s.cause===c.correctCause?'<div class="successbox"><b>Doğru kök neden.</b> Şimdi Fix sekmesine geç.</div>':'<div class="errorbox"><b>Henüz değil.</b> Evidence’i tekrar sırala. Semptom ile kök nedeni ayır.</div>'}

  function p3FixHtml(c,s){const causeOk=s.cause===c.correctCause;return `<h2 class="section-title">Düzeltme yaklaşımı</h2>${!causeOk?'<div class="warnbox"><b>Önce doğru diagnosis.</b> Production’da nedeni doğrulamadan config değiştirmek yeni hata üretir.</div>':''}<div class="p3-choice-list ${causeOk?'':'p3-disabled'}">${c.fixes.map(([id,text])=>`<label class="p3-choice ${s.fix===id?'selected':''}"><input type="radio" name="p3fix" value="${id}" ${s.fix===id?'checked':''} ${causeOk?'':'disabled'}><span>${p3Esc(text)}</span></label>`).join('')}</div><div class="commandbar"><button class="cmd primary" id="p3ApplyFix" ${causeOk?'':'disabled'}>Apply & validate</button></div><div id="p3FixResult">${s.fix?p3FixFeedback(c,s):''}</div>`}
  function p3FixFeedback(c,s){if(!s.fix)return '';return s.fix===c.correctFix?'<div class="successbox"><b>Validation passed.</b> Standard business behavior restored. Vaka Review aşamasına hazır.</div>':'<div class="errorbox"><b>Fix rejected.</b> Bu yaklaşım kontrolü bypass ediyor, yanlış etki alanına dokunuyor veya audit risk yaratıyor.</div>'}

  function p3ReviewHtml(c,s){
    const solved=s.status==='Solved';
    return `<div class="p3-two-col"><section><h2 class="section-title">Incident review</h2><div class="p3-review-grid"><div><b>Diagnosis</b><span>${s.cause===c.correctCause?'✓ Correct':'— Not completed'}</span></div><div><b>Fix</b><span>${s.fix===c.correctFix?'✓ Validated':'— Not completed'}</span></div><div><b>Status</b><span>${s.status}</span></div><div><b>Score</b><span>${s.score||0}/100</span></div></div><div class="field"><label>Kendi incident notun</label><textarea id="p3Notes" placeholder="Ne gördüm? Kök neden neydi? Neden bu çözümü seçtim? Hangi regression test gerekir?">${p3Esc(s.notes||'')}</textarea></div><div class="commandbar"><button class="cmd" id="p3SaveNotes">Notu kaydet</button><button class="cmd primary" id="p3MentorBtn">${s.mentorShown?'Mentor review açık':'Mentor review göster'}</button></div>${s.mentorShown?`<div class="solution-box"><h3>Mentor review</h3><p>${p3Esc(c.mentor)}</p><p><a href="${c.source}" target="_blank" rel="noopener">Microsoft Learn kaynağını aç ↗</a></p><h4>Kapanış cümlesi örneği</h4><p>“Kök neden doğrulandı, standard konfigürasyon/işlem yolu ile düzeltildi ve aynı senaryo yeniden test edildi. İlave custom geliştirme gerekmiyor.”</p></div>`:''}</section><aside class="p3-coach"><h3>Production kapanış checklist</h3><ul><li>Kök neden kanıtlandı mı?</li><li>Fix standard mı?</li><li>Yetki/audit etkisi var mı?</li><li>Voucher/subledger sonucu doğrulandı mı?</li><li>Regression senaryosu test edildi mi?</li><li>Kullanıcıya neden + çözüm anlatıldı mı?</li></ul>${solved?'<div class="successbox"><b>Vaka tamamlandı.</b></div>':'<div class="muted">Diagnosis + correct fix tamamlanınca vaka Solved olur.</div>'}</aside></div>`
  }

  function bindCaseActions(c,s,show){
    const d=$('#p3RunDiagnostics');if(d)d.onclick=()=>{s.diagnosticsRun=true;p3Touch(s);show('evidence')};
    document.querySelectorAll('input[name="p3cause"]').forEach(r=>r.onchange=()=>{s.cause=r.value;p3Touch(s);show('diagnosis')});
    const cc=$('#p3CheckCause');if(cc)cc.onclick=()=>{if(!s.cause){toast('Önce bir kök neden seç');return}if(s.cause===c.correctCause)s.score=Math.max(s.score,50);p3Touch(s);show('diagnosis')};
    document.querySelectorAll('input[name="p3fix"]').forEach(r=>r.onchange=()=>{s.fix=r.value;p3Touch(s);show('fix')});
    const af=$('#p3ApplyFix');if(af)af.onclick=()=>{if(!s.fix){toast('Önce bir fix seç');return}if(s.cause===c.correctCause&&s.fix===c.correctFix){s.score=100;s.status='Solved';toast('Fix validated — vaka çözüldü')}else{toast('Validation failed — yaklaşımı tekrar değerlendir')}p3Touch(s);show('fix')};
    const sn=$('#p3SaveNotes');if(sn)sn.onclick=()=>{s.notes=$('#p3Notes').value;p3Save();toast('Incident notu kaydedildi')};
    const mb=$('#p3MentorBtn');if(mb)mb.onclick=()=>{s.mentorShown=!s.mentorShown;p3Save();show('review')};
  }

  function renderPhase3Guide(){
    setPage(`<div class="page-title-row"><h1 class="page-title">Phase 3 guided practice</h1><span class="badge warn">Production support</span></div>
      <p class="subtitle">Bu fazı eğitime başladığında Faz 1 ve 2’den sonra yap. Şimdi platformu tamamlıyor olmamız sorun değil.</p>
      <div class="p3-guide-step"><b>1. GL / AP temellerini tamamla</b><span>Posting, voucher, posting profile, account structure, periods.</span></div>
      <div class="p3-guide-step"><b>2. Her vakada evidence-first çalış</b><span>Kullanıcı cümlesini doğrudan kök neden kabul etme.</span></div>
      <div class="p3-guide-step"><b>3. Diagnosis seç</b><span>En az değişiklikle en çok evidence’i açıklayan nedeni seç.</span></div>
      <div class="p3-guide-step"><b>4. Standard fix seç</b><span>Config/business-process ile çözülen konuya X++ yazma.</span></div>
      <div class="p3-guide-step"><b>5. Review yaz</b><span>Kendi notunda root cause, fix, test ve kullanıcı iletişimini özetle.</span></div>
      <div class="commandbar"><button class="cmd primary" data-page="troubleshooting">Production Troubleshooting Lab’i aç</button><button class="cmd" data-page="incidentQueue">Incident queue</button></div>
      <h2 class="section-title">Önerilen sıra</h2>${p3Grid()}
      <div class="info"><b>Hedef:</b> Faz 3 bittiğinde yalnız “nereden tıklanır” değil, bir Finance ticket’ında hangi katmanı hangi sırayla kontrol edeceğini öğrenmek.</div>
    `,'Training > Phase 3 guided practice');
    bindP3Rows();document.querySelectorAll('[data-page]').forEach(b=>{if(['troubleshooting','incidentQueue'].includes(b.dataset.page))b.onclick=()=>render(b.dataset.page)});
  }

  try{
    if(Array.isArray(modules)&&!modules.some(m=>m[0]==='Production support')){
      modules.unshift(['Production support',[
        ['Troubleshooting Center','Training > Production Troubleshooting Lab','troubleshooting'],
        ['Incident queue','Training > Production Troubleshooting Lab > Incident queue','incidentQueue'],
        ['Phase 3 guided practice','Training > Phase 3 guided practice','phase3Guide']
      ]]);
    }
    renders.troubleshooting=renderPhase3Center;
    renders.incidentQueue=renderPhase3Queue;
    renders.phase3Guide=renderPhase3Guide;
    renders.scenarioCenter=renderPhase3Center;
  }catch(e){console.error('Phase 3 bootstrap failed',e)}

  try{
    const baseHome=renders.home;
    renders.home=function(){
      baseHome();
      const wrap=document.querySelector('.page-wrap');
      if(wrap&&!document.querySelector('#p3HomeShortcut')){
        const t=p3Totals();
        const box=document.createElement('div');
        box.id='p3HomeShortcut';box.className='p3-home-shortcut';
        box.innerHTML=`<div><b>Phase 3 · Production Troubleshooting</b><span>${t.solved}/${p3Cases.length} vaka tamamlandı · ${t.score}/${t.max} puan</span></div><button class="cmd primary">Lab’i aç</button>`;
        box.querySelector('button').onclick=()=>render('troubleshooting');
        wrap.insertBefore(box,wrap.children[1]||null);
      }
    };
  }catch(e){console.warn(e)}
})();
