/* app.js - localStorage-based ticket frontend */
const LS_KEY = 'supportdesk_tickets_v1';
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,6);
const qs = s => document.querySelector(s);

const SAMPLE = [
  {id: 'T-'+uid(), name:'Rahul Sharma', email:'rahul@example.com', subject:'Unable to login', description:'I get an error 401 when trying to login via web. Steps: ...', priority:'high', status:'open', createdAt: Date.now()-1000*60*60*24},
  {id: 'T-'+uid(), name:'Priya Singh', email:'priya@example.com', subject:'Billing mistake', description:'I was charged twice for invoice #1234', priority:'medium', status:'pending', createdAt: Date.now()-1000*60*60*48},
  {id: 'T-'+uid(), name:'Sameer', email:'sameer@example.com', subject:'Feature request: Dark mode', description:'Please provide a dark mode for the dashboard', priority:'low', status:'closed', createdAt: Date.now()-1000*60*60*72}
];

function loadTickets(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    if(!raw) return [];
    return JSON.parse(raw);
  }catch(e){ console.error('invalid storage',e); return [];}
}
function saveTickets(list){
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

let tickets = loadTickets();

const ticketsList = qs('#ticketsList');
const ticketForm = qs('#ticketForm');
const btnSeed = qs('#btnSeed');
const btnReset = qs('#btnReset');
const statTotal = qs('#statTotal');
const statOpen = qs('#statOpen');
const statPending = qs('#statPending');
const statClosed = qs('#statClosed');
const statOpenBig = qs('#statOpenBig');
const statPendingBig = qs('#statPendingBig');
const statClosedBig = qs('#statClosedBig');
const searchInput = qs('#searchInput');
const btnClearSearch = qs('#btnClearSearch');
const filterStatus = qs('#filterStatus');
const sortBy = qs('#sortBy');
const btnNewTicket = qs('#btnNewTicket');
const modal = qs('#modal');
const modalTitle = qs('#modalTitle');
const modalMeta = qs('#modalMeta');
const modalBody = qs('#modalBody');
const modalStatus = qs('#modalStatus');
const btnCloseModal = qs('#btnCloseModal');
const btnSaveStatus = qs('#btnSaveStatus');
const btnDelete = qs('#btnDelete');
const btnExport = qs('#btnExport');
const btnImport = qs('#btnImport');
const fileInput = qs('#fileInput');

let currentOpenTicketId = null;

function render(){
  const q = searchInput.value.trim().toLowerCase();
  const statusFilter = filterStatus.value;
  const sortOpt = sortBy.value;

  let filtered = tickets.filter(t => {
    if(statusFilter !== 'all' && t.status !== statusFilter) return false;
    if(!q) return true;
    return [t.id,t.name,t.email,t.subject,t.description].join(' ').toLowerCase().includes(q);
  });

  if(sortOpt === 'newest') filtered.sort((a,b)=>b.createdAt-a.createdAt);
  if(sortOpt === 'oldest') filtered.sort((a,b)=>a.createdAt-b.createdAt);
  if(sortOpt === 'priority') filtered.sort((a,b)=> priorityRank(b.priority) - priorityRank(a.priority));

  ticketsList.innerHTML = '';
  if(filtered.length === 0){
    ticketsList.innerHTML = '<div class="tiny muted">No tickets match your search/filter.</div>';
  }
  filtered.forEach(t => ticketsList.appendChild(ticketCard(t)));

  const total = tickets.length;
  const open = tickets.filter(x=>x.status==='open').length;
  const pending = tickets.filter(x=>x.status==='pending').length;
  const closed = tickets.filter(x=>x.status==='closed').length;

  statTotal.textContent = total;
  statOpen.textContent = open;
  statPending.textContent = pending;
  statClosed.textContent = closed;
  statOpenBig.textContent = open;
  statPendingBig.textContent = pending;
  statClosedBig.textContent = closed;
}

function priorityRank(p){ return p==='high'?3: p==='medium'?2:1 }

function ticketCard(t){
  const el = document.createElement('div');
  el.className = 'ticket-card';
  el.tabIndex = 0;

  const left = document.createElement('div');
  left.style.width = '56px';
  left.style.flex = '0 0 56px';
  left.style.display='flex';
  left.style.flexDirection='column';
  left.style.alignItems='center';
  left.style.justifyContent='center';
  left.innerHTML = `<div style='font-weight:700;font-size:13px'>${t.name.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase()}</div><div class='tiny muted' style='margin-top:6px'>${new Date(t.createdAt).toLocaleDateString()}</div>`;

  const meta = document.createElement('div');
  meta.className = 'ticket-meta';
  meta.innerHTML = `<div class='ticket-title'>${escapeHtml(t.subject)} <span class='tiny muted'>– ${escapeHtml(t.id)}</span></div><div class='ticket-desc'>${escapeHtml(t.description.slice(0,140))}${t.description.length>140?'...':''}</div>`;

  const right = document.createElement('div');
  right.style.display='flex';
  right.style.flexDirection='column';
  right.style.alignItems='flex-end';
  right.style.gap='8px';

  const pill = document.createElement('div');
  pill.className = 'pill ' + (t.status);
  pill.textContent = t.status.toUpperCase();

  const mini = document.createElement('div');
  mini.className='tiny muted';
  mini.textContent = `${t.priority.toUpperCase()} • ${t.email}`;

  right.appendChild(pill);
  right.appendChild(mini);

  el.appendChild(left);
  el.appendChild(meta);
  el.appendChild(right);

  el.addEventListener('click', ()=> openModal(t.id));
  el.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') openModal(t.id) });

  return el;
}

function escapeHtml(s){
  if(!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* Create/Update/Delete */
ticketForm.addEventListener('submit', e=>{
  e.preventDefault();
  const name = qs('#name').value.trim();
  const email = qs('#email').value.trim();
  const subject = qs('#subject').value.trim();
  const priority = qs('#priority').value;
  const description = qs('#description').value.trim();

  const t = { id: 'T-'+uid(), name, email, subject, priority, description, status:'open', createdAt: Date.now() };
  tickets.unshift(t);
  saveTickets(tickets);
  render();
  ticketForm.reset();
  qs('#priority').value='medium';
  setTimeout(()=> openModal(t.id),150);
});

function openModal(id){
  const t = tickets.find(x=>x.id===id);
  if(!t) return;
  currentOpenTicketId = id;
  modalTitle.textContent = `${t.subject} • ${t.id}`;
  modalMeta.textContent = `by ${t.name} • ${t.email} • ${t.priority.toUpperCase()} • ${t.status.toUpperCase()}`;
  modalBody.textContent = t.description || '(no description)';
  modalStatus.value = t.status;
  modal.classList.add('show');
  qs('#btnCloseModal').focus();
}

qs('#btnCloseModal').addEventListener('click', ()=>{ modal.classList.remove('show'); currentOpenTicketId = null });

btnSaveStatus.addEventListener('click', ()=>{
  if(!currentOpenTicketId) return;
  const t = tickets.find(x=>x.id===currentOpenTicketId);
  if(!t) return;
  t.status = modalStatus.value;
  saveTickets(tickets);
  render();
  modal.classList.remove('show');
  currentOpenTicketId = null;
});

btnDelete.addEventListener('click', ()=>{
  if(!currentOpenTicketId) return;
  if(!confirm('Delete this ticket? This cannot be undone.')) return;
  tickets = tickets.filter(x=>x.id!==currentOpenTicketId);
  saveTickets(tickets);
  render();
  modal.classList.remove('show');
  currentOpenTicketId = null;
});

/* seed / reset */
btnSeed.addEventListener('click', ()=>{
  if(!confirm('Load sample tickets? This will append to existing tickets.')) return;
  tickets = SAMPLE.concat(tickets);
  saveTickets(tickets);
  render();
});
btnReset.addEventListener('click', ()=>{
  if(!confirm('Reset and remove all tickets from local storage?')) return;
  tickets = [];
  saveTickets(tickets);
  render();
});

/* search & filter */
searchInput.addEventListener('input', render);
btnClearSearch.addEventListener('click', ()=>{ searchInput.value=''; render(); searchInput.focus(); });
filterStatus.addEventListener('change', render);
sortBy.addEventListener('change', render);

/* new ticket button */
btnNewTicket.addEventListener('click', ()=>{ qs('#name').focus(); window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'}) });

/* export / import */
btnExport.addEventListener('click', ()=>{
  const data = JSON.stringify(tickets, null, 2);
  const blob = new Blob([data], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'supportdesk_tickets.json';
  a.click();
  URL.revokeObjectURL(url);
});

btnImport.addEventListener('click', ()=> fileInput.click());
fileInput.addEventListener('change', (e)=>{
  const f = e.target.files && e.target.files[0];
  if(!f) return;
  const reader = new FileReader();
  reader.onload = ()=>{
    try{
      const json = JSON.parse(reader.result);
      if(!Array.isArray(json)) throw new Error('invalid JSON format');
      tickets = json.concat(tickets);
      saveTickets(tickets);
      render();
      alert('Imported ' + json.length + ' tickets.');
    }catch(err){ alert('Failed to import: ' + err.message) }
  };
  reader.readAsText(f);
  fileInput.value='';
});

/* keyboard */
window.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') modal.classList.remove('show') });

/* init - run after DOM is ready */
function init(){
  // re-query DOM elements in case script is loaded before DOM
  // (qs uses document.querySelector)
  // If critical elements are missing, abort silently.
  try{ render(); }catch(e){ /* if DOM not ready, ignore */ }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// export a default no-op so module imports don't fail in React/Vite setups
export default null;
