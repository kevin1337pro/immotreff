const properties=[
{id:1,title:'Freistehende Villa mit Garten & Doppelgarage',city:'Oberhausen',district:'Klosterhardt',type:'Haus',price:629000,rooms:3,area:176,coords:[51.516,6.894],image:'https://www.immostaff.de/wp-content/uploads/2025/02/Vorderansicht-1024x670.jpg',url:'https://www.immostaff.de/property/highlight-freistehende-walmdach-villa-in-premiumlage-von-oberhausen-mit-schoenem-grundstueck-doppelgarage/'},
{id:2,title:'Reiheneckhaus mit großem Garten',city:'Bottrop',district:'Fuhlenbrock',type:'Haus',price:265000,rooms:2.5,area:66,coords:[51.526,6.891],image:'https://www.immostaff.de/wp-content/uploads/2024/09/Seitenansicht-Reiheneckhaus-scaled.jpg',url:'https://www.immostaff.de/property/bottrop-fuhlenbrock-immobilienmakler-reiheneckhaus-mit-84-m%C2%B2-nutzbare-flaeche-353-m%C2%B2-grundstueck-grossem-garten-2-garagen/'},
{id:3,title:'Großzügige Wohnung mit Loggia',city:'Bottrop',district:'Stadtmitte',type:'Wohnung',price:189000,rooms:4.5,area:120,coords:[51.523,6.929],image:'https://www.immostaff.de/wp-content/uploads/2024/06/Loggia-Ansicht-2-scaled.jpg',url:'https://www.immostaff.de/property/bottrop-erdgeschosswohnung-120m%C2%B2-riesen-loggia-eigentumswohnung-in-bottrop-stadtmitte-mit-tiefgaragenstellplatz-zu-verkaufen/'},
{id:4,title:'Ein- bis Zweifamilienhaus mit Garten',city:'Bottrop',district:'Batenbrock / Boy',type:'Haus',price:395000,rooms:5,area:155,coords:[51.527,6.958],image:'https://www.immostaff.de/wp-content/uploads/2026/07/Vorderansicht.png',url:'https://www.immostaff.de/property/gepflegtes-ein-zweifamilienhaus-mit-grossem-garten-vielseitigen-nutzungsmoeglichkeiten-in-bottrop/'},
{id:5,title:'Erdgeschosswohnung mit Sonnen-Loggia',city:'Bottrop',district:'Kirchhellen',type:'Wohnung',price:239000,rooms:3.5,area:95,coords:[51.622,6.927],image:'https://www.immostaff.de/wp-content/uploads/2024/06/ETW-in-Bottrop-Kirchhellen-scaled.jpg',url:'https://www.immostaff.de/property/bottrop-kirchhellen-immobilienmakler-erdgeschosswohnung-in-kirchhellen-95m%C2%B2-wohnflaeche-sonnen-loggia-pkw-garage-alles-da-alles-nah/'}];
const $ = selector => document.querySelector(selector);
const icons = {
  pin: '<svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  rooms: '<svg class="icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 20V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14M3 14h18M8 14V9h8v5M3 20h18"/></svg>',
  area: '<svg class="icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5M4 4l6 6M20 4l-6 6M20 20l-6-6M4 20l6-6"/></svg>',
  heart: '<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.9a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.3 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>',
  arrow: '<svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>'
};
let mode = 'Kaufen', savedOnly = false, markers = [];
let saved = [];
try {
  const stored = JSON.parse(localStorage.getItem('immotreff-saved') || '[]');
  if (Array.isArray(stored)) saved = stored.filter(id => properties.some(p => p.id === id));
} catch (_) { /* The search remains usable without local storage. */ }
const money = n => new Intl.NumberFormat('de-DE').format(n) + ' €';
const normalize = value => value.toLocaleLowerCase('de').replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss').replace(/ae/g, 'a').replace(/oe/g, 'o').replace(/ue/g, 'u').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
let map;
if (window.L) {
  map = L.map('map', { zoomControl: false, scrollWheelZoom: false }).setView([51.54, 6.925], 11);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; CARTO', maxZoom: 19 }).addTo(map);
  L.control.zoom({ position: 'topright' }).addTo(map);
}
function updateSaved() {
  try { localStorage.setItem('immotreff-saved', JSON.stringify(saved)); } catch (_) { /* Search remains usable without storage. */ }
  $('#savedCount').textContent = saved.length;
  $('#savedButton').setAttribute('aria-pressed', String(savedOnly));
  $('#savedButton').classList.toggle('is-active', savedOnly);
}
function updateModes() {
  document.querySelectorAll('[data-mode]').forEach(button => {
    const selected = button.dataset.mode === mode;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}
function reset() {
  ['location', 'type', 'price', 'rooms'].forEach(id => { $('#' + id).value = ''; });
  mode = 'Kaufen';
  savedOnly = false;
  updateModes();
  render();
}
function emptyState() {
  if (mode === 'Mieten') return '<div class="empty"><strong>Aktuell keine Mietangebote.</strong><p>Entdecken Sie unsere Kaufangebote oder schauen Sie später wieder vorbei.</p><button id="reset">Kaufangebote entdecken</button></div>';
  if (savedOnly && saved.length === 0) return '<div class="empty"><strong>Ihre Merkliste ist noch leer.</strong><p>Tippen Sie bei einer Immobilie auf das Herz, um sie hier zu speichern.</p><button id="reset">Immobilien entdecken</button></div>';
  return '<div class="empty"><strong>Keine Immobilien gefunden.</strong><p>Versuchen Sie es mit einem anderen Ort oder erweitern Sie Ihre Suchkriterien.</p><button id="reset">Filter zurücksetzen</button></div>';
}
function render() {
  updateSaved();
  const terms = normalize($('#location').value).split(/\s+/).filter(Boolean);
  const type = $('#type').value, price = Number($('#price').value), rooms = Number($('#rooms').value);
  const result = properties.filter(p => {
    const searchable = normalize(`${p.city} ${p.district} ${p.title} ${p.type}`);
    return mode === 'Kaufen' && (!savedOnly || saved.includes(p.id)) && terms.every(term => searchable.includes(term)) && (!type || p.type === type) && (!price || p.price <= price) && (!rooms || p.rooms >= rooms);
  });
  $('#resultCount').textContent = result.length + ' ' + (result.length === 1 ? 'Immobilie' : 'Immobilien');
  $('#cards').innerHTML = result.length ? result.map(p => {
    const isSaved = saved.includes(p.id);
    return `<article class="property-card" data-id="${p.id}"><div class="card-image" style="background-image:url('${p.image}')"><span class="badge">${p.type.toUpperCase()} · KAUFEN</span><button class="heart ${isSaved ? 'on' : ''}" data-save="${p.id}" aria-label="${isSaved ? 'Aus Merkliste entfernen' : 'Zur Merkliste hinzufügen'}" aria-pressed="${isSaved}">${icons.heart}</button></div><div class="card-body"><div class="card-location">${icons.pin} ${p.city.toUpperCase()} · ${p.district.toUpperCase()}</div><h3>${p.title}</h3><div class="features"><span>${icons.rooms} ${String(p.rooms).replace('.', ',')} Zimmer</span><span>${icons.area} ${p.area} m²</span></div><div class="card-bottom"><div class="price">${money(p.price)}<small>Kaufpreis</small></div><a href="${p.url}" target="_blank" rel="noreferrer">Ansehen ${icons.arrow}</a></div></div></article>`;
  }).join('') : emptyState();
  if (map) {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    result.forEach(p => {
      const marker = L.marker(p.coords, { icon: L.divIcon({ className: '', html: `<div class="map-pin">${money(p.price)}</div>`, iconSize: [90, 35], iconAnchor: [45, 17] }) }).addTo(map);
      marker.bindPopup(`<strong>${p.title}</strong><br>${p.city} · ${p.district}<br><small>Ungefähre Stadtteillage</small><br><a href="${p.url}" target="_blank" rel="noreferrer">Zum Exposé ↗</a>`);
      marker.on('click', () => {
        document.querySelectorAll('.property-card').forEach(card => card.classList.toggle('focused', Number(card.dataset.id) === p.id));
        if (window.matchMedia('(min-width: 769px)').matches) document.querySelector(`[data-id="${p.id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
      markers.push(marker);
    });
    if (result.length) map.fitBounds(L.latLngBounds(result.map(p => p.coords)), { padding: [60, 60], maxZoom: 13 });
  }
}
document.addEventListener('click', event => {
  const save = event.target.closest('[data-save]');
  if (save) {
    const id = Number(save.dataset.save);
    saved = saved.includes(id) ? saved.filter(item => item !== id) : [...saved, id];
    render();
  }
  if (event.target.closest('#reset')) reset();
});
document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => {
  mode = button.dataset.mode;
  updateModes();
  render();
}));
$('#searchButton').addEventListener('click', () => { render(); $('#angebote').scrollIntoView({ behavior: 'smooth' }); });
['type', 'price', 'rooms'].forEach(id => $('#' + id).addEventListener('change', render));
$('#location').addEventListener('input', render);
$('#location').addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); $('#searchButton').click(); } });
$('#savedButton').addEventListener('click', () => { savedOnly = !savedOnly; render(); $('#angebote').scrollIntoView({ behavior: 'smooth' }); });
document.querySelectorAll('[data-view]').forEach(button => {
  button.setAttribute('aria-pressed', String(button.classList.contains('view-active')));
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-view]').forEach(item => {
      const selected = item === button;
      item.classList.toggle('view-active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    const list = button.dataset.view === 'list';
    $('#mapWrap').style.display = list ? 'none' : '';
    $('#explore').style.gridTemplateColumns = list ? '1fr' : '';
    const mapJump = $('.map-jump');
    if (mapJump) mapJump.hidden = list;
    if (!list && map) setTimeout(() => map.invalidateSize(), 50);
  });
});
updateModes();
render();
