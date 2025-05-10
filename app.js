// Variables globales
let productos = [];
let categorias = [];
let mesasActivas = new Map(); // Almacena las órdenes por mesa
let mesaSeleccionada = null; // Mesa actualmente seleccionada
let ordenesCocina = new Map(); // Almacena las órdenes enviadas a cocina
let clientes = []; // Almacena los clientes frecuentes
let tipoPedidoActual = null; // 'domicilio' o 'recoger'
let contadorDomicilios = 0; // Contador de pedidos a domicilio
let contadorRecoger = 0; // Contador de pedidos para recoger
let historialVentas = []; // Almacena el historial de ventas
let historialCocina = []; // Almacena el historial de órdenes de cocina

// Variable global para la ventana de impresión
let ventanaImpresion = null;

// Función para guardar productos en localStorage
function guardarProductos() {
  localStorage.setItem('productos', JSON.stringify(productos));
}

// Función para guardar clientes en localStorage
function guardarClientes() {
  localStorage.setItem('clientes', JSON.stringify(clientes));
}

// Función para guardar contadores en localStorage
function guardarContadores() {
  localStorage.setItem('contadorDomicilios', contadorDomicilios);
  localStorage.setItem('contadorRecoger', contadorRecoger);
}

// Función para guardar historial de ventas
function guardarHistorialVentas() {
  try {
    // Asegurarse de que historialVentas sea un array
    if (!Array.isArray(historialVentas)) {
      console.error('historialVentas no es un array:', historialVentas);
      historialVentas = [];
    }
    
    // Guardar en localStorage
    localStorage.setItem('historialVentas', JSON.stringify(historialVentas));
    console.log('Historial de ventas guardado:', historialVentas);
    
    // Verificar que se guardó correctamente
    const guardado = localStorage.getItem('historialVentas');
    console.log('Verificación de guardado:', guardado);
  } catch (error) {
    console.error('Error al guardar historial de ventas:', error);
  }
}

// Función para guardar historial de cocina
function guardarHistorialCocina() {
  // Guardar todo el historial de cocina
  localStorage.setItem('historialCocina', JSON.stringify(historialCocina));
}

// Función para cargar datos desde localStorage
function cargarDatos() {
  try {
    const historialVentasGuardado = localStorage.getItem('historialVentas');
    console.log('Datos guardados en localStorage:', historialVentasGuardado);
    
    if (historialVentasGuardado) {
      historialVentas = JSON.parse(historialVentasGuardado);
      console.log('Historial de ventas cargado:', historialVentas);
      
      // Verificar que se cargó correctamente
      if (!Array.isArray(historialVentas)) {
        console.error('Error: historialVentas no es un array después de cargar');
        historialVentas = [];
      }
    } else {
      console.log('No se encontró historial de ventas en localStorage');
      historialVentas = [];
    }
    
    // Cargar otros datos...
    const productosGuardados = localStorage.getItem('productos');
    const categoriasGuardadas = localStorage.getItem('categorias');
    const mesasGuardadas = localStorage.getItem('mesasActivas');
    const ordenesCocinaGuardadas = localStorage.getItem('ordenesCocina');
    const clientesGuardados = localStorage.getItem('clientes');
    const contadorDomiciliosGuardado = localStorage.getItem('contadorDomicilios');
    const contadorRecogerGuardado = localStorage.getItem('contadorRecoger');
    const historialCocinaGuardado = localStorage.getItem('historialCocina');
    
    if (productosGuardados) {
      productos = JSON.parse(productosGuardados);
    }
    
    if (categoriasGuardadas) {
      categorias = JSON.parse(categoriasGuardadas);
    }

    if (mesasGuardadas) {
      mesasActivas = new Map(JSON.parse(mesasGuardadas));
    }

    if (ordenesCocinaGuardadas) {
      ordenesCocina = new Map(JSON.parse(ordenesCocinaGuardadas));
    }

    if (clientesGuardados) {
      clientes = JSON.parse(clientesGuardados);
    }

    if (contadorDomiciliosGuardado) {
      contadorDomicilios = parseInt(contadorDomiciliosGuardado);
    }

    if (contadorRecogerGuardado) {
      contadorRecoger = parseInt(contadorRecogerGuardado);
    }

    if (historialCocinaGuardado) {
      historialCocina = JSON.parse(historialCocinaGuardado);
    }
    
    mostrarProductos();
    actualizarMesasActivas();
  } catch (error) {
    console.error('Error al cargar datos:', error);
  }
}

// Función para guardar el estado de las mesas
function guardarMesas() {
  localStorage.setItem('mesasActivas', JSON.stringify(Array.from(mesasActivas.entries())));
  localStorage.setItem('ordenesCocina', JSON.stringify(Array.from(ordenesCocina.entries())));
}

// Función para actualizar la vista de mesas activas
function actualizarMesasActivas() {
  const container = document.getElementById('mesasContainer');
  container.innerHTML = '';

  mesasActivas.forEach((orden, mesa) => {
    const boton = document.createElement('button');
    
    // Determinar el tipo de botón basado en el ID de la mesa
    if (mesa.startsWith('DOM-')) {
      const numeroDomicilio = mesa.split('-')[1];
      boton.className = `mesa-btn mesa-domicilio ${mesa === mesaSeleccionada ? 'mesa-seleccionada' : ''}`;
      boton.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <i class="fas fa-motorcycle" style="margin-top: -10px; margin-bottom: 5px;"></i>
          <span class="mesa-numero" style="font-size: 1.5rem;">D${parseInt(numeroDomicilio)}</span>
        </div>
      `;
    } else if (mesa.startsWith('REC-')) {
      const numeroRecoger = mesa.split('-')[1];
      boton.className = `mesa-btn mesa-recoger ${mesa === mesaSeleccionada ? 'mesa-seleccionada' : ''}`;
      boton.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <i class="fas fa-shopping-bag" style="margin-top: -10px; margin-bottom: 5px;"></i>
          <span class="mesa-numero" style="font-size: 1.5rem;">R${parseInt(numeroRecoger)}</span>
        </div>
      `;
    } else {
      boton.className = `mesa-btn mesa-activa ${mesa === mesaSeleccionada ? 'mesa-seleccionada' : ''}`;
      boton.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <span class="mesa-numero" style="font-size: 1.5rem;">${mesa}</span>
        </div>
      `;
    }

    boton.onclick = () => seleccionarMesa(mesa);
    container.appendChild(boton);
  });
}

// Función para seleccionar una mesa
function seleccionarMesa(mesa) {
  console.log('Seleccionando mesa:', mesa);
  mesaSeleccionada = mesa;
  document.getElementById('mesaActual').textContent = mesa;
  actualizarMesasActivas();
  actualizarVistaOrden(mesa);
}

// Función para mostrar productos en el panel
function mostrarProductos() {
  const categoriasDiv = document.getElementById('categorias');
  categoriasDiv.innerHTML = '';
  
  if (categorias.length === 0) {
    categoriasDiv.innerHTML = '<p class="text-muted">No hay categorías disponibles</p>';
    return;
  }
  
  categorias.forEach(categoria => {
    const botonCategoria = document.createElement('button');
    botonCategoria.classList.add('btn', 'btn-info', 'mb-2', 'w-100');
    botonCategoria.textContent = categoria;
    botonCategoria.onclick = () => filtrarProductosPorCategoria(categoria);
    categoriasDiv.appendChild(botonCategoria);
  });
}

// Función para filtrar productos por categoría
function filtrarProductosPorCategoria(categoria) {
  const productosFiltrados = productos.filter(p => p.categoria === categoria);
  mostrarProductosFiltrados(productosFiltrados);
}

// Función para formatear precio (sin decimales)
function formatearPrecio(precio) {
  const numero = Math.round(precio);
  return `$ ${formatearNumero(numero)}`;
}

// Función para formatear precio con decimales (para recibos)
function formatearPrecioRecibo(precio) {
  const numero = Math.round(precio);
  return formatearNumero(numero);
}

// Función para mostrar los productos filtrados
function mostrarProductosFiltrados(productosFiltrados) {
  const tablaOrden = document.getElementById('ordenCuerpo');
  tablaOrden.innerHTML = '';
  
  if (productosFiltrados.length === 0) {
    tablaOrden.innerHTML = '<tr><td colspan="3" class="text-center">No hay productos en esta categoría</td></tr>';
    return;
  }
  
  productosFiltrados.forEach(producto => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td style="width: 60%">${producto.nombre}</td>
      <td style="width: 20%"><button class='btn btn-primary btn-sm' onclick='agregarProducto(${producto.id})'>Agregar</button></td>
      <td style="width: 20%">${formatearPrecio(producto.precio)}</td>
    `;
    tablaOrden.appendChild(fila);
  });
}

// Función para agregar producto a la orden
function agregarProducto(id) {
  if (!mesaSeleccionada) {
    alert('Por favor, seleccione una mesa primero');
    return;
  }

  const producto = productos.find(p => p.id === id);
  if (!producto) {
    console.error('Producto no encontrado:', id);
    alert('Producto no encontrado');
    return;
  }

  let pedido = mesasActivas.get(mesaSeleccionada);
  if (!pedido) {
    // Si no existe el pedido, crear uno nuevo
    pedido = {
      items: [],
      estado: 'pendiente',
      fecha: new Date().toLocaleString(),
      ronda: 1 // Inicializar la ronda
    };
    mesasActivas.set(mesaSeleccionada, pedido);
  }

  if (!pedido.items) {
    pedido.items = [];
  }

  // Si hay productos en cocina, incrementar la ronda
  if (pedido.items.some(item => item.estado === 'en_cocina')) {
    pedido.ronda = (pedido.ronda || 1) + 1;
  }

  const productoExistente = pedido.items.find(p => p.id === id && p.estado !== 'en_cocina');

  if (productoExistente) {
    productoExistente.cantidad++;
  } else {
    pedido.items.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: Number(producto.precio),
      cantidad: 1,
      detalles: '',
      estado: 'pendiente',
      ronda: pedido.ronda
    });
  }

  console.log('Producto agregado:', producto);
  console.log('Orden actual:', pedido);
  
  guardarMesas();
  actualizarVistaOrden(mesaSeleccionada);
}

