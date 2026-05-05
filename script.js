// ============================================================
// NÚMERO DE WHATSAPP
// ============================================================
const WA_NUMERO = '524426321413';

function abrirWA(mensaje) {
  const url = 'https://wa.me/' + WA_NUMERO + '?text=' + encodeURIComponent(mensaje);
  window.open(url, '_blank');
}

// ===== CARRITO =====
let carrito = []; // [{id, nombre, precio, detalle, cant}]
let pasoActual = 1;
let selectedDeliveryZone = '';

const deliveryZones = {
  centro: {
    nombre: 'Centro histórico / zona cercana',
    precio: 35,
    desc: 'Centro Histórico, Álamos, Tecnológico, Carretas y zonas cercanas al primer cuadro.'
  },
  sur: {
    nombre: 'Corregidora / Candiles',
    precio: 50,
    desc: 'Candiles, Tejeda, El Pueblito, Puerta Real y colonias cercanas al sur-poniente.'
  },
  norte: {
    nombre: 'Juriquilla / Antea',
    precio: 55,
    desc: 'Juriquilla, Antea, Jurica, Uptown y zona norte de Querétaro.'
  },
  este: {
    nombre: 'El Refugio / Zibatá',
    precio: 60,
    desc: 'El Refugio, Zibatá, Zakia, La Pradera y zona nororiente.'
  },
  confirmar: {
    nombre: 'Fuera de zona',
    precio: null,
    desc: 'El costo se confirma por WhatsApp según colonia, distancia y horario.'
  }
};

function getSubtotal() {
  return carrito.reduce((s, i) => s + i.precio * i.cant, 0);
}

function getDeliveryCost() {
  const zone = deliveryZones[selectedDeliveryZone];
  return zone && typeof zone.precio === 'number' ? zone.precio : 0;
}

function formatMoney(value) {
  return '$' + value;
}

function getDeliveryText() {
  const zone = deliveryZones[selectedDeliveryZone];
  if (!zone) return 'Envío: por seleccionar';
  return zone.precio === null ? zone.nombre + ' — envío por confirmar' : zone.nombre + ' — ' + formatMoney(zone.precio);
}

function agregarAlCarrito(nombre, precio, emoji, detalle) {
  const existing = carrito.find(i => i.nombre === nombre && i.detalle === detalle);
  if (existing) {
    existing.cant++;
  } else {
    carrito.push({ id: Date.now(), nombre, precio, emoji, detalle, cant: 1 });
  }
  actualizarCarritoUI();
  abrirCarrito();
  // Feedback visual
  const btns = document.querySelectorAll('.btn-agregar, .btn-agregar-paq, .btn-add-order');
  btns.forEach(b => {
    if (b.getAttribute('onclick') && b.getAttribute('onclick').includes(nombre)) {
      const orig = b.textContent;
      b.textContent = '✓ ¡Agregado!';
      b.style.background = '#25D366';
      setTimeout(() => { b.textContent = orig; b.style.background = ''; }, 1200);
    }
  });
}

function quitarDelCarrito(id) {
  carrito = carrito.filter(i => i.id !== id);
  actualizarCarritoUI();
  renderCartItems();
}

function cambiarCantCarrito(id, delta) {
  const item = carrito.find(i => i.id === id);
  if (!item) return;
  item.cant = Math.max(1, item.cant + delta);
  actualizarCarritoUI();
  renderCartItems();
}

function actualizarCarritoUI() {
  const subtotal = getSubtotal();
  const envio = getDeliveryCost();
  const total = subtotal + envio;
  const count = carrito.reduce((s, i) => s + i.cant, 0);
  const badge = document.getElementById('cart-badge');
  badge.textContent = count;
  badge.classList.toggle('visible', count > 0);
  document.getElementById('cart-total-val').textContent = carrito.length ? formatMoney(total) : '$0';
  const shippingNote = document.getElementById('cart-shipping-note');
  if (shippingNote) {
    if (!carrito.length) shippingNote.textContent = 'Selecciona productos para calcular tu pedido.';
    else shippingNote.textContent = 'Subtotal: ' + formatMoney(subtotal) + ' · ' + getDeliveryText();
  }
  document.getElementById('cart-total-wrap').style.display = carrito.length ? 'block' : 'none';
  const btn = document.getElementById('btn-paso-2');
  if (btn) btn.disabled = carrito.length === 0;
}

