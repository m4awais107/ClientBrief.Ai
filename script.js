// ===== Storage helpers =====
const HISTORY_KEY = 'clientbrief_history';
let currentBrief = null; // { data, meta } for whatever is currently shown

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

function saveToHistory(entry) {
  const history = getHistory();
  history.unshift(entry);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 10)));
}

function updateBriefCounter() {
  const count = getHistory().length + 1;
  const el = document.getElementById('nextBriefNumber');
  if (el) el.textContent = String(count).padStart(3, '0');
}

// ===== Sample data =====
const SAMPLE = {
  businessName: "Noor's Closet",
  businessType: "Fashion & Clothing",
  products: "Hand-stitched unstitched lawn suits and stitched party wear, around 20 SKUs, new seasonal drops every 2 months.",
  audience: "Women aged 20-35 in Karachi and Lahore who currently discover and buy through Instagram.",
  budget: "PKR 70,000 – 150,000",
  features: [
    "Online payments (JazzCash / Easypaisa / cards)",
    "Product variations (size, color, etc.)",
    "Coupons & discount codes",
    "Live chat / WhatsApp button"
  ],
  style: "Elegant, minimal, soft pastel tones with a modern feel",
  timeline: "2–4 weeks",
  notes: "She currently only sells over WhatsApp and Instagram DMs and wants an easier way to take orders."
};

function fillSample() {
  document.getElementById('businessName').value = SAMPLE.businessName;
  document.getElementById('businessType').value = SAMPLE.businessType;
  document.getElementById('products').value = SAMPLE.products;
  document.getElementById('audience').value = SAMPLE.audience;
  document.getElementById('budget').value = SAMPLE.budget;
  document.getElementById('style').value = SAMPLE.style;
  document.getElementById('timeline').value = SAMPLE.timeline;
  document.getElementById('notes').value = SAMPLE.notes;
  document.querySelectorAll('.checkgrid input[type=checkbox]').forEach(cb => {
    cb.checked = SAMPLE.features.includes(cb.value);
  });
  document.getElementById('form').scrollIntoView({ behavior: 'smooth' });
}

// ===== Rendering the ticket result =====
function renderBrief(data, meta) {
  currentBrief = { data, meta };
  const el = document.getElementById('ticketResult');

  const pagesHtml = (data.pages || []).map(p => `<li>${escapeHtml(p)}</li>`).join('');
  const featuresHtml = (data.features || []).map(f => `
    <div class="tr__feature">
      <b>${escapeHtml(f.name || '')}</b>
      <span>${escapeHtml(f.reason || '')}</span>
    </div>`).join('');
  const timelineHtml = (data.timeline || []).map(t => `
    <div class="tr__feature">
      <b>${escapeHtml(t.phase || '')}</b>
      <span>${escapeHtml(t.detail || '')}</span>
    </div>`).join('');
  const nextStepsHtml = (data.nextSteps || []).map(n => `<li>${escapeHtml(n)}</li>`).join('');

  el.innerHTML = `
    <div class="tr__head">
      <div class="tr__eyebrow">BRIEF NO. ${meta.number} — GENERATED ${meta.date}</div>
      <h2 class="tr__title">${escapeHtml(meta.businessName)}</h2>
      <div class="tr__meta">
        <span>${escapeHtml(meta.businessType)}</span>
        <span>${escapeHtml(meta.budget)}</span>
        <span>${escapeHtml(meta.timeline)}</span>
      </div>
    </div>
    <div class="tr__section">
      <h3>Project overview</h3>
      <p>${escapeHtml(data.overview || '')}</p>
    </div>
    <div class="tr__section">
      <h3>Target audience</h3>
      <p>${escapeHtml(data.audience || '')}</p>
    </div>
    <div class="tr__section">
      <h3>Recommended pages</h3>
      <ul>${pagesHtml}</ul>
    </div>
    <div class="tr__section">
      <h3>Recommended features &amp; plugins</h3>
      ${featuresHtml}
    </div>
    <div class="tr__section">
      <h3>Budget tier</h3>
      <p>${escapeHtml(data.budgetTier || '')}</p>
    </div>
    <div class="tr__section">
      <h3>Suggested timeline</h3>
      ${timelineHtml}
    </div>
    <div class="tr__section">
      <h3>Next steps</h3>
      <ul>${nextStepsHtml}</ul>
    </div>
  `;

  document.getElementById('resultWrap').hidden = false;
  document.getElementById('resultWrap').scrollIntoView({ behavior: 'smooth' });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}

