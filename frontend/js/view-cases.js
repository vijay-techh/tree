console.log("View Cases JS loaded");

let allLeads = [];
let filteredLeads = [];
let currentPage = 1;
const paginationEl = document.getElementById("pagination");
const tbody = document.querySelector("#leadsTable tbody");
const searchInput = document.getElementById("searchInput");
const filterStage = document.getElementById("filterStage");
const rowsPerPageSelect = document.getElementById("rowsPerPage");
const refreshBtn = document.getElementById("refreshBtn");
const emptyState = document.getElementById("emptyState");

async function fetchLeads() {
  try {
    const res = await fetch("/api/leads");
    const leads = await res.json();
    allLeads = Array.isArray(leads) ? leads : [];
    // default filtered set
    filteredLeads = allLeads.slice();
    populateStageFilter();
    renderTable();
  } catch (err) {
    console.error("Error loading leads:", err);
  }
}

function populateStageFilter() {
  if (!filterStage) return;
  const stages = new Set(allLeads.map(l => l.data?.loanStage).filter(Boolean));
  // clear except first option
  filterStage.querySelectorAll('option:not(:first-child)').forEach(n => n.remove());
  Array.from(stages).sort().forEach(s => {
    const opt = document.createElement('option');
    opt.value = s; opt.textContent = s;
    filterStage.appendChild(opt);
  });
}

function formatDate(ts) {
  if (!ts) return "-";
  const d = new Date(ts);
  if (isNaN(d)) return String(ts);
  return d.toLocaleString();
}

function renderTable() {
  if (!tbody) return;
  const rowsPerPage = Number(rowsPerPageSelect.value) || 10;
  const start = (currentPage - 1) * rowsPerPage;
  const paged = filteredLeads.slice(start, start + rowsPerPage);

  tbody.innerHTML = "";
  if (paged.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');

  paged.forEach(lead => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${lead.loan_id}</td>
      <td>${lead.data?.name || '-'}</td>
      <td>${lead.data?.mobile || '-'}</td>
      <td>${lead.data?.loanAmount || '-'}</td>
      <td>${lead.data?.bankFinance || lead.data?.loanDsa || '-'}</td>
      <td>${lead.data?.loanStage || '-'}</td>
      <td>${formatDate(lead.updatedAt || lead.createdAt)}</td>
      <td class="actions">
        <a href="/used-car-loan.html?loanId=${lead.loan_id}">Edit</a>
        <button data-id="${lead.loan_id}" class="deleteBtn">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  renderPagination(rowsPerPage);
  attachRowHandlers();

  // clicking a table row (outside actions) should open the edit form
  tbody.querySelectorAll('tr').forEach(row => {
    row.addEventListener('click', (e) => {
      if (e.target.closest('.actions')) return; // ignore clicks inside actions cell
      const id = row.querySelector('td')?.textContent?.trim();
      if (id) window.location.href = `/used-car-loan.html?loanId=${id}`;
    });
  });
}

function attachRowHandlers() {
  // view button removed; row-click opens the edit form now
  tbody.querySelectorAll('.deleteBtn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = btn.dataset.id;
      if (!confirm('Delete lead ' + id + '?')) return;
      try {
        const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
        if (res.ok) {
          await fetchLeads();
        } else {
          alert('Delete failed');
        }
      } catch (err) { console.error(err); alert('Delete error'); }
    });
  });
}

function renderPagination(rowsPerPage) {
  if (!paginationEl) return;
  const total = filteredLeads.length;
  const pages = Math.max(1, Math.ceil(total / rowsPerPage));
  paginationEl.innerHTML = '';

  const prev = document.createElement('button'); prev.textContent = 'Prev';
  prev.disabled = currentPage <= 1;
  prev.addEventListener('click', () => { currentPage = Math.max(1, currentPage-1); renderTable(); });
  paginationEl.appendChild(prev);

  const info = document.createElement('div'); info.textContent = `Page ${currentPage} of ${pages} — ${total} leads`;
  paginationEl.appendChild(info);

  const next = document.createElement('button'); next.textContent = 'Next';
  next.disabled = currentPage >= pages;
  next.addEventListener('click', () => { currentPage = Math.min(pages, currentPage+1); renderTable(); });
  paginationEl.appendChild(next);
}

function applyFilters() {
  const q = (searchInput.value || '').trim().toLowerCase();
  const stage = filterStage.value;
  filteredLeads = allLeads.filter(l => {
    const text = `${l.loan_id} ${l.data?.name || ''} ${l.data?.mobile || ''}`.toLowerCase();
    if (q && !text.includes(q)) return false;
    if (stage && l.data?.loanStage !== stage) return false;
    return true;
  });
  currentPage = 1;
  renderTable();
}

// Modal logic
const modalBackdrop = document.getElementById('leadModalBackdrop');
const modalContent = document.getElementById('modalContent');
const closeModalBtn = document.getElementById('closeModal');
function openModal(lead) {
  if (!lead) return;
  modalContent.textContent = JSON.stringify(lead, null, 2);
  modalBackdrop.style.display = 'flex';
}
function closeModal() { modalBackdrop.style.display = 'none'; }
if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', (e) => { if (e.target === modalBackdrop) closeModal(); });

// Events
if (searchInput) searchInput.addEventListener('input', () => { applyFilters(); });
if (filterStage) filterStage.addEventListener('change', () => { applyFilters(); });
if (rowsPerPageSelect) rowsPerPageSelect.addEventListener('change', () => { currentPage = 1; renderTable(); });
if (refreshBtn) refreshBtn.addEventListener('click', () => fetchLeads());

// initial load
fetchLeads();