function renderCartItems() {
  const list = document.getElementById('cart-items-list');
  if (carrito.length === 0) {
    list.innerHTML =
      '<div class="cart-empty">' +
      '<p>Tu carrito está vacío.<br>¡Agrega algo delicioso!</p>' +
      '</div>';
    return;
  }
  list.innerHTML = carrito.map(item =>
    '<div class="cart-item">' +
    (item.emoji ? '<span class="cart-item-emoji">' + item.emoji + '</span>' : '') +
    '<div class="cart-item-info">' +
    '<div class="cart-item-name">' + item.nombre + '</div>' +
    '<div class="cart-item-detail">' + item.detalle + '</div>' +
    '<div class="cart-item-qty">' +
    '<button class="qty-btn" onclick="cambiarCantCarrito(' + item.id + ',-1)">−</button>' +
    '<span class="qty-val">' + item.cant + '</span>' +
    '<button class="qty-btn" onclick="cambiarCantCarrito(' + item.id + ',1)">+</button>' +
    '</div>' +
    '</div>' +
    '<span class="cart-item-price">$' + (item.precio * item.cant) + '</span>' +
    '<button class="cart-item-remove" onclick="quitarDelCarrito(' + item.id + ')" title="Quitar">✕</button>' +
    '</div>'
  ).join('');
}