function briefToText(data, meta) {
  const lines = [];
  lines.push(`BRIEF NO. ${meta.number} — ${meta.businessName}`);
  lines.push(`Generated ${meta.date} · ${meta.businessType} · ${meta.budget} · ${meta.timeline}`);
  lines.push('');
  lines.push('PROJECT OVERVIEW');
  lines.push(data.overview || '');
  lines.push('');
  lines.push('TARGET AUDIENCE');
  lines.push(data.audience || '');
  lines.push('');
  lines.push('RECOMMENDED PAGES');
  (data.pages || []).forEach(p => lines.push(`- ${p}`));
  lines.push('');
  lines.push('RECOMMENDED FEATURES & PLUGINS');
  (data.features || []).forEach(f => lines.push(`- ${f.name}: ${f.reason}`));
  lines.push('');
  lines.push('BUDGET TIER');
  lines.push(data.budgetTier || '');
  lines.push('');
  lines.push('SUGGESTED TIMELINE');
  (data.timeline || []).forEach(t => lines.push(`- ${t.phase}: ${t.detail}`));
  lines.push('');
  lines.push('NEXT STEPS');
  (data.nextSteps || []).forEach(n => lines.push(`- ${n}`));
  return lines.join('\n');
}

// ===== History rendering =====
function renderHistory() {
  const history = getHistory();
  const section = document.getElementById('historySection');
  const list = document.getElementById('historyList');
  if (!history.length) { section.hidden = true; return; }
  section.hidden = false;
  list.innerHTML = history.map((h, i) => `
    <li data-index="${i}">
      <span class="h-name">${escapeHtml(h.meta.businessName)}</span>
      <span class="h-date">${escapeHtml(h.meta.date)}</span>
    </li>
  `).join('');
  [...list.children].forEach(li => {
    li.addEventListener('click', () => {
      const entry = history[Number(li.dataset.index)];
      renderBrief(entry.data, entry.meta);
    });
  });
}

// ===== Form submit =====
async function handleSubmit(e) {
  e.preventDefault();
  const errorEl = document.getElementById('formError');
  errorEl.hidden = true;

  const businessType = document.getElementById('businessType').value === 'Other'
    ? (document.getElementById('otherType').value || 'Other')
    : document.getElementById('businessType').value;

  const payload = {
    businessName: document.getElementById('businessName').value.trim(),
    businessType,
    products: document.getElementById('products').value.trim(),
    audience: document.getElementById('audience').value.trim(),
    budget: document.getElementById('budget').value,
    features: [...document.querySelectorAll('.checkgrid input:checked')].map(c => c.value),
    style: document.getElementById('style').value.trim(),
    timeline: document.getElementById('timeline').value,
    notes: document.getElementById('notes').value.trim()
  };

  if (!payload.businessName || !payload.businessType || !payload.products || !payload.budget || !payload.timeline) {
    errorEl.textContent = 'Please fill in the required fields (business name, type, offering, budget, timeline).';
    errorEl.hidden = false;
    return;
  }

  const btn = document.getElementById('generateBtn');
  btn.disabled = true;
  btn.querySelector('.btn__label').textContent = 'Printing your brief…';

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.error || 'Something went wrong.');
    }

    const meta = {
      number: String(getHistory().length + 1).padStart(3, '0'),
      businessName: payload.businessName,
      businessType: payload.businessType,
      budget: payload.budget,
      timeline: payload.timeline,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    renderBrief(json.brief, meta);
    saveToHistory({ data: json.brief, meta });
    renderHistory();
    updateBriefCounter();
  } catch (err) {
    errorEl.textContent = 'Could not generate the brief — ' + err.message;
    errorEl.hidden = false;
  } finally {
    btn.disabled = false;
    btn.querySelector('.btn__label').textContent = 'Generate brief →';
  }
}

// ===== Wiring =====
document.getElementById('businessType').addEventListener('change', (e) => {
  document.getElementById('otherTypeWrap').hidden = e.target.value !== 'Other';
});

document.getElementById('briefForm').addEventListener('submit', handleSubmit);
document.getElementById('sampleBtn').addEventListener('click', fillSample);

document.getElementById('newBriefBtn').addEventListener('click', () => {
  document.getElementById('resultWrap').hidden = true;
  document.getElementById('briefForm').reset();
  document.getElementById('form').scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('clearHistoryBtn').addEventListener('click', () => {
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
  updateBriefCounter();
});

document.getElementById('copyBtn').addEventListener('click', () => {
  if (!currentBrief) return;
  const text = briefToText(currentBrief.data, currentBrief.meta);
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('copyBtn');
    const original = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = original; }, 1500);
  });
});

document.getElementById('downloadBtn').addEventListener('click', () => {
  if (!currentBrief) return;
  const text = briefToText(currentBrief.data, currentBrief.meta);
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `brief-${currentBrief.meta.businessName.replace(/\s+/g, '-').toLowerCase()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
});

// ===== Init =====
updateBriefCounter();
renderHistory();
