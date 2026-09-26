(function(){
  const KEY='d365fo-practice-lab-phase4-v1';
  const VERSION='4.0';
  const sources={
    po:'https://learn.microsoft.com/en-us/dynamics365/supply-chain/procurement/tasks/create-purchase-order',
    receipt:'https://learn.microsoft.com/en-us/dynamics365/supply-chain/procurement/product-receipt-against-purchase-orders',
    planned:'https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/maintain-planned-orders',
    firm:'https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/planning-optimization/planned-order-firming',
    costing:'https://learn.microsoft.com/en-us/dynamics365/supply-chain/cost-management/inventory-costing-faq'
  };

  const seed=()=>({
    version:VERSION,
    progress:{},
    products:[
      {item:'D0001',name:'Standard desk',type:'Item',group:'FG',tracking:'None',costModel:'Standard',standardCost:180,salesPrice:350,site:'1',warehouse:'11',min:20},
      {item:'M0001',name:'Steel tube',type:'Item',group:'RM',tracking:'None',costModel:'FIFO',standardCost:7.5,salesPrice:0,site:'1',warehouse:'12',min:500}
    ],
    vendors:[{account:'1001',name:'Contoso Office Supplies',currency:'USD'}],
    customers:[{account:'US-001',name:'Adventure Works',currency:'USD'}],
    onHand:[
      {item:'D0001',site:'1',warehouse:'11',physical:48,reserved:0,financial:48,value:8640},
      {item:'D0001',site:'1',warehouse:'21',physical:0,reserved:0,financial:0,value:0},
      {item:'M0001',site:'1',warehouse:'12',physical:610,reserved:0,financial:610,value:4575}
    ],
    purchaseOrders:[
      {po:'PO-40001',vendor:'1001',status:'Draft',item:'M0001',qty:100,price:8,received:0,invoiced:0,site:'1',warehouse:'12',receipts:[],invoices:[]}
    ],
    salesOrders:[
      {so:'SO-40001',customer:'US-001',status:'Open order',item:'D0001',qty:4,price:350,reserved:0,packed:0,invoiced:0,site:'1',warehouse:'11',packingSlips:[],invoices:[]}
    ],
    transfers:[],counts:[],plannedOrders:[],financeEvents:[],
    settings:{postPhysical:true,postFinancial:true}
  });

  let s=load();
  function load(){try{const x=JSON.parse(localStorage.getItem(KEY)||'null');return x&&x.version===VERSION?x:seed()}catch(e){return seed()}}
  function save(){localStorage.setItem(KEY,JSON.stringify(s))}
  function reset(){s=seed();save();renderP4('scmHub4');toast4('Faz 4 demo verisi sıfırlandı')}
  function esc4(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
  function fmt(n){return Number(n||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}
  function toast4(m){if(typeof toast==='function') return toast(m); const t=document.getElementById('toast');if(t){t.textContent=m;t.classList.remove('hidden');setTimeout(()=>t.classList.add('hidden'),2200)}}
  function mark(id){s.progress[id]=true;save()}
  function oh(item,wh){return s.onHand.find(x=>x.item===item&&x.warehouse===wh)}
  function ensureOH(item,site,warehouse){let r=oh(item,warehouse);if(!r){r={item,site,warehouse,physical:0,reserved:0,financial:0,value:0};s.onHand.push(r)}return r}
  function product(item){return s.products.find(x=>x.item===item)}
  function set(html,path){if(typeof setPage==='function'){setPage(`<div class="p4-shell">${html}</div>`,path)}else{document.querySelector('#page').innerHTML=html;document.querySelector('#breadcrumb').textContent=path} bindP4()}
  function btn(label,page,cls=''){return `<button class="cmd ${cls}" data-p4="${page}">${label}</button>`}
  function info(title,text){return `<div class="p4-note"><b>${title}</b><div>${text}</div></div>`}
  function status(st){const ok=['Invoiced','Received','Completed','Firmed'].includes(st);const warn=['Draft','Open order','Unprocessed','Approved'].includes(st);return `<span class="badge ${ok?'ok':warn?'warn':''}">${esc4(st)}</span>`}
  function grid4(h,rows){return `<div class="grid-wrap"><table class="grid"><thead><tr>${h.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`}
  function financeEvent(type,doc,description,amount){s.financeEvents.unshift({date:'2026-09-26',type,doc,description,amount});}

  const lessons=[
    ['scm-l1','Released product + inventory dimensions','Product information management > Products > Released products'],
    ['scm-l2','Purchase order creation and confirmation','Procurement and sourcing > Purchase orders > All purchase orders'],
    ['scm-l3','Product receipt and partial receipt','Purchase order > Receive > Product receipt'],
    ['scm-l4','Vendor invoice and financial update','Purchase order > Invoice > Invoice'],
    ['scm-l5','On-hand and inventory status','Inventory management > Inquiries and reports > On-hand list'],
    ['scm-l6','Transfer between warehouses','Inventory management > Outbound orders > Transfer order'],
    ['scm-l7','Inventory counting adjustment','Inventory management > Journal entries > Item counting > Counting'],
    ['scm-l8','Sales order reservation / packing slip','Sales and marketing > Sales orders > All sales orders'],
    ['scm-l9','Sales invoice + Finance bridge','Sales order > Invoice > Invoice'],
    ['scm-l10','Master planning + planned order','Master planning > Workspaces > Master planning'],
    ['scm-l11','Approve / firm planned order','Master planning > Master planning > Planned orders'],
    ['scm-l12','Inventory costing concepts','Cost management > Inquiries and reports']
  ];

  function hub(){
    const done=lessons.filter(x=>s.progress[x[0]]).length;
    set(`<div class="page-title-row"><div><h1 class="page-title">SCM Junior Transaction Engine</h1><div class="muted">Faz 4 · Product → Procure → Receive → Invoice → Inventory → Sell → Plan → Cost</div></div><span class="p4-version">v${VERSION}</span></div>
    <div class="p4-progress"><div><b>${done}/${lessons.length}</b> görev tamamlandı</div><div class="p4-bar"><i style="width:${done/lessons.length*100}%"></i></div></div>
    <div class="cards p4-cards">
      <div class="card clickable" data-p4="scmProducts4"><h3>Product master</h3><div class="kpi">${s.products.length}</div><span class="muted">Released products</span></div>
      <div class="card clickable" data-p4="scmPO4"><h3>Procure-to-stock</h3><div class="kpi">${s.purchaseOrders.length}</div><span class="muted">PO → Receipt → Invoice</span></div>
      <div class="card clickable" data-p4="scmSO4"><h3>Order-to-cash</h3><div class="kpi">${s.salesOrders.length}</div><span class="muted">SO → Packing slip → Invoice</span></div>
      <div class="card clickable" data-p4="scmPlanning4"><h3>Planning</h3><div class="kpi">${s.plannedOrders.length}</div><span class="muted">Planned orders</span></div>
    </div>
    <div class="p4-grid2">
      <div class="p4-panel"><h3>Uçtan uca çalışma sırası</h3>${lessons.map((l,i)=>`<button class="p4-lesson ${s.progress[l[0]]?'done':''}" data-p4="scmGuide4" data-lesson="${l[0]}"><span>${s.progress[l[0]]?'✓':i+1}</span><div><b>${l[1]}</b><small>${l[2]}</small></div></button>`).join('')}</div>
      <div class="p4-panel"><h3>Modüller</h3><div class="p4-links">
        ${btn('Released products','scmProducts4')}${btn('Purchase orders','scmPO4')}${btn('On-hand','scmInventory4')}${btn('Transfer & counting','scmMovement4')}${btn('Sales orders','scmSO4')}${btn('Warehouse basics','scmWarehouse4')}${btn('Master planning','scmPlanning4')}${btn('Costing + Finance bridge','scmCosting4')}
      </div>${info('Önemli','Bu simülatörde muhasebe hesapları öğretim amacıyla sadeleştirilmiştir. Gerçek D365FO hesapları Inventory posting, item group ve posting setup’a göre değişir; amaç olayın fiziksel/finansal zamanlamasını öğretmektir.')}</div>
    </div>`, 'Supply Chain Management > Practice workspace');
  }

  function productsPage(){
    mark('scm-l1');
    set(`<div class="page-title-row"><h1 class="page-title">Released products</h1>${btn('SCM workspace','scmHub4')}</div>
      ${info('İş bağlamı','Ürün ana verisi; satın alma, stok, satış, maliyet ve planlamanın ortak temelidir. Site/warehouse gibi storage dimensions işlemlerin nerede gerçekleştiğini belirler.')}
      ${grid4(['Item number','Product name','Group','Cost model','Standard cost','Site','Warehouse','Min. inventory'],s.products.map(p=>`<tr><td><a class="link" data-item4="${p.item}">${p.item}</a></td><td>${p.name}</td><td>${p.group}</td><td>${p.costModel}</td><td>${fmt(p.standardCost)}</td><td>${p.site}</td><td>${p.warehouse}</td><td>${p.min}</td></tr>`))}
      <div id="p4ProductDetail"></div>`, 'Product information management > Products > Released products');
    document.querySelectorAll('[data-item4]').forEach(a=>a.onclick=()=>{const p=product(a.dataset.item4);document.querySelector('#p4ProductDetail').innerHTML=`<div class="p4-panel"><h3>${p.item} · ${p.name}</h3><div class="p4-facts"><span>Item group <b>${p.group}</b></span><span>Cost model <b>${p.costModel}</b></span><span>Default order site <b>${p.site}</b></span><span>Default warehouse <b>${p.warehouse}</b></span></div>${info('Danışman gözüyle','Bir işlem yanlış site/warehouse’a gidiyorsa önce ürün defaults, order line dimensions ve warehouse setup incelenir. Kod değişikliği ilk seçenek değildir.')}</div>`})
  }

  function poList(){
    set(`<div class="page-title-row"><h1 class="page-title">All purchase orders</h1>${btn('SCM workspace','scmHub4')}</div>
      ${info('Amaç','Tedarikçiden stoklu mal alma sürecini Draft → Confirmed/Open order → Product receipt → Invoiced şeklinde çalış.')}
      ${grid4(['Purchase order','Vendor','Item','Qty','Received','Invoiced','Status'],s.purchaseOrders.map(x=>`<tr><td><a class="link" data-po4="${x.po}">${x.po}</a></td><td>${x.vendor}</td><td>${x.item}</td><td>${x.qty}</td><td>${x.received}</td><td>${x.invoiced}</td><td>${status(x.status)}</td></tr>`))}
      <div class="p4-actions">${btn('+ New training PO','scmNewPO4','primary')}</div>`, 'Procurement and sourcing > Purchase orders > All purchase orders');
    document.querySelectorAll('[data-po4]').forEach(a=>a.onclick=()=>poCard(a.dataset.po));
  }
  function newPO(){
    const n='PO-'+String(40001+s.purchaseOrders.length).padStart(5,'0');s.purchaseOrders.push({po:n,vendor:'1001',status:'Draft',item:'M0001',qty:80,price:8.25,received:0,invoiced:0,site:'1',warehouse:'12',receipts:[],invoices:[]});save();poCard(n);toast4('Yeni eğitim PO oluşturuldu')
  }
  function poCard(id){
    const x=s.purchaseOrders.find(p=>p.po===id), remain=x.qty-x.received, invRemain=x.received-x.invoiced;
    set(`<div class="page-title-row"><div><h1 class="page-title">Purchase order ${x.po}</h1><div class="muted">Vendor ${x.vendor}</div></div>${status(x.status)}</div>
      <div class="commandbar"><button class="cmd" id="p4ConfirmPO" ${x.status!=='Draft'?'disabled':''}>Purchase · Confirm</button><button class="cmd" id="p4ReceiptPO" ${!['Open order','Received'].includes(x.status)||remain<=0?'disabled':''}>Receive · Product receipt</button><button class="cmd primary" id="p4InvoicePO" ${invRemain<=0?'disabled':''}>Invoice · Invoice</button><div class="spacer"></div>${btn('Back','scmPO4')}</div>
      <div class="p4-facts"><span>Item <b>${x.item}</b></span><span>Ordered <b>${x.qty}</b></span><span>Received <b>${x.received}</b></span><span>Invoiced <b>${x.invoiced}</b></span><span>Unit price <b>${fmt(x.price)}</b></span><span>Warehouse <b>${x.warehouse}</b></span></div>
      ${info('Eğitim sorusu',x.status==='Draft'?'Bir PO neden önce confirm edilir? Confirmation, siparişin tedarikçiye taahhüt edilen sürümünü oluşturur.':remain>0?'Gelen miktar siparişten azsa ne olur? Partial product receipt yapabilir ve kalan miktarı sonraki receipt ile alabilirsin.':invRemain>0?'Fiziksel receipt var ancak henüz financial invoice yok. Bu iki güncellemenin stok/muhasebe etkisini ayır.':'PO zinciri tamamlandı. Şimdi oluşan inventory ve Finance etkilerini incele.')}
      <div class="p4-grid2"><div class="p4-panel"><h3>Product receipts</h3>${x.receipts.length?grid4(['Receipt','Qty','Date'],x.receipts.map(r=>`<tr><td>${r.id}</td><td>${r.qty}</td><td>${r.date}</td></tr>`)):'<div class="muted">Henüz product receipt yok.</div>'}</div><div class="p4-panel"><h3>Vendor invoices</h3>${x.invoices.length?grid4(['Invoice','Qty','Amount'],x.invoices.map(r=>`<tr><td>${r.id}</td><td>${r.qty}</td><td>${fmt(r.amount)}</td></tr>`)):'<div class="muted">Henüz invoice yok.</div>'}</div></div>
      <div id="p4POResult"></div>`, `Procurement and sourcing > Purchase orders > All purchase orders > ${x.po}`);
    document.querySelector('#p4ConfirmPO').onclick=()=>{x.status='Open order';mark('scm-l2');save();poCard(id);toast4('Purchase order confirmed')};
    const rb=document.querySelector('#p4ReceiptPO');if(rb) rb.onclick=()=>receiptDialog(x);
    const ib=document.querySelector('#p4InvoicePO');if(ib) ib.onclick=()=>invoicePODialog(x);
  }
  function receiptDialog(x){
    const remain=x.qty-x.received; const q=Math.min(remain,Math.max(1,Math.floor(remain/2)||remain));
    document.querySelector('#p4POResult').innerHTML=`<div class="p4-panel p4-inline"><h3>Posting product receipt</h3><label>Quantity to receive</label><input id="p4ReceiptQty" type="number" min="1" max="${remain}" value="${q}"><label>Product receipt</label><input id="p4ReceiptId" value="PR-${x.po}-${x.receipts.length+1}"><button class="cmd primary" id="p4PostReceipt">OK / Post receipt</button><div class="muted">Path: Purchase order > Receive > Product receipt</div></div>`;
    document.querySelector('#p4PostReceipt').onclick=()=>{const qty=Number(document.querySelector('#p4ReceiptQty').value);if(!qty||qty<1||qty>remain)return toast4('Geçerli receipt miktarı gir');const r=ensureOH(x.item,x.site,x.warehouse);r.physical+=qty;x.received+=qty;x.receipts.push({id:document.querySelector('#p4ReceiptId').value||`PR-${Date.now()}`,qty,date:'2026-09-26'});x.status=x.received>=x.qty?'Received':'Open order';if(s.settings.postPhysical)financeEvent('Physical update',x.po,`Product receipt ${qty} ${x.item} (simplified physical posting)`,qty*x.price);mark('scm-l3');save();poCard(x.po);toast4(`${qty} adet product receipt post edildi`)}
  }
  function invoicePODialog(x){
    const max=x.received-x.invoiced;
    document.querySelector('#p4POResult').innerHTML=`<div class="p4-panel p4-inline"><h3>Vendor invoice</h3><label>Quantity</label><input id="p4InvQty" type="number" min="1" max="${max}" value="${max}"><label>Invoice number</label><input id="p4InvId" value="INV-${x.po}-${x.invoices.length+1}"><button class="cmd primary" id="p4PostInv">Post</button><div class="muted">Invoice quantity cannot exceed financially eligible received quantity in this training scenario.</div></div>`;
    document.querySelector('#p4PostInv').onclick=()=>{const qty=Number(document.querySelector('#p4InvQty').value);if(!qty||qty<1||qty>max)return toast4('Invoice miktarı received fakat invoiced olmayan miktarı aşamaz');const r=ensureOH(x.item,x.site,x.warehouse);r.financial+=qty;r.value+=qty*x.price;x.invoiced+=qty;x.invoices.push({id:document.querySelector('#p4InvId').value||`INV-${Date.now()}`,qty,amount:qty*x.price});financeEvent('Financial update',x.po,`Vendor invoice ${qty} ${x.item}: inventory/AP bridge (simplified)`,qty*x.price);x.status=x.invoiced>=x.qty?'Invoiced':(x.received>=x.qty?'Received':'Open order');mark('scm-l4');save();poCard(x.po);toast4('Vendor invoice posted')}
  }

  function inventoryPage(){
    mark('scm-l5');
    set(`<div class="page-title-row"><h1 class="page-title">On-hand list</h1>${btn('SCM workspace','scmHub4')}</div>
      ${info('Physical vs financial','Product receipt / packing slip gibi physical updates ile vendor/customer invoice gibi financial updates farklı zamanlarda gerçekleşebilir. Bu ayrımı inventory ve Finance troubleshooting için öğren.')}
      ${grid4(['Item','Site','Warehouse','Physical','Reserved','Available physical','Financial qty','Inventory value'],s.onHand.map(r=>`<tr><td>${r.item}</td><td>${r.site}</td><td>${r.warehouse}</td><td>${r.physical}</td><td>${r.reserved}</td><td>${r.physical-r.reserved}</td><td>${r.financial}</td><td>${fmt(r.value)}</td></tr>`))}`, 'Inventory management > Inquiries and reports > On-hand list');
  }

  function movementPage(){
    set(`<div class="page-title-row"><h1 class="page-title">Transfer & counting lab</h1>${btn('SCM workspace','scmHub4')}</div>
      <div class="p4-grid2"><div class="p4-panel"><h3>Warehouse transfer</h3><p>D0001’i warehouse 11’den 21’e taşı. Transfer fiziksel lokasyonu değiştirir; toplam şirket stoğunu değiştirmez.</p><label>Qty</label><input id="p4TransferQty" type="number" value="5" min="1"><button class="cmd primary" id="p4DoTransfer">Post transfer</button></div>
      <div class="p4-panel"><h3>Counting adjustment</h3><p>Warehouse 12’de M0001 sayım sonucu ile sistem miktarı arasındaki farkı kaydet.</p><label>Counted physical</label><input id="p4CountQty" type="number" value="608"><button class="cmd primary" id="p4DoCount">Post counting journal</button></div></div>
      <h3 class="section-title">History</h3>${grid4(['Type','Reference','Details'],[...s.transfers.map(x=>`<tr><td>Transfer</td><td>${x.id}</td><td>${x.item}: ${x.qty} · ${x.from} → ${x.to}</td></tr>`),...s.counts.map(x=>`<tr><td>Counting</td><td>${x.id}</td><td>${x.item} ${x.warehouse}: system ${x.system} → counted ${x.counted} · variance ${x.variance}</td></tr>`)] )}`, 'Inventory management > Journal entries');
    document.querySelector('#p4DoTransfer').onclick=()=>{const qty=Number(document.querySelector('#p4TransferQty').value),from=ensureOH('D0001','1','11'),to=ensureOH('D0001','1','21');if(qty<=0||qty>from.physical-from.reserved)return toast4('Transfer için kullanılabilir physical stok yetersiz');from.physical-=qty;from.financial-=Math.min(qty,from.financial);const unit=product('D0001').standardCost;from.value=Math.max(0,from.value-qty*unit);to.physical+=qty;to.financial+=qty;to.value+=qty*unit;s.transfers.unshift({id:'TO-'+(s.transfers.length+1).toString().padStart(4,'0'),item:'D0001',qty,from:'11',to:'21'});mark('scm-l6');save();movementPage();toast4('Transfer posted')};
    document.querySelector('#p4DoCount').onclick=()=>{const r=ensureOH('M0001','1','12'),counted=Number(document.querySelector('#p4CountQty').value);if(counted<0)return toast4('Counted quantity geçersiz');const system=r.physical,variance=counted-system;r.physical=counted;r.financial+=variance;r.value+=variance*product('M0001').standardCost;s.counts.unshift({id:'CNT-'+(s.counts.length+1).toString().padStart(4,'0'),item:'M0001',warehouse:'12',system,counted,variance});if(variance)financeEvent('Inventory adjustment',s.counts[0].id,`Counting variance ${variance} M0001`,variance*product('M0001').standardCost);mark('scm-l7');save();movementPage();toast4('Counting journal posted')}
  }

  function soList(){
    set(`<div class="page-title-row"><h1 class="page-title">All sales orders</h1>${btn('SCM workspace','scmHub4')}</div>
      ${info('Amaç','Talebi stoktan karşıla: reservation → packing slip (physical issue) → invoice (financial issue + AR/revenue).')}
      ${grid4(['Sales order','Customer','Item','Qty','Reserved','Packed','Invoiced','Status'],s.salesOrders.map(x=>`<tr><td><a class="link" data-so4="${x.so}">${x.so}</a></td><td>${x.customer}</td><td>${x.item}</td><td>${x.qty}</td><td>${x.reserved}</td><td>${x.packed}</td><td>${x.invoiced}</td><td>${status(x.status)}</td></tr>`))}`, 'Sales and marketing > Sales orders > All sales orders');
    document.querySelectorAll('[data-so4]').forEach(a=>a.onclick=()=>soCard(a.dataset.so));
  }
  function soCard(id){
    const x=s.salesOrders.find(o=>o.so===id),r=ensureOH(x.item,x.site,x.warehouse),packRemain=x.qty-x.packed,invRemain=x.packed-x.invoiced;
    set(`<div class="page-title-row"><div><h1 class="page-title">Sales order ${x.so}</h1><div class="muted">Customer ${x.customer}</div></div>${status(x.status)}</div>
      <div class="commandbar"><button class="cmd" id="p4ReserveSO" ${x.reserved>=x.qty?'disabled':''}>Inventory · Reserve</button><button class="cmd" id="p4PackSO" ${packRemain<=0?'disabled':''}>Pick and pack · Packing slip</button><button class="cmd primary" id="p4InvoiceSO" ${invRemain<=0?'disabled':''}>Invoice · Invoice</button><div class="spacer"></div>${btn('Back','scmSO4')}</div>
      <div class="p4-facts"><span>Item <b>${x.item}</b></span><span>Ordered <b>${x.qty}</b></span><span>Reserved <b>${x.reserved}</b></span><span>Packed <b>${x.packed}</b></span><span>Invoiced <b>${x.invoiced}</b></span><span>Available physical <b>${r.physical-r.reserved}</b></span></div>
      ${info('Eğitim sorusu','Reservation kullanılabilir stoğu ayırır. Packing slip physical issue oluşturur. Invoice ise customer receivable/revenue ve inventory financial update tarafını tamamlar.')}
      <div id="p4SOResult"></div>`, `Sales and marketing > Sales orders > All sales orders > ${x.so}`);
    document.querySelector('#p4ReserveSO').onclick=()=>{const need=x.qty-x.reserved,avail=r.physical-r.reserved;if(need>avail)return toast4('Yeterli available physical stok yok');r.reserved+=need;x.reserved+=need;save();soCard(id);toast4(`${need} adet reserve edildi`)};
    document.querySelector('#p4PackSO').onclick=()=>{const q=x.qty-x.packed;if(x.reserved<q)return toast4('Önce sipariş miktarını reserve et');r.reserved-=q;r.physical-=q;x.reserved-=q;x.packed+=q;x.packingSlips.push({id:'PS-'+x.so+'-'+(x.packingSlips.length+1),qty:q});x.status='Delivered';if(s.settings.postPhysical)financeEvent('Physical issue',x.so,`Packing slip ${q} ${x.item} (simplified physical COGS/inventory event)`,q*product(x.item).standardCost);mark('scm-l8');save();soCard(id);toast4('Packing slip posted')};
    document.querySelector('#p4InvoiceSO').onclick=()=>{const q=x.packed-x.invoiced;if(q<=0)return;const unitCost=product(x.item).standardCost;r.financial=Math.max(0,r.financial-q);r.value=Math.max(0,r.value-q*unitCost);x.invoiced+=q;x.invoices.push({id:'SINV-'+x.so+'-'+(x.invoices.length+1),qty:q,amount:q*x.price});x.status=x.invoiced>=x.qty?'Invoiced':'Delivered';financeEvent('Sales invoice',x.so,`AR/Revenue ${fmt(q*x.price)}; financial inventory/COGS ${fmt(q*unitCost)} (simplified)`,q*x.price);mark('scm-l9');save();soCard(id);toast4('Sales invoice posted')}
  }

  function warehousePage(){
    set(`<div class="page-title-row"><h1 class="page-title">Warehouse basics</h1>${btn('SCM workspace','scmHub4')}</div>
      <div class="p4-grid2"><div class="p4-panel"><h3>Non-WMS flow</h3><ol><li>Purchase order</li><li>Register (optional)</li><li>Product receipt</li><li>Inventory available</li><li>Sales reservation</li><li>Packing slip</li></ol></div>
      <div class="p4-panel"><h3>WMS-aware thinking</h3><ol><li>Inbound load / ASN</li><li>Receiving / put-away work</li><li>Location directives & work templates</li><li>Reservation hierarchy</li><li>Wave / work creation</li><li>Pick / stage / load</li></ol></div></div>
      ${info('Junior hedef','Bu fazda WMS konfigürasyon uzmanlığı değil; transaction’ın stok dimensions, reservation ve physical update ile ilişkisini kavraman hedefleniyor.')}`,'Warehouse management > Workspaces');
  }

  function planningPage(){
    set(`<div class="page-title-row"><h1 class="page-title">Master planning workspace</h1>${btn('SCM workspace','scmHub4')}</div>
      ${info('Mantık','Planlama projected inventory, demand, supply, min/safety stock, lead time ve coverage kurallarına göre planned orders üretir. Planned order önce Unprocessed olabilir; Approved yapılabilir, ardından firm edilince gerçek PO/transfer/production order oluşur.')}
      <div class="commandbar"><button class="cmd primary" id="p4RunPlan">Run simplified plan</button></div>
      ${grid4(['Planned order','Type','Item','Qty','Status','Need reason','Action'],s.plannedOrders.map((p,i)=>`<tr><td>${p.id}</td><td>${p.type}</td><td>${p.item}</td><td>${p.qty}</td><td>${status(p.status)}</td><td>${p.reason}</td><td>${p.status==='Unprocessed'?`<button class="cmd" data-approve4="${i}">Approve</button>`:p.status==='Approved'?`<button class="cmd primary" data-firm4="${i}">Firm</button>`:'-'}</td></tr>`))}
      ${s.plannedOrders.length?'':info('Görev','M0001 için min inventory 500. Önce Inventory counting ile quantity’yi 450 gibi min altına indirip planning run yapmayı da deneyebilirsin.')}`, 'Master planning > Workspaces > Master planning');
    document.querySelector('#p4RunPlan').onclick=()=>{s.plannedOrders=s.plannedOrders.filter(p=>p.status==='Firmed');s.products.forEach(p=>{const total=s.onHand.filter(x=>x.item===p.item).reduce((a,b)=>a+b.physical-b.reserved,0);if(total<p.min){s.plannedOrders.push({id:'PLAN-'+(s.plannedOrders.length+1).toString().padStart(4,'0'),type:p.group==='RM'?'Purchase order':'Production order',item:p.item,qty:p.min-total,status:'Unprocessed',reason:`Projected ${total} < min ${p.min}`})}});mark('scm-l10');save();planningPage();toast4('Simplified master plan completed')};
    document.querySelectorAll('[data-approve4]').forEach(b=>b.onclick=()=>{s.plannedOrders[+b.dataset.approve4].status='Approved';save();planningPage();toast4('Planned order approved')});
    document.querySelectorAll('[data-firm4]').forEach(b=>b.onclick=()=>{const p=s.plannedOrders[+b.dataset.firm4];p.status='Firmed';if(p.type==='Purchase order'){const id='PO-'+String(40100+s.purchaseOrders.length);s.purchaseOrders.push({po:id,vendor:'1001',status:'Draft',item:p.item,qty:p.qty,price:product(p.item).standardCost,received:0,invoiced:0,site:'1',warehouse:product(p.item).warehouse,receipts:[],invoices:[]});p.createdOrder=id}mark('scm-l11');save();planningPage();toast4(p.type==='Purchase order'?`Firmed → ${p.createdOrder}`:'Firmed (production order concept only in this junior lab)')})
  }

  function costingPage(){
    mark('scm-l12');
    const total=s.onHand.reduce((a,b)=>a+b.value,0);
    set(`<div class="page-title-row"><h1 class="page-title">Inventory costing & Finance bridge</h1>${btn('SCM workspace','scmHub4')}</div>
      <div class="cards"><div class="card"><h3>Inventory value</h3><div class="kpi">${fmt(total)}</div><span class="muted">Simplified training value</span></div><div class="card"><h3>Finance events</h3><div class="kpi">${s.financeEvents.length}</div><span class="muted">Physical + financial</span></div></div>
      ${grid4(['Item','Cost model','Training unit cost','Physical qty','Financial qty','Value'],s.products.map(p=>{const rs=s.onHand.filter(x=>x.item===p.item);return `<tr><td>${p.item}</td><td>${p.costModel}</td><td>${fmt(p.standardCost)}</td><td>${rs.reduce((a,b)=>a+b.physical,0)}</td><td>${rs.reduce((a,b)=>a+b.financial,0)}</td><td>${fmt(rs.reduce((a,b)=>a+b.value,0))}</td></tr>`}))}
      <h3 class="section-title">Posting timeline</h3>${grid4(['Date','Event','Document','What happened','Amount'],s.financeEvents.map(e=>`<tr><td>${e.date}</td><td>${e.type}</td><td>${e.doc}</td><td>${e.description}</td><td>${fmt(e.amount)}</td></tr>`))}
      ${info('Gerçek proje notu','Exact ledger postings depend on item group inventory posting setup, product receipt/packing slip ledger parameters, cost model and settlement/close. Buradaki hesaplama olay sırasını öğretmek için sadeleştirilmiştir.')}
      <a class="p4-source" href="${sources.costing}" target="_blank" rel="noopener">Microsoft Learn · Inventory costing FAQ ↗</a>`, 'Cost management > Inquiries and reports');
  }

  function guidePage(lessonId){
    const selected=lessons.find(x=>x[0]===lessonId)||lessons.find(x=>!s.progress[x[0]])||lessons[0], idx=lessons.indexOf(selected);
    const instructions={
      'scm-l1':['Released products ekranını aç. D0001 ve M0001’in item group, cost model, site ve warehouse alanlarını karşılaştır.','scmProducts4'],
      'scm-l2':['PO-40001’i aç ve Purchase > Confirm kullan. Draft ile confirmed/open order farkını gözle.','scmPO4'],
      'scm-l3':['PO-40001 için önce partial product receipt post et, sonra kalan miktarı receive et. On-hand physical değişimini izle.','scmPO4'],
      'scm-l4':['Received miktarı vendor invoice ile financial update et. On-hand financial qty ve Finance bridge event’i incele.','scmPO4'],
      'scm-l5':['On-hand listesinde physical, reserved, available physical ve financial qty alanlarını karşılaştır.','scmInventory4'],
      'scm-l6':['D0001’den 5 adedi warehouse 11 → 21 transfer et. Total quantity’nin değişmediğini doğrula.','scmMovement4'],
      'scm-l7':['M0001 counting result gir ve variance’nin stok ile finance event’e etkisini incele.','scmMovement4'],
      'scm-l8':['SO-40001’de önce Reserve sonra Packing slip yap. Physical on-hand’in düştüğünü gör.','scmSO4'],
      'scm-l9':['Packing slip sonrası Sales invoice post et; AR/revenue ve financial inventory timing’ini incele.','scmSO4'],
      'scm-l10':['Bir ürün min seviyenin altındaysa master plan run et ve Unprocessed planned order üret.','scmPlanning4'],
      'scm-l11':['Planned purchase order’ı Approve ardından Firm yap; gerçek draft PO’ya dönüştüğünü kontrol et.','scmPlanning4'],
      'scm-l12':['Costing ekranında physical/financial event timeline’ını açıklayabilecek hale gel.','scmCosting4']
    };
    const ins=instructions[selected[0]];
    set(`<div class="page-title-row"><div><h1 class="page-title">SCM Guided Practice · ${idx+1}/12</h1><div class="muted">${selected[2]}</div></div>${btn('SCM workspace','scmHub4')}</div>
      <div class="p4-panel"><span class="p4-stepno">${idx+1}</span><h2>${selected[1]}</h2><h4>Görev</h4><p>${ins[0]}</p><h4>Kendine sor</h4><ul><li>Bu adım physical mı, financial mı?</li><li>Hangi master data / setup bu sonucu etkiler?</li><li>Yanlış sonuç olursa ilk bakacağım ekran veya veri nedir?</li></ul><div class="p4-actions">${btn('İlgili ekrana git',ins[1],'primary')}<button class="cmd" id="p4MarkLesson">Görevi tamamlandı işaretle</button></div></div>
      <div class="p4-panel"><h3>Öğretici ilke</h3><p>İşlem ekranını ezberlemek yerine document status + inventory transaction + physical/financial update + Finance etkisi zincirini takip et. Bu düşünme biçimi production ticket çözerken menü ezberinden daha değerlidir.</p></div>`, 'Training center > SCM junior path');
    document.querySelector('#p4MarkLesson').onclick=()=>{mark(selected[0]);guidePage(selected[0]);toast4('Görev tamamlandı')};
  }

  function bindP4(){
    document.querySelectorAll('[data-p4]').forEach(b=>b.onclick=(e)=>{e.preventDefault();const lesson=b.dataset.lesson;renderP4(b.dataset.p4,lesson)});
  }
  function renderP4(page,extra){
    const map={scmHub4:hub,scmProducts4:productsPage,scmPO4:poList,scmNewPO4:newPO,scmInventory4:inventoryPage,scmMovement4:movementPage,scmSO4:soList,scmWarehouse4:warehousePage,scmPlanning4:planningPage,scmCosting4:costingPage,scmGuide4:()=>guidePage(extra)};
    if(map[page]){map[page]();return true}return false
  }

  const prevRender=window.render;
  window.render=function(page){if(renderP4(page))return;return prevRender(page)};
  const prevModules=window.renderModules;
  window.renderModules=function(){prevModules();const c=document.querySelector('#navContent');if(c){c.insertAdjacentHTML('beforeend',`<div class="nav-group"><h4>Supply Chain Management · Faz 4</h4><button class="nav-link" data-p4="scmHub4">SCM practice workspace</button><button class="nav-link" data-p4="scmPO4">Procurement and sourcing</button><button class="nav-link" data-p4="scmInventory4">Inventory management</button><button class="nav-link" data-p4="scmSO4">Sales and marketing</button><button class="nav-link" data-p4="scmPlanning4">Master planning</button><button class="nav-link" data-p4="scmCosting4">Cost management</button></div>`);bindP4()}};

  const oldHome=window.renderHome;
  window.renderHome=function(){oldHome();const root=document.querySelector('#page .page-wrap');if(root){root.insertAdjacentHTML('beforeend',`<h2 class="section-title">Faz 4 · SCM Transaction Engine</h2><div class="cards"><div class="card clickable" data-p4="scmHub4"><h3>SCM junior lab</h3><div class="kpi">${lessons.filter(x=>s.progress[x[0]]).length}/12</div><span class="muted">Procurement · Inventory · Sales · Planning · Costing</span></div></div>`);bindP4()}};

  window.D365P4={render:renderP4,reset,state:()=>s,sources};
  document.querySelector('.brand span') && (document.querySelector('.brand span').textContent='Finance · SCM · X++ Practice Lab · Phase 4');
})();