function abrirCarrito() {
  pasoActual = 1;
  renderCartItems();
  actualizarCarritoUI();
  mostrarPaso(1);
  document.getElementById('cart-drawer').classList.add('open');
  document.getElementById('cart-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function cerrarCarrito() {
  document.getElementById('cart-drawer').classList.remove('open');
  document.getElementById('cart-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function mostrarPaso(n) {
  pasoActual = n;
  [1,2,3].forEach(i => {
    document.getElementById('cart-step-' + i).style.display = i === n ? 'block' : 'none';
    const tab = document.getElementById('step-tab-' + i);
    tab.classList.remove('active','done');
    if (i === n) tab.classList.add('active');
    else if (i < n) tab.classList.add('done');
  });
  const footer = document.getElementById('cart-footer');
  if (n === 1) {
    footer.innerHTML =
      '<button class="btn-cart-next" id="btn-paso-2" onclick="irPaso2()" ' + (carrito.length === 0 ? 'disabled' : '') + '>Ver resumen y datos →</button>';
  } else if (n === 2) {
    footer.innerHTML =
      '<button class="btn-cart-next" onclick="mostrarPaso(1)">← Volver al carrito</button>' +
      '<button class="btn-cart-wa" onclick="enviarPedidoWA()">Confirmar por WhatsApp</button>';
  } else {
    footer.innerHTML =
      '<button class="btn-cart-next" onclick="cerrarCarrito()">Cerrar</button>';
  }
}

function irPaso2() {
  if (carrito.length === 0) return;
  // Render resumen mini
  const subtotal = getSubtotal();
  const envio = getDeliveryCost();
  const total = subtotal + envio;
  const resumen = document.getElementById('cart-resumen-mini');
  resumen.innerHTML =
    '<div class="cart-resumen-title">Tu pedido</div>' +
    carrito.map(i =>
      '<div class="cart-resumen-item">' + i.nombre + ' x' + i.cant + ' — ' + formatMoney(i.precio * i.cant) + '</div>'
    ).join('') +
    '<div class="cart-resumen-item">Subtotal: ' + formatMoney(subtotal) + '</div>' +
    '<div class="cart-resumen-item">' + getDeliveryText() + '</div>' +
    '<div class="cart-resumen-item" style="font-weight:800;color:var(--rojo);border:none;margin-top:0.3rem;">Total: ' + (deliveryZones[selectedDeliveryZone]?.precio === null ? formatMoney(subtotal) + ' + envío por confirmar' : formatMoney(total)) + '</div>';
  mostrarPaso(2);
}

function enviarPedidoWA() {
  const nombre   = document.getElementById('cart-nombre').value.trim();
  const telefono = document.getElementById('cart-telefono').value.trim();
  const direccion= document.getElementById('cart-direccion').value.trim();
  const hora     = document.getElementById('cart-hora').value.trim();
  const nota     = document.getElementById('cart-nota').value.trim();

  if (!nombre) { alert('Por favor ingresa tu nombre'); document.getElementById('cart-nombre').focus(); return; }
  if (!telefono) { alert('Por favor ingresa tu WhatsApp'); document.getElementById('cart-telefono').focus(); return; }
  if (!selectedDeliveryZone) { alert('Por favor elige tu zona de envío'); document.getElementById('cart-zona-envio').focus(); return; }
  if (!direccion) { alert('Por favor ingresa tu dirección'); document.getElementById('cart-direccion').focus(); return; }

  const subtotal = getSubtotal();
  const envio = getDeliveryCost();
  const total = subtotal + envio;
  const zone = deliveryZones[selectedDeliveryZone];
  const totalText = zone.precio === null ? formatMoney(subtotal) + ' + envío por confirmar' : formatMoney(total);
  const items = carrito.map(i => '   • ' + i.nombre + ' x' + i.cant + ' = ' + formatMoney(i.precio * i.cant)).join('\n');

  let mensaje =
    '*Nuevo Pedido — Aguachiles Alchile*\n\n' +
    '*Nombre:* ' + nombre + '\n' +
    '*WhatsApp:* ' + telefono + '\n' +
    '*Zona de envío:* ' + getDeliveryText() + '\n' +
    '*Dirección:* ' + direccion + '\n';
  if (hora)    mensaje += '*Entrega:* ' + hora + '\n';
  if (nota)    mensaje += '*Nota:* ' + nota + '\n';
  mensaje +=
    '\n*Pedido:*\n' + items + '\n\n' +
    '*Subtotal:* ' + formatMoney(subtotal) + '\n' +
    '*Envío:* ' + (zone.precio === null ? 'Por confirmar' : formatMoney(envio)) + '\n' +
    '*Total:* ' + totalText + '\n\n' +
    'Hola, quisiera confirmar este pedido.';

  abrirWA(mensaje);
  carrito = [];
  actualizarCarritoUI();
  mostrarPaso(3);
}

// ===== ARMADOR =====
const preciosAguachile = {
  Negro: 150,
  Rojo: 140,
  Verde: 140,
  Ceniza: 160
};

let state = { marisco:'Camarón', precio:0, tipo:'', tipoClass:'', picante:'Sin picante', extras:[], cant:1 };

const picanteData = [
  { label:'Sin picante — tranquilo', color:'#2DC653', chiles:0 },
  { label:'Poco picante 🌶️', color:'#8BC34A', chiles:1 },
  { label:'Picante medio 🌶️🌶️', color:'#FFB300', chiles:2 },
  { label:'Bien picante 🔥', color:'#E63946', chiles:3 },
  { label:'Máximo 💀 — solo para valientes', color:'#7B0000', chiles:4 },
];

function updatePicante(val) {
  const d = picanteData[val];
  state.picante = d.label;
  document.getElementById('picante-label').textContent = d.label;
  document.getElementById('picante-label').style.color = d.color;
  const pct = (val / 4) * 100;
  document.getElementById('picante-fill').style.width = pct + '%';
  const dots = document.querySelectorAll('.chile-dot');
  dots.forEach((dot, i) => { dot.classList.toggle('on', i < d.chiles); });
  document.querySelector('.picante-meter').style.borderColor = d.color + '55';
  updateBowl();
}

function selTipo(btn, nombre, _ic, cls) {
  document.querySelectorAll('#tipo-opts .opt-btn').forEach(b => {
    b.classList.remove('selected','selected-verde','selected-negro','selected-rojo');
  });
  btn.classList.add('selected-' + cls);
  state.tipo = nombre; state.tipoClass = 't-' + cls;
  state.precio = preciosAguachile[nombre] || 0;
  updateBowl();
}

function toggleExtra(btn, nombre) {
  const idx = state.extras.indexOf(nombre);
  if (idx === -1) { state.extras.push(nombre); btn.classList.add('si'); }
  else { state.extras.splice(idx,1); btn.classList.remove('si'); }
  updateBowl();
}

function cambiarCant(d) {
  state.cant = Math.max(1, state.cant + d);
  document.getElementById('cant-num').textContent = state.cant;
  updateBowl();
}

function updateBowl() {
  const bowl = document.getElementById('bowl-card');
  const nombre = 'Camarón' + (state.tipo ? ' ' + state.tipo : '');
  document.getElementById('bowl-name').textContent = nombre;
  const tagsEl = document.getElementById('bowl-tags');
  tagsEl.innerHTML = '';
  if (!state.tipo && !state.extras.length) {
    tagsEl.innerHTML = '<span class="bowl-empty">Elige tu estilo</span>';
  } else {
    if (state.tipo) { const t = document.createElement('span'); t.className='bowl-tag '+state.tipoClass; t.textContent=state.tipo; tagsEl.appendChild(t); }
    if (state.picante && state.picante !== 'Sin picante') { const t = document.createElement('span'); t.className='bowl-tag t-rojo'; t.textContent=state.picante.split('—')[0].trim(); tagsEl.appendChild(t); }
    state.extras.forEach(e => { const t = document.createElement('span'); t.className='bowl-tag'; t.textContent=e; tagsEl.appendChild(t); });
  }
  const total = state.precio * state.cant;
  document.getElementById('bowl-price').textContent = total > 0 ? '$' + total + ' + envío (' + state.cant + ' porción' + (state.cant>1?'es':'') + ')' : '$—';
  const gradients = { negro:'linear-gradient(135deg,#e8e8e830,#d0d0d020)', rojo:'linear-gradient(135deg,#FDECEA,#F8BBD0)', verde:'linear-gradient(135deg,#E8F5E9,#C8E6C9)', mar:'linear-gradient(135deg,#FFF9C4,#FFF176)' };
  bowl.style.background = gradients[state.tipoClass.replace('t-','')] || 'linear-gradient(135deg,#E0F7FA,#B2EBF2)';
}

// Agregar armador al carrito
function irAPedido() {
  if (!state.tipo) { alert('Elige el tipo de aguachile primero'); return; }
  const extras = state.extras.length ? ' · ' + state.extras.join(', ') : '';
  const detalle = state.tipo + ' · ' + state.picante.split('—')[0].trim() + extras;
  for (let i = 0; i < state.cant; i++) {
    agregarAlCarrito('Camarón ' + state.tipo, state.precio, '🦐', detalle);
  }
}

// Pedir paquete directo (sin carrito)
function irAPedidoPaquete(nombre) {
  const mensaje =
    '*Pedido de Paquete - Aguachiles Alchile*\n\n' +
    '*Paquete:* ' + nombre + '\n\n' +
    'Hola, quisiera pedir este paquete. ¿Me pueden dar más info?';
  abrirWA(mensaje);
}

// ===== MAPA DE ENVIO =====
function selectDeliveryZone(zoneKey) {
  selectedDeliveryZone = zoneKey || '';
  const zone = deliveryZones[selectedDeliveryZone];

  document.querySelectorAll('.zone').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.zone === selectedDeliveryZone);
  });

  ['cart-zona-envio', 'inp-zona-envio'].forEach(id => {
    const select = document.getElementById(id);
    if (select && select.value !== selectedDeliveryZone) select.value = selectedDeliveryZone;
  });

  const nameEl = document.getElementById('delivery-zone-name');
  const descEl = document.getElementById('delivery-zone-desc');
  const priceEl = document.getElementById('delivery-zone-price');
  if (nameEl && descEl && priceEl) {
    nameEl.textContent = zone ? zone.nombre : 'Sin seleccionar';
    descEl.textContent = zone ? zone.desc : 'Elige una zona del mapa para marcar el cobro de envío en tu pedido.';
    priceEl.textContent = zone ? (zone.precio === null ? 'Confirmar' : formatMoney(zone.precio)) : '$—';
  }

  actualizarCarritoUI();
}