// Función para actualizar la vista de la orden
function actualizarVistaOrden(mesa) {
  console.log('Actualizando vista de orden para mesa:', mesa);
  const ordenCuerpo = document.getElementById('ordenCuerpo');
  ordenCuerpo.innerHTML = '';

  if (!mesasActivas.has(mesa)) {
    console.log('No hay orden para la mesa:', mesa);
    return;
  }

  const pedido = mesasActivas.get(mesa);
  console.log('Orden de la mesa:', pedido);

  // Actualizar el título de la orden con el nombre del cliente si es domicilio o recoger
  const mesaActual = document.getElementById('mesaActual');
  if (mesa.startsWith('DOM-')) {
    const cliente = pedido.cliente || 'Cliente no especificado';
    mesaActual.textContent = `Domicilio - ${cliente}`;
  } else if (mesa.startsWith('REC-')) {
    const cliente = pedido.cliente || 'Cliente no especificado';
    mesaActual.textContent = `Recoger - ${cliente}`;
  } else {
    mesaActual.textContent = mesa;
  }

  if (!pedido.items || pedido.items.length === 0) {
    ordenCuerpo.innerHTML = '<tr><td colspan="6" class="text-center">No hay productos en la orden</td></tr>';
    return;
  }

  // Agrupar productos por ronda
  const productosPorRonda = {};
  pedido.items.forEach(item => {
    if (!productosPorRonda[item.ronda]) {
      productosPorRonda[item.ronda] = [];
    }
    productosPorRonda[item.ronda].push(item);
  });

  // Mostrar productos por ronda
  Object.entries(productosPorRonda).forEach(([ronda, items]) => {
    // Agregar encabezado de ronda
    const filaRonda = document.createElement('tr');
    filaRonda.className = 'table-secondary';
    filaRonda.innerHTML = `
      <td colspan="6" class="text-center">
        <strong>Ronda ${ronda}</strong>
        ${items.some(item => item.estado === 'en_cocina') ? 
          '<span class="badge bg-success ms-2">En Cocina</span>' : ''}
      </td>
    `;
    ordenCuerpo.appendChild(filaRonda);

    // Mostrar productos de esta ronda
    items.forEach(item => {
      const fila = document.createElement('tr');
      fila.className = item.estado === 'en_cocina' ? 'table-success' : '';
      fila.innerHTML = `
        <td style="width: 30%">${item.nombre}</td>
        <td style="width: 12%">
          <div class="input-group input-group-sm">
            <button class="btn btn-outline-light btn-sm px-1" onclick="cambiarCantidad(${item.id}, '${mesa}', -1)">-</button>
            <input type='number' class='form-control form-control-sm bg-dark text-white border-light text-center' 
                   value='${item.cantidad}' min='1'
                   style="width: 40px;"
                   onchange='actualizarCantidad(this, ${item.id}, "${mesa}")' />
            <button class="btn btn-outline-light btn-sm px-1" onclick="cambiarCantidad(${item.id}, '${mesa}', 1)">+</button>
          </div>
        </td>
        <td style="width: 12%">${formatearPrecio(item.precio)}</td>
        <td style="width: 12%">${formatearPrecio(item.precio * item.cantidad)}</td>
        <td style="width: 31%">
          <input type='text' class='form-control form-control-sm bg-dark text-white border-light' 
                 value='${item.detalles || ''}' 
                 placeholder='Ej: Sin lechuga, sin salsa...'
                 onchange='actualizarDetalles(this, ${item.id}, "${mesa}")' />
        </td>
        <td style="width: 3%">
          <button class='btn btn-danger btn-sm' onclick='eliminarProductoOrden(this, "${mesa}")'>
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      ordenCuerpo.appendChild(fila);
    });
  });

  actualizarTotal(mesa);
}

// Función para cambiar cantidad con botones + y -
function cambiarCantidad(id, mesa, cambio) {
  const pedido = mesasActivas.get(mesa);
  if (!pedido || !pedido.items) return;

  const producto = pedido.items.find(p => p.id === id);
  if (producto) {
    const nuevaCantidad = producto.cantidad + cambio;
    if (nuevaCantidad >= 1) {
      producto.cantidad = nuevaCantidad;
      guardarMesas();
      actualizarVistaOrden(mesa);
    }
  }
}

// Función para actualizar cantidad
function actualizarCantidad(input, id, mesa) {
  const cantidad = parseInt(input.value);
  if (isNaN(cantidad) || cantidad < 1) {
    input.value = 1;
    return;
  }

  const pedido = mesasActivas.get(mesa);
  if (!pedido || !pedido.items) return;

  const producto = pedido.items.find(p => p.id === id);
  if (producto) {
    producto.cantidad = cantidad;
    guardarMesas();
    actualizarVistaOrden(mesa);
  }
}

// Función para actualizar detalles del producto
function actualizarDetalles(input, id, mesa) {
  const detalles = input.value.trim();
  const pedido = mesasActivas.get(mesa);
  
  if (!pedido || !pedido.items) return;
  
  const producto = pedido.items.find(p => p.id === id);
  if (producto) {
    producto.detalles = detalles;
    guardarMesas();
  }
}

// Función para eliminar producto de la orden
function eliminarProductoOrden(boton, mesa) {
  const fila = boton.closest('tr');
  const nombreProducto = fila.cells[0].textContent;
  const pedido = mesasActivas.get(mesa);
  
  if (!pedido || !pedido.items) return;
  
  const index = pedido.items.findIndex(p => p.nombre === nombreProducto);
  if (index !== -1) {
    pedido.items.splice(index, 1);
    guardarMesas();
    actualizarVistaOrden(mesa);
  }
}

// Función para actualizar el total
function actualizarTotal(mesa) {
  if (!mesasActivas.has(mesa)) return;

  const pedido = mesasActivas.get(mesa);
  if (!pedido || !pedido.items) return;

  let subtotal = pedido.items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  
  const propina = parseFloat(document.getElementById('propina').value) || 0;
  const descuento = parseFloat(document.getElementById('descuento').value) || 0;
  
  pedido.propina = propina;
  pedido.descuento = descuento;
  
  const propinaMonto = Math.round((subtotal * propina) / 100);
  const total = Math.round(subtotal + propinaMonto - descuento);
  
  document.getElementById('totalOrden').textContent = formatearPrecio(total);
  
  const desglose = document.getElementById('desgloseTotal');
  if (desglose) {
    desglose.innerHTML = `
      <div class="small text-muted">
        <div>Subtotal: ${formatearPrecio(subtotal)}</div>
        <div>Propina (${propina}%): ${formatearPrecio(propinaMonto)}</div>
        <div>Descuento: ${formatearPrecio(descuento)}</div>
      </div>
    `;
  }
  
  guardarMesas();
}

// Función para enviar a cocina
function enviarACocina() {
  if (!mesaSeleccionada || !mesasActivas.has(mesaSeleccionada)) {
    alert('Por favor, seleccione una mesa con productos');
    return;
  }

  const pedido = mesasActivas.get(mesaSeleccionada);
  if (!pedido || !pedido.items || pedido.items.length === 0) {
    alert('No hay productos para enviar a cocina');
    return;
  }

  // Filtrar solo los productos que no han sido enviados a cocina
  const productosNuevos = pedido.items.filter(item => item.estado !== 'en_cocina');
  
  if (productosNuevos.length === 0) {
    alert('No hay nuevos productos para enviar a cocina');
    return;
  }

  // Marcar productos nuevos como enviados a cocina
  productosNuevos.forEach(item => {
    item.estado = 'en_cocina';
  });

  // Guardar orden en cocina
  ordenesCocina.set(mesaSeleccionada, productosNuevos);
  
  // Agregar al historial de cocina
  const ordenCocina = {
    id: Date.now(),
    fecha: new Date().toLocaleString(),
    mesa: mesaSeleccionada,
    items: productosNuevos,
    cliente: pedido.cliente || null,
    telefono: pedido.telefono || null,
    direccion: pedido.direccion || null,
    horaRecoger: pedido.horaRecoger || null,
    ronda: pedido.ronda || 1
  };
  
  historialCocina.push(ordenCocina);
  guardarHistorialCocina();
  guardarMesas();

  // Imprimir ticket de cocina solo con los productos nuevos
  imprimirTicketCocina(mesaSeleccionada, productosNuevos);
}

// Función para generar ticket de cocina
function generarTicketCocina(pedido) {
  const fecha = new Date().toLocaleString();
  let ticket = `
    <div class="ticket-cocina">
      <div class="ticket-header">
        <h2>Ticket de Cocina</h2>
        <p>Fecha: ${fecha}</p>
        <p>Mesa: ${pedido.mesa}</p>
        ${pedido.cliente ? `<p>Cliente: ${pedido.cliente}</p>` : ''}
      </div>
      <div class="ticket-body">
        <table>
          <thead>
            <tr>
              <th>Cant</th>
              <th>Producto</th>
              <th>Detalles</th>
            </tr>
          </thead>
          <tbody>
  `;

  pedido.items.forEach(item => {
    ticket += `
      <tr>
        <td>${item.cantidad}</td>
        <td>${item.nombre}</td>
        <td>${item.detalles || '-'}</td>
      </tr>
    `;
  });

  ticket += `
          </tbody>
        </table>
      </div>
      <div class="ticket-footer">
        <p>Total de productos: ${pedido.items.length}</p>
      </div>
    </div>
  `;

  return ticket;
}

// Función para obtener o crear la ventana de impresión
function obtenerVentanaImpresion() {
  if (!ventanaImpresion || ventanaImpresion.closed) {
    ventanaImpresion = window.open('', 'ventanaImpresion', 'width=400,height=600');
    if (ventanaImpresion) {
      ventanaImpresion.document.write(`
        <html>
          <head>
            <title>Impresión</title>
            <style>
              body { 
                font-family: monospace;
                font-size: 14px;
                width: 80mm;
                margin: 0;
                padding: 2mm;
              }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .mb-1 { margin-bottom: 1px; }
              .mt-1 { margin-top: 1px; }
              .logo-container {
                text-align: center;
                margin-bottom: 5px;
              }
              .logo-container img {
                max-width: 100%;
                max-height: 100px;
                object-fit: contain;
                image-rendering: -webkit-optimize-contrast;
                image-rendering: crisp-edges;
              }
              table { 
                width: 100%;
                border-collapse: collapse;
                margin: 2px 0;
              }
              th, td { 
                padding: 1px;
                text-align: left;
                font-size: 14px;
              }
              .border-top { 
                border-top: 1px dashed #000;
                margin-top: 2px;
                padding-top: 2px;
              }
              .header {
                border-bottom: 1px dashed #000;
                padding-bottom: 2px;
                margin-bottom: 2px;
              }
              .total-row {
                font-weight: bold;
                font-size: 15px;
              }
              .botones-impresion {
                position: fixed;
                top: 10px;
                right: 10px;
                z-index: 1000;
              }
              .botones-impresion button {
                margin-left: 5px;
                padding: 5px 10px;
                background: #007bff;
                color: white;
                border: none;
                border-radius: 3px;
                cursor: pointer;
              }
              .botones-impresion button:hover {
                background: #0056b3;
              }
              @media print {
                .botones-impresion {
                  display: none;
                }
              }
            </style>
          </head>
          <body>
            <div id="contenido"></div>
          </body>
        </html>
      `);
      ventanaImpresion.document.close();
    }
  }
  return ventanaImpresion;
}

// Función para imprimir ticket de cocina
function imprimirTicketCocina(mesa, productos) {
  const ventana = obtenerVentanaImpresion();
  if (!ventana) {
    alert('No se pudo abrir la ventana de impresión. Por favor, verifique que los bloqueadores de ventanas emergentes estén desactivados.');
    return;
  }
  
  // Obtener el pedido completo para acceder a la información del cliente
  const pedidoCompleto = mesasActivas.get(mesa);
  let infoCliente = '';
  
  if (pedidoCompleto && pedidoCompleto.cliente) {
    infoCliente = `
      <div class="cliente-info">
        <div class="cliente-label">Cliente:</div>
        <div class="cliente-datos">
          <strong>${pedidoCompleto.cliente}</strong><br>
          Tel: ${pedidoCompleto.telefono || 'No disponible'}<br>
          ${mesa.startsWith('DOM-') ? 
            `Dir: ${pedidoCompleto.direccion || 'No disponible'}` : 
            `Hora: ${pedidoCompleto.horaRecoger || 'No disponible'}`
          }
        </div>
      </div>
    `;
  }
  
  const contenido = `
    <div class="header text-center">
      <h2 style="margin: 0; font-size: 14px;">COCINA</h2>
      <div class="mb-1">Mesa: ${mesa}</div>
      <div class="mb-1">Ronda: ${pedidoCompleto && pedidoCompleto.ronda ? pedidoCompleto.ronda : 1}</div>
      <div class="mb-1">${new Date().toLocaleString()}</div>
    </div>
    
    ${infoCliente}
    
    <table>
      <thead>
        <tr>
          <th style="width: 20%">Cant</th>
          <th>Producto</th>
        </tr>
      </thead>
      <tbody>
        ${productos.map(item => `
          <tr>
            <td>${item.cantidad}</td>
            <td>
              <div class="producto" style="font-weight: bold; font-size: 16px;">${item.nombre}</div>
              ${item.detalles ? `
                <div class="detalles">
                  <span class="detalle-label">Detalle:</span> ${item.detalles}
                </div>
              ` : ''}
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    <div class="text-center mt-1">
      <div class="border-top">¡Gracias!</div>
    </div>

    <div class="botones-impresion">
      <button onclick="window.print()">Imprimir</button>
      <button onclick="window.close()">Cerrar</button>
    </div>
  `;
  
  ventana.document.getElementById('contenido').innerHTML = contenido;
  ventana.focus();
}

// Función para mostrar el modal de pago
function mostrarModalPago() {
  if (!mesaSeleccionada || !mesasActivas.has(mesaSeleccionada)) {
    alert('Por favor, seleccione una mesa con productos');
    return;
  }

  const pedido = mesasActivas.get(mesaSeleccionada);
  if (!pedido || !pedido.items || pedido.items.length === 0) {
    alert('No hay productos para generar recibo');
    return;
  }

  // Actualizar la lista de clientes
  actualizarListaClientesPago();
  
  // Calcular totales
  const subtotal = pedido.items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  const propina = parseFloat(document.getElementById('propina').value) || 0;
  const descuento = parseFloat(document.getElementById('descuento').value) || 0;
  const propinaMonto = Math.round((subtotal * propina) / 100);
  const total = Math.round(subtotal + propinaMonto - descuento);
  
  // Actualizar los totales en el modal
  document.getElementById('subtotalModal').textContent = formatearPrecio(subtotal);
  document.getElementById('propinaModal').textContent = formatearPrecio(propinaMonto);
  document.getElementById('descuentoModal').textContent = formatearPrecio(descuento);
  document.getElementById('totalModal').textContent = formatearPrecio(total);
  
  // Limpiar campos del modal
  document.getElementById('montoRecibido').value = '';
  document.getElementById('cambio').textContent = formatearPrecio(0);
  document.getElementById('numeroTransferencia').value = '';
  
  // Mostrar el modal
  const modal = new bootstrap.Modal(document.getElementById('modalPago'));
  modal.show();

  // Agregar event listeners
  document.getElementById('montoRecibido').addEventListener('input', calcularCambio);
  document.getElementById('metodoPago').addEventListener('change', toggleMetodoPago);
}

// Función para actualizar la lista de clientes
function actualizarListaClientes() {
  const listaClientes = document.getElementById('listaClientes');
  listaClientes.innerHTML = '';
}

// Función para actualizar la lista de clientes en el modal de pago
function actualizarListaClientesPago() {
  const listaClientes = document.getElementById('listaClientesPago');
  listaClientes.innerHTML = '';
}

// Función para buscar clientes
function buscarClientes() {
  const busqueda = document.getElementById('buscarCliente').value.toLowerCase();
  const listaClientes = document.getElementById('listaClientes');
  listaClientes.innerHTML = '';

  if (!busqueda) {
    return;
  }

  const clientesFiltrados = clientes.filter(cliente => 
    cliente.nombre.toLowerCase().includes(busqueda) || 
    cliente.telefono.includes(busqueda)
  );

  if (clientesFiltrados.length === 0) {
    listaClientes.innerHTML = '<p class="text-muted">No se encontraron clientes</p>';
    return;
  }

  clientesFiltrados.forEach(cliente => {
    const item = document.createElement('button');
    item.className = 'list-group-item list-group-item-action bg-dark text-white border-light';
    item.innerHTML = `
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h6 class="mb-1">${cliente.nombre}</h6>
          <small>${cliente.telefono}</small>
        </div>
        <button class="btn btn-sm btn-outline-light" onclick="seleccionarCliente(${JSON.stringify(cliente).replace(/"/g, '&quot;')})">
          Seleccionar
        </button>
      </div>
    `;
    listaClientes.appendChild(item);
  });
}

// Función para buscar clientes en el modal de pago
function buscarClientesPago() {
  const busqueda = document.getElementById('buscarClientePago').value.toLowerCase();
  const listaClientes = document.getElementById('listaClientesPago');
  listaClientes.innerHTML = '';

  if (!busqueda) {
    return;
  }

  const clientesFiltrados = clientes.filter(cliente => 
    cliente.nombre.toLowerCase().includes(busqueda) || 
    cliente.telefono.includes(busqueda)
  );

  if (clientesFiltrados.length === 0) {
    listaClientes.innerHTML = '<p class="text-muted">No se encontraron clientes</p>';
    return;
  }

  clientesFiltrados.forEach(cliente => {
    const item = document.createElement('button');
    item.className = 'list-group-item list-group-item-action bg-dark text-white border-light';
    item.innerHTML = `
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h6 class="mb-1">${cliente.nombre}</h6>
          <small>${cliente.telefono}</small>
        </div>
        <button class="btn btn-sm btn-outline-light" onclick="seleccionarClientePago(${JSON.stringify(cliente).replace(/"/g, '&quot;')})">
          Seleccionar
        </button>
      </div>
    `;
    listaClientes.appendChild(item);
  });
}

// Función para seleccionar un cliente en el pago
function seleccionarClientePago(cliente) {
  const pedido = mesasActivas.get(mesaSeleccionada);
  if (pedido) {
    pedido.cliente = cliente.nombre;
    pedido.telefono = cliente.telefono;
    pedido.direccion = cliente.direccion;
    guardarMesas();
    
    // Mostrar mensaje de confirmación
    const mensaje = document.createElement('div');
    mensaje.className = 'alert alert-success mt-2';
    mensaje.textContent = `Cliente ${cliente.nombre} seleccionado`;
    document.getElementById('listaClientesPago').appendChild(mensaje);
    
    // Remover el mensaje después de 2 segundos
    setTimeout(() => {
      mensaje.remove();
    }, 2000);
  }
}

// Función para calcular el cambio
function calcularCambio() {
  const montoRecibido = parseFloat(document.getElementById('montoRecibido').value) || 0;
  const totalText = document.getElementById('totalModal').textContent;
  // Extraer solo los números del texto del total
  const total = parseFloat(totalText.replace(/[^\d]/g, '')) || 0;
  
  // Asegurarnos de que ambos números sean válidos
  if (isNaN(montoRecibido) || isNaN(total)) {
    document.getElementById('cambio').textContent = 'Devolver en efectivo: $0';
    return;
  }
  
  // Calcular la diferencia
  const devolver = montoRecibido - total;
  
  // Mostrar el resultado
  document.getElementById('cambio').textContent = `Devolver en efectivo: ${formatearPrecio(devolver)}`;
  
  // Para depuración
  console.log('Monto recibido:', montoRecibido);
  console.log('Total:', total);
  console.log('Devolver:', devolver);
}

// Función para alternar entre métodos de pago
function toggleMetodoPago() {
  const metodo = document.getElementById('metodoPago').value;
  const efectivoSection = document.getElementById('efectivoSection');
  const transferenciaSection = document.getElementById('transferenciaSection');
  
  if (metodo === 'efectivo') {
    efectivoSection.style.display = 'block';
    transferenciaSection.style.display = 'none';
  } else if (metodo === 'transferencia') {
    efectivoSection.style.display = 'none';
    transferenciaSection.style.display = 'block';
  } else {
    efectivoSection.style.display = 'none';
    transferenciaSection.style.display = 'none';
  }
}

// Función para mostrar el modal de cliente
function mostrarModalCliente(tipo) {
  tipoPedidoActual = tipo;
  const modal = new bootstrap.Modal(document.getElementById('modalCliente'));
  actualizarListaClientes();
  modal.show();
}

// Función para mostrar el formulario de nuevo cliente
function mostrarFormularioNuevoCliente() {
  document.getElementById('formularioNuevoCliente').style.display = 'block';
  document.getElementById('listaClientes').style.display = 'none';
}

// Función para ocultar el formulario de nuevo cliente
function ocultarFormularioNuevoCliente() {
  document.getElementById('formularioNuevoCliente').style.display = 'none';
  document.getElementById('listaClientes').style.display = 'block';
}

// Función para guardar nuevo cliente
function guardarNuevoCliente() {
  const nombre = document.getElementById('nuevoClienteNombre').value;
  const telefono = document.getElementById('nuevoClienteTelefono').value;
  const direccion = document.getElementById('nuevoClienteDireccion').value;

  if (!nombre || !telefono) {
    alert('Por favor, complete los campos requeridos');
    return;
  }

  const nuevoCliente = {
    id: Date.now(),
    documento: telefono, // Usamos el teléfono como documento
    nombre: nombre,
    apellido: 'No proporcionado',
    telefono: telefono,
    correo: 'No proporcionado',
    direccion: direccion || 'No proporcionado',
    fechaRegistro: new Date().toISOString()
  };

  // Usar window.clientes para mantener consistencia con admon.js
  if (!window.clientes) {
    window.clientes = [];
  }
  window.clientes.push(nuevoCliente);
  localStorage.setItem('clientes', JSON.stringify(window.clientes));
  
  // Limpiar formulario
  document.getElementById('nuevoClienteNombre').value = '';
  document.getElementById('nuevoClienteTelefono').value = '';
  document.getElementById('nuevoClienteDireccion').value = '';

  // Ocultar formulario y actualizar lista
  ocultarFormularioNuevoCliente();
  actualizarListaClientes();
  
  // Seleccionar el cliente recién creado
  seleccionarCliente(nuevoCliente);
}

// Función para seleccionar un cliente
function seleccionarCliente(cliente) {
  if (tipoPedidoActual === 'domicilio') {
    crearPedidoDomicilioConCliente(cliente);
  } else {
    crearPedidoRecogerConCliente(cliente);
  }
  
  // Cerrar modal
  bootstrap.Modal.getInstance(document.getElementById('modalCliente')).hide();
}

// Función para crear pedido de domicilio con cliente
function crearPedidoDomicilioConCliente(cliente) {
  contadorDomicilios++;
  guardarContadores();
  
  const idPedido = `DOM-${contadorDomicilios}`;
  const pedido = {
    tipo: 'domicilio',
    numero: contadorDomicilios,
    cliente: cliente.nombre,
    telefono: cliente.telefono,
    direccion: cliente.direccion,
    items: [],
    estado: 'pendiente',
    fecha: new Date().toLocaleString(),
    ronda: 1 // Inicializar la ronda
  };

  mesasActivas.set(idPedido, pedido);
  guardarMesas();
  actualizarMesasActivas();
  seleccionarMesa(idPedido);
}

// Función para crear pedido para recoger con cliente
function crearPedidoRecogerConCliente(cliente) {
  contadorRecoger++;
  guardarContadores();
  
  const horaRecoger = prompt('Ingrese la hora de recoger (ej: 14:30):');
  if (!horaRecoger) return;

  const idPedido = `REC-${contadorRecoger}`;
  const pedido = {
    tipo: 'recoger',
    numero: contadorRecoger,
    cliente: cliente.nombre,
    telefono: cliente.telefono,
    horaRecoger,
    items: [],
    estado: 'pendiente',
    fecha: new Date().toLocaleString(),
    ronda: 1 // Inicializar la ronda
  };

  mesasActivas.set(idPedido, pedido);
  guardarMesas();
  actualizarMesasActivas();
  seleccionarMesa(idPedido);
}

// Función para reiniciar contadores (puedes llamarla al inicio del día)
function reiniciarContadores() {
  contadorDomicilios = 0;
  contadorRecoger = 0;
  guardarContadores();
}

// Modificar las funciones existentes de crear pedido
function crearPedidoDomicilio() {
  mostrarModalCliente('domicilio');
}

function crearPedidoRecoger() {
  mostrarModalCliente('recoger');
}

// Función para crear nueva mesa
function crearNuevaMesa() {
  const numeroMesa = document.getElementById('nuevaMesa').value.trim();
  
  if (!numeroMesa) {
    alert('Por favor, ingrese un número de mesa');
    return;
  }

  if (mesasActivas.has(numeroMesa)) {
    alert('Esta mesa ya está activa');
    return;
  }

  // Crear nueva mesa
  mesasActivas.set(numeroMesa, []);
  guardarMesas();
  
  // Limpiar el input
  document.getElementById('nuevaMesa').value = '';
  
  // Actualizar la vista de mesas
  actualizarMesasActivas();
  
  // Seleccionar la nueva mesa
  seleccionarMesa(numeroMesa);
}

// Función para eliminar un pedido/mesa
function eliminarPedido() {
  if (!mesaSeleccionada) {
    alert('Por favor, seleccione una mesa o pedido para eliminar');
    return;
  }

  let mensaje = '';
  if (mesaSeleccionada.startsWith('DOM-')) {
    mensaje = '¿Está seguro que desea eliminar este pedido a domicilio?';
  } else if (mesaSeleccionada.startsWith('REC-')) {
    mensaje = '¿Está seguro que desea eliminar este pedido para recoger?';
  } else {
    mensaje = '¿Está seguro que desea eliminar esta mesa?';
  }

  if (confirm(mensaje)) {
    // Eliminar de mesas activas
    mesasActivas.delete(mesaSeleccionada);
    
    // Eliminar de órdenes de cocina si existe
    if (ordenesCocina.has(mesaSeleccionada)) {
      ordenesCocina.delete(mesaSeleccionada);
    }

    // Guardar cambios
    guardarMesas();

    // Limpiar la interfaz
    document.getElementById('ordenCuerpo').innerHTML = '';
    document.getElementById('propina').value = '';
    document.getElementById('descuento').value = '';
    document.getElementById('totalOrden').textContent = formatearPrecio(0);
    document.getElementById('desgloseTotal').innerHTML = '';
    document.getElementById('mesaActual').textContent = '-';
    mesaSeleccionada = null;

    // Actualizar vista de mesas
    actualizarMesasActivas();
  }
}

// Función para procesar el pago
function procesarPago() {
  const metodoPago = document.getElementById('metodoPago').value;
  const pedido = mesasActivas.get(mesaSeleccionada);
  
  if (!pedido || !pedido.items || pedido.items.length === 0) {
    alert('No hay productos en la orden');
    return;
  }

  // Calcular totales
  const subtotal = pedido.items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  const propina = parseFloat(document.getElementById('propina').value) || 0;
  const descuento = parseFloat(document.getElementById('descuento').value) || 0;
  const propinaMonto = Math.round((subtotal * propina) / 100);
  const total = Math.round(subtotal + propinaMonto - descuento);

  // Validar monto recibido si es efectivo
  if (metodoPago === 'efectivo') {
    const montoRecibido = parseFloat(document.getElementById('montoRecibido').value);
    if (!montoRecibido || montoRecibido < total) {
      alert('El monto recibido es insuficiente');
      return;
    }
  }

  // Validar número de transferencia si es transferencia
  if (metodoPago === 'transferencia') {
    const numeroTransferencia = document.getElementById('numeroTransferencia').value;
    if (!numeroTransferencia) {
      alert('Por favor, ingrese el número de transferencia');
      return;
    }
  }

  // Crear objeto de factura
  const factura = {
    id: Date.now(),
    fecha: new Date().toISOString(), // Guardar fecha en formato ISO
    mesa: mesaSeleccionada,
    items: pedido.items,
    subtotal: subtotal,
    propina: propina,
    propinaMonto: propinaMonto,
    descuento: descuento,
    total: total,
    metodoPago: metodoPago,
    montoRecibido: metodoPago === 'efectivo' ? parseFloat(document.getElementById('montoRecibido').value) : 0,
    cambio: metodoPago === 'efectivo' ? Math.round(parseFloat(document.getElementById('montoRecibido').value) - total) : 0,
    cliente: pedido.cliente || null,
    telefono: pedido.telefono || null,
    direccion: pedido.direccion || null,
    horaRecoger: pedido.horaRecoger || null,
    tipo: mesaSeleccionada.startsWith('DOM-') ? 'domicilio' : 
          mesaSeleccionada.startsWith('REC-') ? 'recoger' : 'mesa'
  };

  console.log('Factura a guardar:', factura);

  try {
    // Asegurarse de que historialVentas esté inicializado
    if (!historialVentas) {
      historialVentas = [];
    }

    // Verificar que historialVentas sea un array
    if (!Array.isArray(historialVentas)) {
      console.error('historialVentas no es un array:', historialVentas);
      historialVentas = [];
    }

    // Agregar al historial de ventas
    historialVentas.push(factura);
    console.log('Historial de ventas actualizado:', historialVentas);
    
    // Guardar en localStorage
    guardarHistorialVentas();
    console.log('Historial de ventas guardado en localStorage');

    // Verificar que se guardó correctamente
    const guardado = localStorage.getItem('historialVentas');
    console.log('Verificación de guardado:', guardado);
  } catch (error) {
    console.error('Error al guardar la venta:', error);
    alert('Error al guardar la venta. Por favor, intente nuevamente.');
    return;
  }

  // Imprimir factura
  const ventana = obtenerVentanaImpresion();
  if (!ventana) {
    alert('No se pudo abrir la ventana de impresión. Por favor, verifique que los bloqueadores de ventanas emergentes estén desactivados.');
    return;
  }
  
  let tipoPedido = '';
  let infoAdicional = '';
  
  if (factura.mesa.startsWith('DOM-')) {
    tipoPedido = 'Pedido a Domicilio';
    if (factura.cliente) {
      infoAdicional = `
        <div class="border-top">
          <div class="mb-1">Cliente: ${factura.cliente}</div>
          <div class="mb-1">Dir: ${factura.direccion}</div>
          <div class="mb-1">Tel: ${factura.telefono}</div>
        </div>
      `;
    }
  } else if (factura.mesa.startsWith('REC-')) {
    tipoPedido = 'Pedido para Recoger';
    if (factura.cliente) {
      infoAdicional = `
        <div class="border-top">
          <div class="mb-1">Cliente: ${factura.cliente}</div>
          <div class="mb-1">Tel: ${factura.telefono}</div>
          <div class="mb-1">Hora: ${factura.horaRecoger}</div>
        </div>
      `;
    }
  }

  const formatearNumero = (num) => {
    const numero = Math.round(num);
    return numero.toLocaleString('es-CO');
  };
  
  const contenido = `
    <div class="logo-container">
      ${localStorage.getItem('logoNegocio') ? 
        `<img src="${localStorage.getItem('logoNegocio')}" alt="Logo">` : 
        ''}
    </div>

    <div class="header text-center">
      <h2 style="margin: 0; font-size: 14px;">RESTAURANTE</h2>
      ${tipoPedido ? `<div class="mb-1">${tipoPedido}</div>` : ''}
      <div class="mb-1">${factura.fecha}</div>
      ${!factura.mesa.startsWith('DOM-') && !factura.mesa.startsWith('REC-') ? 
        `<div class="mb-1">Mesa: ${factura.mesa}</div>` : ''}
    </div>
    
    ${infoAdicional}
    
    <table>
      <thead>
        <tr>
          <th style="width: 40%">Producto</th>
          <th style="width: 15%">Cant</th>
          <th style="width: 20%">Precio</th>
          <th style="width: 25%">Total</th>
        </tr>
      </thead>
      <tbody>
        ${factura.items.map(item => `
          <tr>
            <td><strong>${item.nombre}</strong></td>
            <td>${item.cantidad}</td>
            <td class="text-right">${formatearNumero(item.precio)}</td>
            <td class="text-right">${formatearNumero(item.precio * item.cantidad)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    <div class="border-top">
      <div class="mb-1">Subtotal: <span class="text-right">$ ${formatearNumero(factura.subtotal)}</span></div>
      <div class="mb-1">Propina (${factura.propina}%): <span class="text-right">$ ${formatearNumero(factura.propinaMonto)}</span></div>
      <div class="mb-1">Descuento: <span class="text-right">$ ${formatearNumero(factura.descuento)}</span></div>
      <div class="mb-1 total-row"><strong>Total: $ ${formatearNumero(factura.total)}</strong></div>
    </div>
    
    <div class="border-top">
      <div class="mb-1">Pago: ${factura.metodoPago}</div>
      ${factura.metodoPago === 'efectivo' ? `
        <div class="mb-1">Recibido: <span class="text-right">$ ${formatearNumero(factura.montoRecibido)}</span></div>
        <div class="mb-1">Cambio: <span class="text-right">$ ${formatearNumero(factura.cambio)}</span></div>
      ` : ''}
    </div>
    
    <div class="text-center mt-1">
      <div class="border-top">¡Gracias por su visita!</div>
    </div>

    <div class="botones-impresion">
      <button onclick="window.print()">Imprimir</button>
      <button onclick="window.close()">Cerrar</button>
    </div>
  `;
  
  ventana.document.getElementById('contenido').innerHTML = contenido;
  ventana.focus();

  // Limpiar la mesa
  mesasActivas.delete(mesaSeleccionada);
  ordenesCocina.delete(mesaSeleccionada);
  guardarMesas();
  
  // Limpiar la interfaz
  document.getElementById('ordenCuerpo').innerHTML = '';
  document.getElementById('propina').value = '';
  document.getElementById('descuento').value = '';
  document.getElementById('totalOrden').textContent = formatearPrecio(0);
  document.getElementById('desgloseTotal').innerHTML = '';
  document.getElementById('mesaActual').textContent = '-';
  mesaSeleccionada = null;
  
  // Actualizar vista de mesas
  actualizarMesasActivas();
  
  // Cerrar modal
  bootstrap.Modal.getInstance(document.getElementById('modalPago')).hide();
  
  alert('Pago procesado correctamente');
}

// Función para reimprimir ticket de cocina desde el historial
function reimprimirTicketCocina(ordenId) {
  const orden = historialCocina.find(o => o.id === ordenId);
  if (orden) {
    imprimirTicketCocina(orden.mesa, orden.items);
  }
}

// Función para reimprimir factura desde el historial
function reimprimirFactura(ventaId) {
  const venta = historialVentas.find(v => v.id === ventaId);
  if (venta) {
    const ventana = obtenerVentanaImpresion();
    if (!ventana) {
      alert('No se pudo abrir la ventana de impresión. Por favor, verifique que los bloqueadores de ventanas emergentes estén desactivados.');
      return;
    }
    
    let tipoPedido = '';
    let infoAdicional = '';
    
    if (venta.mesa.startsWith('DOM-')) {
      tipoPedido = 'Pedido a Domicilio';
      if (venta.cliente) {
        infoAdicional = `
          <div class="border-top">
            <div class="mb-1">Cliente: ${venta.cliente}</div>
            <div class="mb-1">Dir: ${venta.direccion}</div>
            <div class="mb-1">Tel: ${venta.telefono}</div>
          </div>
        `;
      }
    } else if (venta.mesa.startsWith('REC-')) {
      tipoPedido = 'Pedido para Recoger';
      if (venta.cliente) {
        infoAdicional = `
          <div class="border-top">
            <div class="mb-1">Cliente: ${venta.cliente}</div>
            <div class="mb-1">Tel: ${venta.telefono}</div>
            <div class="mb-1">Hora: ${venta.horaRecoger}</div>
          </div>
        `;
      }
    }

    const contenido = `
      <html>
        <head>
          <title>Recibo</title>
          <style>
            body { 
              font-family: monospace;
              font-size: 14px;
              width: 80mm;
              margin: 0;
              padding: 2mm;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .mb-1 { margin-bottom: 1px; }
            .mt-1 { margin-top: 1px; }
            table { 
              width: 100%;
              border-collapse: collapse;
              margin: 2px 0;
            }
            th, td { 
              padding: 1px;
              text-align: left;
              font-size: 14px;
            }
            .border-top { 
              border-top: 1px dashed #000;
              margin-top: 2px;
              padding-top: 2px;
            }
            .header {
              border-bottom: 1px dashed #000;
              padding-bottom: 2px;
              margin-bottom: 2px;
            }
            .total-row {
              font-weight: bold;
              font-size: 15px;
            }
            .botones-impresion {
              position: fixed;
              top: 10px;
              right: 10px;
              z-index: 1000;
            }
            .botones-impresion button {
              margin-left: 5px;
              padding: 5px 10px;
              background: #007bff;
              color: white;
              border: none;
              border-radius: 3px;
              cursor: pointer;
            }
            .botones-impresion button:hover {
              background: #0056b3;
            }
            @media print {
              .botones-impresion {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="botones-impresion">
            <button onclick="window.print()">Imprimir</button>
            <button onclick="window.close()">Cerrar</button>
          </div>

          <div class="logo-container">
            ${localStorage.getItem('logoNegocio') ? 
              `<img src="${localStorage.getItem('logoNegocio')}" alt="Logo">` : 
              ''}
          </div>

          <div class="header text-center">
            <h2 style="margin: 0; font-size: 14px;">RESTAURANTE</h2>
            ${tipoPedido ? `<div class="mb-1">${tipoPedido}</div>` : ''}
            <div class="mb-1">${venta.fecha}</div>
            ${!venta.mesa.startsWith('DOM-') && !venta.mesa.startsWith('REC-') ? 
              `<div class="mb-1">Mesa: ${venta.mesa}</div>` : ''}
          </div>
          
          ${infoAdicional}
          
          <table>
            <thead>
              <tr>
                <th style="width: 40%">Producto</th>
                <th style="width: 15%">Cant</th>
                <th style="width: 20%">Precio</th>
                <th style="width: 25%">Total</th>
              </tr>
            </thead>
            <tbody>
              ${venta.items.map(item => `
                <tr>
                  <td>${item.nombre}</td>
                  <td>${item.cantidad}</td>
                  <td>${formatearNumero(item.precio)}</td>
                  <td>${formatearNumero(item.precio * item.cantidad)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="border-top">
            <div class="mb-1">Subtotal: $ ${formatearNumero(venta.subtotal)}</div>
            <div class="mb-1">Propina (${venta.propina}%): $ ${formatearNumero(venta.propinaMonto)}</div>
            <div class="mb-1">Descuento: $ ${formatearNumero(venta.descuento)}</div>
            <div class="mb-1 total-row">Total: $ ${formatearNumero(venta.total)}</div>
          </div>
          
          <div class="border-top">
            <div class="mb-1">Pago: ${venta.metodoPago}</div>
            ${venta.metodoPago === 'efectivo' ? `
              <div class="mb-1">Recibido: $ ${formatearNumero(venta.montoRecibido)}</div>
              <div class="mb-1">Cambio: $ ${formatearNumero(venta.cambio)}</div>
            ` : ''}
          </div>
          
          <div class="text-center mt-1">
            <div class="border-top">¡Gracias por su visita!</div>
          </div>
        </body>
      </html>
    `;
    
    ventana.document.write(contenido);
    ventana.document.close();
  }
}

// Función para mostrar el modal de cierre diario
function mostrarModalCierreDiario() {
    const modal = new bootstrap.Modal(document.getElementById('modalCierreDiario'));
    
    // Asegurarse de que historialVentas esté cargado
    if (!historialVentas || historialVentas.length === 0) {
        const historialGuardado = localStorage.getItem('historialVentas');
        if (historialGuardado) {
            historialVentas = JSON.parse(historialGuardado);
            console.log('Historial de ventas cargado desde localStorage:', historialVentas);
        } else {
            historialVentas = [];
            console.log('No se encontró historial de ventas en localStorage');
        }
    }
    
    // Obtener ventas del día
    const hoy = new Date();
    const hoyStr = hoy.toLocaleDateString();
    console.log('Fecha actual:', hoyStr);
    console.log('Historial de ventas completo:', historialVentas);
    
    const ventasHoy = historialVentas.filter(v => {
        const fechaVenta = new Date(v.fecha);
        const fechaVentaStr = fechaVenta.toLocaleDateString();
        console.log('Comparando fecha venta:', fechaVentaStr, 'con fecha actual:', hoyStr);
        return fechaVentaStr === hoyStr;
    });
    
    console.log('Ventas de hoy filtradas:', ventasHoy);
    
    // Calcular totales
    const totalVentas = ventasHoy.reduce((sum, v) => sum + (v.total || 0), 0);
    const totalEfectivo = ventasHoy.filter(v => v.metodoPago === 'efectivo')
        .reduce((sum, v) => sum + (v.total || 0), 0);
    const totalTransferencia = ventasHoy.filter(v => v.metodoPago === 'transferencia')
        .reduce((sum, v) => sum + (v.total || 0), 0);
    
    console.log('Totales calculados:', {
        totalVentas,
        totalEfectivo,
        totalTransferencia
    });
    
    // Obtener gastos del día
    const gastos = JSON.parse(localStorage.getItem('gastos')) || [];
    const gastosHoy = gastos.filter(g => new Date(g.fecha).toLocaleDateString() === hoyStr);
    const totalGastos = gastosHoy.reduce((sum, g) => sum + (g.monto || 0), 0);
    
    console.log('Gastos de hoy:', gastosHoy);
    console.log('Total gastos:', totalGastos);
    
    // Calcular balance final
    const balanceFinal = totalVentas - totalGastos;
    
    // Actualizar valores en el modal
    document.getElementById('totalVentasHoy').textContent = `$ ${totalVentas.toLocaleString()}`;
    document.getElementById('totalEfectivoHoy').textContent = `$ ${totalEfectivo.toLocaleString()}`;
    document.getElementById('totalTransferenciaHoy').textContent = `$ ${totalTransferencia.toLocaleString()}`;
    document.getElementById('totalGastosHoy').textContent = `$ ${totalGastos.toLocaleString()}`;
    document.getElementById('balanceFinal').textContent = `$ ${balanceFinal.toLocaleString()}`;
    
    modal.show();
}

function guardarCierreDiario() {
    const detalles = document.getElementById('detallesCierre').value;
    const fecha = new Date().toLocaleDateString();
    
    // Obtener datos actuales
    const cierres = JSON.parse(localStorage.getItem('cierresDiarios')) || [];
    
    // Crear nuevo cierre
    const nuevoCierre = {
        fecha,
        totalVentas: parseFloat(document.getElementById('totalVentasHoy').textContent.replace('$', '').replace(',', '')),
        totalEfectivo: parseFloat(document.getElementById('totalEfectivoHoy').textContent.replace('$', '').replace(',', '')),
        totalTransferencia: parseFloat(document.getElementById('totalTransferenciaHoy').textContent.replace('$', '').replace(',', '')),
        totalGastos: parseFloat(document.getElementById('totalGastosHoy').textContent.replace('$', '').replace(',', '')),
        balanceFinal: parseFloat(document.getElementById('balanceFinal').textContent.replace('$', '').replace(',', '')),
        detalles
    };
    
    // Agregar nuevo cierre
    cierres.push(nuevoCierre);
    
    // Guardar en localStorage
    localStorage.setItem('cierresDiarios', JSON.stringify(cierres));
    
    // Cerrar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalCierreDiario'));
    modal.hide();
    
    // Mostrar mensaje de éxito
    alert('Cierre diario guardado exitosamente');
}

function exportarCierresDiariosExcel() {
    try {
        // Obtener cierres diarios
        const cierres = JSON.parse(localStorage.getItem('cierresDiarios')) || [];
        
        if (cierres.length === 0) {
            alert('No hay cierres diarios para exportar');
            return;
        }

        // Crear un nuevo libro de Excel
        const wb = XLSX.utils.book_new();
        
        // Preparar los datos para la hoja de cálculo
        const datos = cierres.map(cierre => ({
            'Fecha': cierre.fecha,
            'Total Ventas': cierre.totalVentas,
            'Efectivo': cierre.totalEfectivo,
            'Transferencia': cierre.totalTransferencia,
            'Gastos': cierre.totalGastos,
            'Balance Final': cierre.balanceFinal,
            'Detalles': cierre.detalles || ''
        }));

        // Crear la hoja de cálculo
        const ws = XLSX.utils.json_to_sheet(datos);

        // Ajustar el ancho de las columnas
        const anchos = [
            { wch: 15 }, // Fecha
            { wch: 15 }, // Total Ventas
            { wch: 15 }, // Efectivo
            { wch: 15 }, // Transferencia
            { wch: 15 }, // Gastos
            { wch: 15 }, // Balance Final
            { wch: 40 }  // Detalles
        ];
        ws['!cols'] = anchos;

        // Agregar la hoja al libro
        XLSX.utils.book_append_sheet(wb, ws, 'Cierres Diarios');

        // Generar el archivo Excel
        const fecha = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `Cierres_Diarios_${fecha}.xlsx`);
        
        alert('Archivo Excel generado exitosamente');
    } catch (error) {
        console.error('Error al exportar a Excel:', error);
        alert('Error al generar el archivo Excel');
    }
}

function imprimirBalanceDiario() {
    try {
        // Obtener ventas del día
        const hoy = new Date().toLocaleDateString();
        const ventasHoy = historialVentas.filter(v => new Date(v.fecha).toLocaleDateString() === hoy);
        
        // Calcular totales
        const totalVentas = ventasHoy.reduce((sum, v) => sum + v.total, 0);
        const totalEfectivo = ventasHoy.filter(v => v.metodoPago === 'efectivo')
            .reduce((sum, v) => sum + v.total, 0);
        const totalTransferencia = ventasHoy.filter(v => v.metodoPago === 'transferencia')
            .reduce((sum, v) => sum + v.total, 0);
        
        // Obtener gastos del día
        const gastos = JSON.parse(localStorage.getItem('gastos')) || [];
        const gastosHoy = gastos.filter(g => new Date(g.fecha).toLocaleDateString() === hoy);
        const totalGastos = gastosHoy.reduce((sum, g) => sum + g.monto, 0);
        
        // Calcular balance final
        const balanceFinal = totalVentas - totalGastos;

        // Crear ventana de impresión
        const ventana = obtenerVentanaImpresion();
        
        const contenido = `
            <html>
                <head>
                    <title>Balance Diario</title>
                    <style>
                        body { 
                            font-family: monospace;
                            font-size: 14px;
                            width: 80mm;
                            margin: 0;
                            padding: 2mm;
                        }
                        .text-center { text-align: center; }
                        .text-right { text-align: right; }
                        .mb-1 { margin-bottom: 1px; }
                        .mt-1 { margin-top: 1px; }
                        .border-top { 
                            border-top: 1px dashed #000;
                            margin-top: 2px;
                            padding-top: 2px;
                        }
                        .header {
                            border-bottom: 1px dashed #000;
                            padding-bottom: 2px;
                            margin-bottom: 2px;
                        }
                        .total-row {
                            font-weight: bold;
                            font-size: 15px;
                        }
                        .botones-impresion {
                            position: fixed;
                            top: 10px;
                            right: 10px;
                            z-index: 1000;
                        }
                        .botones-impresion button {
                            margin-left: 5px;
                            padding: 5px 10px;
                            background: #007bff;
                            color: white;
                            border: none;
                            border-radius: 3px;
                            cursor: pointer;
                        }
                        .botones-impresion button:hover {
                            background: #0056b3;
                        }
                        @media print {
                            .botones-impresion {
                                display: none;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="botones-impresion">
                        <button onclick="window.print()">Imprimir</button>
                        <button onclick="window.close()">Cerrar</button>
                    </div>

                    <div class="header text-center">
                        <h2 style="margin: 0; font-size: 14px;">BALANCE DIARIO</h2>
                        <div class="mb-1">${hoy}</div>
                    </div>
                    
                    <div class="border-top">
                        <div class="mb-1">Total Ventas: $ ${totalVentas.toLocaleString()}</div>
                        <div class="mb-1">- Efectivo: $ ${totalEfectivo.toLocaleString()}</div>
                        <div class="mb-1">- Transferencia: $ ${totalTransferencia.toLocaleString()}</div>
                    </div>
                    
                    <div class="border-top">
                        <div class="mb-1">Total Gastos: $ ${totalGastos.toLocaleString()}</div>
                    </div>
                    
                    <div class="border-top">
                        <div class="mb-1 total-row">Balance Final: $ ${balanceFinal.toLocaleString()}</div>
                    </div>

                    <div class="border-top mt-1">
                        <div class="mb-1">Detalle de Gastos:</div>
                        ${gastosHoy.map(gasto => `
                            <div class="mb-1">- ${gasto.descripcion}: $ ${gasto.monto.toLocaleString()}</div>
                        `).join('')}
                    </div>
                    
                    <div class="text-center mt-1">
                        <div class="border-top">¡Fin del Balance!</div>
                    </div>
                </body>
            </html>
        `;
        
        ventana.document.write(contenido);
        ventana.document.close();
    } catch (error) {
        console.error('Error al imprimir balance:', error);
        alert('Error al generar el balance');
    }
}

// Función para mostrar historial de ventas
function mostrarHistorialVentas() {
  const tablaHistorial = document.getElementById('tablaHistorialVentas');
  const cuerpoTabla = tablaHistorial.querySelector('tbody');
  cuerpoTabla.innerHTML = '';

  // Obtener la fecha seleccionada del input
  const fechaSeleccionada = document.getElementById('fechaHistorialVentas').value;
  const fechaFiltro = fechaSeleccionada ? new Date(fechaSeleccionada) : new Date();

  // Filtrar ventas por fecha
  const ventasFiltradas = historialVentas.filter(venta => {
    const fechaVenta = new Date(venta.fecha);
    return fechaVenta.toDateString() === fechaFiltro.toDateString();
  });

  ventasFiltradas.forEach(venta => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${venta.fecha}</td>
      <td>${venta.tipo}</td>
      <td>${venta.cliente || '-'}</td>
      <td>${venta.total.toFixed(2)}</td>
      <td>${venta.metodoPago}</td>
      <td>
        <button class="btn btn-sm btn-info" onclick="reimprimirFactura('${venta.id}')">
          <i class="fas fa-print"></i>
        </button>
      </td>
    `;
    cuerpoTabla.appendChild(fila);
  });

  // Actualizar totales
  const totalVentas = ventasFiltradas.reduce((sum, venta) => sum + venta.total, 0);
  document.getElementById('totalVentasHistorial').textContent = totalVentas.toFixed(2);
}

// Función para mostrar historial de cocina
function mostrarHistorialCocina() {
  const tablaHistorial = document.getElementById('tablaHistorialCocina');
  const cuerpoTabla = tablaHistorial.querySelector('tbody');
  cuerpoTabla.innerHTML = '';

  // Obtener la fecha seleccionada del input
  const fechaSeleccionada = document.getElementById('fechaHistorialCocina').value;
  const fechaFiltro = fechaSeleccionada ? new Date(fechaSeleccionada) : new Date();

  // Filtrar órdenes por fecha
  const ordenesFiltradas = historialCocina.filter(orden => {
    const fechaOrden = new Date(orden.fecha);
    return fechaOrden.toDateString() === fechaFiltro.toDateString();
  });

  ordenesFiltradas.forEach(orden => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${orden.fecha}</td>
      <td>${orden.mesa || orden.tipo}</td>
      <td>${orden.cliente || '-'}</td>
      <td>${orden.items.map(item => item.nombre).join(', ')}</td>
      <td>
        <button class="btn btn-sm btn-info" onclick="reimprimirTicketCocina('${orden.id}')">
          <i class="fas fa-print"></i>
        </button>
      </td>
    `;
    cuerpoTabla.appendChild(fila);
  });
}

// Función para mostrar el modal de historial de ventas
function mostrarModalHistorialVentas() {
  const modal = new bootstrap.Modal(document.getElementById('modalHistorialVentas'));
  // Establecer la fecha actual por defecto
  document.getElementById('fechaHistorialVentas').valueAsDate = new Date();
  mostrarHistorialVentas();
  modal.show();
}

// Función para mostrar el modal de historial de cocina
function mostrarModalHistorialCocina() {
  const modal = new bootstrap.Modal(document.getElementById('modalHistorialCocina'));
  // Establecer la fecha actual por defecto
  document.getElementById('fechaHistorialCocina').valueAsDate = new Date();
  mostrarHistorialCocina();
  modal.show();
}

// Función para formatear número
function formatearNumero(num) {
  return num.toLocaleString('es-CO');
}

// Función para inicializar WhatsApp Web
function inicializarWhatsApp() {
    const container = document.getElementById('whatsappContainer');
    if (!container) return;

    // Crear el iframe
    const iframe = document.createElement('iframe');
    iframe.src = 'https://web.whatsapp.com';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';

    // Mensaje de carga
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'whatsapp-loading';
    loadingDiv.innerHTML = `
        <div class="spinner-border text-success" role="status">
            <span class="visually-hidden">Cargando...</span>
        </div>
        <p>Cargando WhatsApp Web...</p>
    `;

    container.appendChild(loadingDiv);

    // Manejar la carga del iframe
    iframe.onload = function() {
        loadingDiv.remove();
        container.appendChild(iframe);
    };

    iframe.onerror = function() {
        loadingDiv.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <i class="fas fa-exclamation-circle"></i>
                Error al cargar WhatsApp Web
            </div>
            <button class="btn btn-primary mt-3" onclick="inicializarWhatsApp()">
                <i class="fas fa-redo"></i> Reintentar
            </button>
        `;
    };
}

// Inicializar WhatsApp cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    inicializarWhatsApp();
});

// Función para mostrar/ocultar el panel de WhatsApp
function toggleWhatsApp() {
    const whatsappPanel = document.getElementById('whatsappPanel');
    const whatsappContainer = document.getElementById('whatsappContainer');
    
    if (whatsappPanel.style.display === 'none' || !whatsappPanel.style.display) {
        whatsappPanel.style.display = 'block';
        // Crear un iframe para WhatsApp Web
        whatsappContainer.innerHTML = `
            <iframe 
                src="https://web.whatsapp.com" 
                style="width: 100%; height: 600px; border: none;"
                allow="camera; microphone"
            ></iframe>
        `;
    } else {
        whatsappPanel.style.display = 'none';
        whatsappContainer.innerHTML = '';
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  cargarDatos();
  
  // Inicializar WhatsApp Web
  inicializarWhatsApp();
  
  // Agregar evento para el botón de nueva mesa
  document.getElementById('btnNuevaMesa').addEventListener('click', crearNuevaMesa);
  
  // Agregar evento para la tecla Enter en el input de número de mesa
  document.getElementById('nuevaMesa').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      crearNuevaMesa();
    }
  });
  
  // Actualizar total cuando cambian propina o descuento
  document.getElementById('propina').addEventListener('input', () => {
    if (mesaSeleccionada) {
      actualizarTotal(mesaSeleccionada);
    }
  });
  
  document.getElementById('descuento').addEventListener('input', () => {
    if (mesaSeleccionada) {
      actualizarTotal(mesaSeleccionada);
    }
  });
});

// Función para mostrar el modal de configuración de cierre
function mostrarModalConfiguracionCierre() {
    const modal = new bootstrap.Modal(document.getElementById('modalConfiguracionCierre'));
    
    // Cargar la configuración actual
    const configGuardada = JSON.parse(localStorage.getItem('configuracionCierre') || '{}');
    
    document.getElementById('horaCierre').value = configGuardada.horaCierre || 11;
    document.getElementById('minutoCierre').value = configGuardada.minutoCierre || 30;
    document.getElementById('periodoCierre').value = configGuardada.periodo || 'PM';
    document.getElementById('activarHoraCierre').checked = configGuardada.activo || false;
    
    modal.show();
}

// Función para guardar la configuración de cierre
function guardarConfiguracionCierre() {
    const hora = parseInt(document.getElementById('horaCierre').value);
    const minuto = parseInt(document.getElementById('minutoCierre').value);
    const periodo = document.getElementById('periodoCierre').value;
    const activo = document.getElementById('activarHoraCierre').checked;

    if (hora < 1 || hora > 12) {
        alert('Por favor, ingrese una hora válida (1-12)');
        return;
    }

    if (minuto < 0 || minuto > 59) {
        alert('Por favor, ingrese minutos válidos (0-59)');
        return;
    }

    configurarHoraCierre(hora, minuto, periodo, activo);
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalConfiguracionCierre'));
    modal.hide();

    if (activo) {
        alert(`Hora de cierre configurada: ${hora}:${minuto.toString().padStart(2, '0')} ${periodo}`);
    } else {
        alert('Configuración de hora de cierre desactivada. No habrá restricciones de horario.');
    }
}

// Funciones para gestionar gastos
function modificarGasto(id) {
    const gastos = JSON.parse(localStorage.getItem('gastos')) || [];
    const gasto = gastos.find(g => g.id === id);
    
    if (!gasto) {
        alert('Gasto no encontrado');
        return;
    }

    // Llenar el formulario con los datos del gasto
    document.getElementById('descripcionGasto').value = gasto.descripcion;
    document.getElementById('montoGasto').value = gasto.monto;
    document.getElementById('fechaGasto').value = gasto.fecha.split('T')[0];
    
    // Cambiar el botón de guardar por uno de actualizar
    const btnGuardar = document.getElementById('btnGuardarGasto');
    btnGuardar.textContent = 'Actualizar Gasto';
    btnGuardar.onclick = () => actualizarGasto(id);
}

function actualizarGasto(id) {
    const descripcion = document.getElementById('descripcionGasto').value;
    const monto = parseFloat(document.getElementById('montoGasto').value);
    const fecha = document.getElementById('fechaGasto').value;
    
    if (!descripcion || !monto || !fecha) {
        alert('Por favor, complete todos los campos');
        return;
    }
    
    const gastos = JSON.parse(localStorage.getItem('gastos')) || [];
    const index = gastos.findIndex(g => g.id === id);
    
    if (index === -1) {
        alert('Gasto no encontrado');
        return;
    }
    
    gastos[index] = {
        ...gastos[index],
        descripcion,
        monto,
        fecha: new Date(fecha).toISOString()
    };
    
    localStorage.setItem('gastos', JSON.stringify(gastos));
    
    // Limpiar formulario
    document.getElementById('descripcionGasto').value = '';
    document.getElementById('montoGasto').value = '';
    document.getElementById('fechaGasto').value = '';
    
    // Restaurar el botón de guardar
    const btnGuardar = document.getElementById('btnGuardarGasto');
    btnGuardar.textContent = 'Guardar Gasto';
    btnGuardar.onclick = guardarGasto;
    
    mostrarGastos();
    alert('Gasto actualizado exitosamente');
}

function eliminarGasto(id) {
    if (!confirm('¿Está seguro que desea eliminar este gasto?')) {
        return;
    }
    
    const gastos = JSON.parse(localStorage.getItem('gastos')) || [];
    const gastosFiltrados = gastos.filter(g => g.id !== id);
    
    localStorage.setItem('gastos', JSON.stringify(gastosFiltrados));
    mostrarGastos();
    alert('Gasto eliminado exitosamente');
}

function mostrarGastos() {
    const tablaGastos = document.getElementById('tablaGastos');
    const cuerpoTabla = tablaGastos.querySelector('tbody');
    cuerpoTabla.innerHTML = '';
    
    const gastos = JSON.parse(localStorage.getItem('gastos')) || [];
    
    gastos.forEach(gasto => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${new Date(gasto.fecha).toLocaleDateString()}</td>
            <td>${gasto.descripcion}</td>
            <td>$${gasto.monto.toLocaleString()}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="modificarGasto(${gasto.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="eliminarGasto(${gasto.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        cuerpoTabla.appendChild(fila);
    });
}

function mostrarModalGastos() {
    const modalGastos = new bootstrap.Modal(document.getElementById('modalGastos'));
    modalGastos.show();
    mostrarGastos();
}

function guardarGasto() {
    const descripcion = document.getElementById('descripcionGasto').value;
    const monto = parseFloat(document.getElementById('montoGasto').value);
    const fecha = document.getElementById('fechaGasto').value;
    
    if (!descripcion || !monto || !fecha) {
        alert('Por favor, complete todos los campos');
        return;
    }
    
    const gastos = JSON.parse(localStorage.getItem('gastos')) || [];
    const nuevoGasto = {
        id: Date.now(),
        descripcion,
        monto,
        fecha: new Date(fecha).toISOString()
    };
    
    gastos.push(nuevoGasto);
    localStorage.setItem('gastos', JSON.stringify(gastos));
    
    // Limpiar formulario
    document.getElementById('descripcionGasto').value = '';
    document.getElementById('montoGasto').value = '';
    document.getElementById('fechaGasto').value = '';
    
    mostrarGastos();
    alert('Gasto guardado exitosamente');
}
  