// ===== FORMULARIO RÁPIDO → WHATSAPP =====
function handleOrder(e) {
  e.preventDefault();
  const nombre    = document.getElementById('inp-nombre').value.trim();
  const telefono  = document.getElementById('inp-telefono').value.trim();
  const producto  = document.getElementById('inp-producto').value;
  const porciones = document.getElementById('inp-porciones').value;
  const zonaEnvio = document.getElementById('inp-zona-envio').value;
  const direccion = document.getElementById('inp-direccion').value.trim();
  const zone = deliveryZones[zonaEnvio];

  if (!zonaEnvio) { alert('Por favor elige tu zona de envío'); document.getElementById('inp-zona-envio').focus(); return; }
  selectDeliveryZone(zonaEnvio);

  const mensaje =
    '*Nuevo Pedido - Aguachiles Alchile*\n\n' +
    '*Nombre:* ' + nombre + '\n' +
    '*Teléfono:* ' + telefono + '\n' +
    '*Pedido:* ' + producto + '\n' +
    '*Porciones:* ' + porciones + '\n' +
    '*Zona de envío:* ' + (zone ? getDeliveryText() : 'Por confirmar') + '\n' +
    '*Dirección:* ' + (direccion || 'Por confirmar') + '\n\n' +
    'Hola, quisiera confirmar este pedido.';

  abrirWA(mensaje);
  document.getElementById('orderForm').style.display = 'none';
  document.getElementById('successMsg').style.display = 'block';
}

// Init
renderCartItems();
actualizarCarritoUI();

