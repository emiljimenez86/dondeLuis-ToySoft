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
    // Guardar en ambas claves para sincronizar
    localStorage.setItem('historialVentas', JSON.stringify(historialVentas));
    localStorage.setItem('ventas', JSON.stringify(historialVentas)); // Sincroniza aquí
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
      try {
        clientes = JSON.parse(clientesGuardados);
        if (!Array.isArray(clientes)) {
          console.error('Error: clientes no es un array después de cargar');
          clientes = [];
        }
      } catch (error) {
        console.error('Error al parsear clientes:', error);
        clientes = [];
      }
    } else {
      clientes = [];
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

  // Mostrar/ocultar campo de domicilio
  const domicilioContainer = document.getElementById('domicilioContainer');
  if (mesa.startsWith('DOM-')) {
    domicilioContainer.style.display = 'block';
  } else {
    domicilioContainer.style.display = 'none';
  }

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
  const valorDomicilio = mesa.startsWith('DOM-') ? (parseFloat(document.getElementById('valorDomicilio').value) || 0) : 0;
  
  pedido.propina = propina;
  pedido.descuento = descuento;
  pedido.valorDomicilio = valorDomicilio;
  
  const propinaMonto = Math.round((subtotal * propina) / 100);
  const total = Math.round(subtotal + propinaMonto - descuento + valorDomicilio);
  
  document.getElementById('totalOrden').textContent = formatearPrecio(total);
  
  const desglose = document.getElementById('desgloseTotal');
  if (desglose) {
    desglose.innerHTML = `
      <div class="small text-muted">
        <div>Subtotal: ${formatearPrecio(subtotal)}</div>
        <div>Propina (${propina}%): ${formatearPrecio(propinaMonto)}</div>
        <div>Descuento: ${formatearPrecio(descuento)}</div>
        ${valorDomicilio > 0 ? `<div>Domicilio: ${formatearPrecio(valorDomicilio)}</div>` : ''}
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
              <th style="width: 20%; font-size: 18px;">Cant</th>
              <th style="font-size: 18px;">Producto</th>
            </tr>
          </thead>
          <tbody>
            ${productos.map(item => `
              <tr>
                <td style="font-size: 24px; font-weight: bold;">${item.cantidad}</td>
                <td>
                  <div class="producto" style="font-weight: bold; font-size: 24px;">${item.nombre}</div>
                  ${item.detalles ? `
                    <div class="detalles" style="font-size: 16px; margin-top: 4px;">
                      <span class="detalle-label">Detalle:</span> ${item.detalles}
                    </div>
                  ` : ''}
                </td>
              </tr>
            `).join('')}
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
  const ventana = window.open('', '_blank', 'width=400,height=600,scrollbars=yes');
  if (!ventana) return null;

  // Esperar a que la ventana esté completamente cargada
  ventana.document.open();
  ventana.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Recibo</title>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: monospace;
            font-size: 14px;
            width: 57mm;
            margin: 0;
            padding: 1mm;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .mb-1 { margin-bottom: 0.5mm; }
          .mt-1 { margin-top: 0.5mm; }
          table { 
            width: 100%;
            border-collapse: collapse;
            margin: 1mm 0;
            font-size: 14px;
          }
          th, td { 
            padding: 0.5mm;
            text-align: left;
            font-size: 14px;
          }
          .border-top { 
            border-top: 1px dashed #000;
            margin-top: 1mm;
            padding-top: 1mm;
          }
          .header {
            border-bottom: 1px dashed #000;
            padding-bottom: 1mm;
            margin-bottom: 1mm;
          }
          .total-row {
            font-weight: bold;
            font-size: 16px;
          }
          .botones-impresion {
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 1000;
            background: #fff;
            padding: 5px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          }
          .botones-impresion button {
            margin: 0 5px;
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
          .logo-container {
            text-align: center;
            margin-bottom: 2mm;
          }
          .logo-container img {
            max-width: 100%;
            max-height: 120px;
          }
          @media print {
            .botones-impresion {
              display: none;
            }
            @page {
              margin: 0;
              size: 57mm auto;
            }
            body {
              width: 57mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="botones-impresion">
          <button onclick="window.print()">Imprimir</button>
          <button onclick="window.close()">Cerrar</button>
        </div>
        <div id="contenido"></div>
      </body>
    </html>
  `);
  ventana.document.close();
  return ventana;
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
      <h2 style="margin: 0; font-size: 24px; font-weight: bold;">COCINA</h2>
      <div class="mb-1" style="font-size: 20px; font-weight: bold;">Mesa: ${mesa}</div>
      <div class="mb-1" style="font-size: 18px; font-weight: bold;">Ronda: ${pedidoCompleto && pedidoCompleto.ronda ? pedidoCompleto.ronda : 1}</div>
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
  // Primero generar el recibo preliminar
  generarReciboPreliminar();

  // Esperar a que el usuario cierre la ventana del recibo preliminar antes de mostrar el modal de pago
  setTimeout(() => {
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
    const valorDomicilio = mesaSeleccionada.startsWith('DOM-') ? (parseFloat(document.getElementById('valorDomicilio').value) || 0) : 0;
    const propinaMonto = Math.round((subtotal * propina) / 100);
    const total = Math.round(subtotal + propinaMonto - descuento + valorDomicilio);

    // Actualizar los totales en el modal
    document.getElementById('subtotalModal').textContent = formatearPrecio(subtotal);
    document.getElementById('propinaModal').textContent = formatearPrecio(propinaMonto);
    document.getElementById('descuentoModal').textContent = formatearPrecio(descuento);
    
    // Limpiar el modal de totales
    const totalesSection = document.getElementById('totalesSection');
    totalesSection.innerHTML = `
      <div class="border-top border-light pt-2">
        <div class="d-flex justify-content-between mb-1">
          <span>Subtotal:</span>
          <span id="subtotalModal">${formatearPrecio(subtotal)}</span>
        </div>
        <div class="d-flex justify-content-between mb-1">
          <span>Propina (${propina}%):</span>
          <span id="propinaModal">${formatearPrecio(propinaMonto)}</span>
        </div>
        <div class="d-flex justify-content-between mb-1">
          <span>Descuento:</span>
          <span id="descuentoModal">${formatearPrecio(descuento)}</span>
        </div>
        ${mesaSeleccionada.startsWith('DOM-') ? `
          <div class="d-flex justify-content-between mb-1">
            <span>Domicilio:</span>
            <span id="domicilioModal">${formatearPrecio(valorDomicilio)}</span>
          </div>
        ` : ''}
        <div class="d-flex justify-content-between mb-1 fw-bold">
          <span>Total:</span>
          <span id="totalModal">${formatearPrecio(total)}</span>
        </div>
      </div>
    `;
    
    // Limpiar campos del modal
    document.getElementById('montoRecibido').value = '';
    document.getElementById('cambio').textContent = formatearPrecio(0);
    document.getElementById('numeroTransferencia').value = '';
    
    // Actualizar opciones de método de pago
    const metodoPagoSelect = document.getElementById('metodoPago');
    metodoPagoSelect.innerHTML = `
      <option value="efectivo">Efectivo</option>
      <option value="tarjeta">Tarjeta</option>
      <option value="transferencia">Transferencia</option>
      <option value="credito">Crédito</option>
      <option value="mixto">Efectivo y Transferencia</option>
    `;
    
    // Mostrar el modal después de imprimir el recibo preliminar
    const modal = new bootstrap.Modal(document.getElementById('modalPago'));
    modal.show();

    // Asegurarse de que el event listener no se duplique en montoRecibido
    const montoRecibidoInput = document.getElementById('montoRecibido');
    montoRecibidoInput.removeEventListener('input', calcularCambio);
    montoRecibidoInput.addEventListener('input', calcularCambio);

    // Asegurarse de que el event listener no se duplique en metodoPago
    metodoPagoSelect.removeEventListener('change', toggleMetodoPago);
    metodoPagoSelect.addEventListener('change', () => {
      toggleMetodoPago();
      calcularCambio(); // Sincroniza los campos al cambiar método
    });

    // Llamar a toggleMetodoPago y calcularCambio para ajustar los inputs y valores según el método seleccionado actual
    toggleMetodoPago();
    calcularCambio();
  }, 500); // Dar tiempo para que el usuario vea el recibo preliminar
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
    
    // Actualizar opciones de método de pago para incluir crédito
    const metodoPagoSelect = document.getElementById('metodoPago');
    metodoPagoSelect.innerHTML = `
      <option value="efectivo">Efectivo</option>
      <option value="tarjeta">Tarjeta</option>
      <option value="transferencia">Transferencia</option>
      <option value="credito">Crédito</option>
      <option value="mixto">Efectivo y Transferencia</option>
    `;
    
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
  const totalElement = document.getElementById('totalModal');
  // Eliminar el símbolo de moneda y los separadores de miles, y convertir a número
  const total = parseFloat(totalElement.textContent.replace(/[$.]/g, '').replace(/,/g, ''));
  const cambio = montoRecibido - total;
  
  const cambioElement = document.getElementById('cambio');
  if (cambio >= 0) {
    cambioElement.textContent = formatearPrecio(cambio);
    cambioElement.classList.remove('text-danger', 'bg-danger');
    cambioElement.classList.add('text-success', 'bg-light');
    cambioElement.style.fontWeight = 'bold';
    cambioElement.style.fontSize = '1.2em';
  } else {
    cambioElement.textContent = 'Monto insuficiente';
    cambioElement.classList.remove('text-success', 'bg-light');
    cambioElement.classList.add('text-danger', 'bg-danger');
    cambioElement.style.fontWeight = 'bold';
    cambioElement.style.fontSize = '1.2em';
  }

  // Si el método de pago es mixto, actualizar automáticamente el monto de transferencia
  const metodoPago = document.getElementById('metodoPago').value;
  if (metodoPago === 'mixto') {
    const montoTransferencia = total - montoRecibido;
    document.getElementById('montoTransferencia').value = montoTransferencia > 0 ? montoTransferencia : 0;
  }
}

// Función para alternar entre métodos de pago
function toggleMetodoPago() {
  const metodo = document.getElementById('metodoPago').value;
  const efectivoSection = document.getElementById('efectivoSection');
  const transferenciaSection = document.getElementById('transferenciaSection');
  const montoTransferenciaInput = document.getElementById('montoTransferencia');
  // Mostrar/ocultar secciones según el método
  if (metodo === 'efectivo') {
    efectivoSection.style.display = 'block';
    transferenciaSection.style.display = 'none';
  } else if (metodo === 'transferencia') {
    efectivoSection.style.display = 'none';
    transferenciaSection.style.display = 'block';
    // Ocultar monto por transferencia, mostrar solo número
    if (montoTransferenciaInput) montoTransferenciaInput.style.display = 'none';
  } else if (metodo === 'mixto') {
    efectivoSection.style.display = 'block';
    transferenciaSection.style.display = 'block';
    // Mostrar monto por transferencia
    if (montoTransferenciaInput) montoTransferenciaInput.style.display = '';
  } else if (metodo === 'credito') {
    efectivoSection.style.display = 'none';
    transferenciaSection.style.display = 'none';
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

  // Usar la variable global clientes
  clientes.push(nuevoCliente);
  guardarClientes();
  
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
  
  const idPedido = `REC-${contadorRecoger}`;
  const pedido = {
    tipo: 'recoger',
    numero: contadorRecoger,
    cliente: cliente.nombre,
    telefono: cliente.telefono,
    horaRecoger: '', // Dejar vacío o poner 'No especificada' si prefieres
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

  // Validar que haya cliente seleccionado para crédito
  if (metodoPago === 'credito' && !pedido.cliente) {
    alert('Debe seleccionar un cliente para realizar un pago a crédito');
    return;
  }

  // Calcular totales
  const subtotal = pedido.items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  const propina = parseFloat(document.getElementById('propina').value) || 0;
  const descuento = parseFloat(document.getElementById('descuento').value) || 0;
  const valorDomicilio = mesaSeleccionada.startsWith('DOM-') ? (parseFloat(document.getElementById('valorDomicilio').value) || 0) : 0;
  const propinaMonto = Math.round((subtotal * propina) / 100);
  const total = Math.round(subtotal + propinaMonto - descuento + valorDomicilio);

  // Validar montos para pago mixto
  if (metodoPago === 'mixto') {
    const montoEfectivo = parseFloat(document.getElementById('montoRecibido').value) || 0;
    const montoTransferencia = parseFloat(document.getElementById('montoTransferencia').value) || 0;
    const totalMixto = montoEfectivo + montoTransferencia;

    if (totalMixto !== total) {
      alert('La suma de los montos en efectivo y transferencia debe ser igual al total');
      return;
    }
  }

  // Crear objeto de factura
  const factura = {
    id: Date.now(),
    fecha: new Date().toISOString(),
    mesa: mesaSeleccionada,
    items: pedido.items,
    subtotal: subtotal,
    propina: propina,
    propinaMonto: propinaMonto,
    descuento: descuento,
    valorDomicilio: valorDomicilio,
    total: total,
    metodoPago: metodoPago,
    montoRecibido: metodoPago === 'efectivo' || metodoPago === 'mixto' ? parseFloat(document.getElementById('montoRecibido').value) : 0,
    montoTransferencia: metodoPago === 'transferencia' || metodoPago === 'mixto' ? parseFloat(document.getElementById('montoTransferencia').value) : 0,
    cambio: metodoPago === 'efectivo' || metodoPago === 'mixto' ? Math.round(parseFloat(document.getElementById('montoRecibido').value) - (metodoPago === 'mixto' ? parseFloat(document.getElementById('montoRecibido').value) : total)) : 0,
    numeroTransferencia: metodoPago === 'transferencia' || metodoPago === 'mixto' ? document.getElementById('numeroTransferencia').value : null,
    cliente: pedido.cliente || null,
    telefono: pedido.telefono || null,
    direccion: pedido.direccion || null,
    horaRecoger: pedido.horaRecoger || null,
    tipo: mesaSeleccionada.startsWith('DOM-') ? 'domicilio' : 
          mesaSeleccionada.startsWith('REC-') ? 'recoger' : 'mesa',
    estado: metodoPago === 'credito' ? 'pendiente' : 'pagado'
  };

  // Si es crédito, guardar en una lista separada de facturas pendientes
  if (metodoPago === 'credito') {
    const facturasPendientes = JSON.parse(localStorage.getItem('facturasPendientes') || '[]');
    facturasPendientes.push(factura);
    localStorage.setItem('facturasPendientes', JSON.stringify(facturasPendientes));
  }

  // Agregar al historial de ventas
  if (!Array.isArray(historialVentas)) {
    historialVentas = [];
  }
  historialVentas.push(factura);
  guardarHistorialVentas();

  // Obtener la ventana de impresión
  const ventana = obtenerVentanaImpresion();
  if (!ventana) {
    alert('No se pudo abrir la ventana de impresión. Por favor, verifique que los bloqueadores de ventanas emergentes estén desactivados.');
    return;
  }

  let tipoPedido = '';
  let infoAdicional = '';

  if (mesaSeleccionada.startsWith('DOM-')) {
    tipoPedido = 'Pedido a Domicilio';
    if (pedido.cliente) {
      infoAdicional = `
        <div class="border-top">
          <div class="mb-1">Cliente: ${pedido.cliente}</div>
          <div class="mb-1">Dir: ${pedido.direccion || 'No especificada'}</div>
          <div class="mb-1">Tel: ${pedido.telefono || 'No especificado'}</div>
        </div>
      `;
    }
  } else if (mesaSeleccionada.startsWith('REC-')) {
    tipoPedido = 'Pedido para Recoger';
    if (pedido.cliente) {
      infoAdicional = `
        <div class="border-top">
          <div class="mb-1">Cliente: ${pedido.cliente}</div>
          <div class="mb-1">Tel: ${pedido.telefono || 'No especificado'}</div>
          ${pedido.horaRecoger ? `<div class="mb-1">Hora: ${pedido.horaRecoger}</div>` : ''}
        </div>
      `;
    }
  }

  const contenidoRecibo = `
    <div class="logo-container">
      ${localStorage.getItem('logoNegocio') ? 
        `<img src="${localStorage.getItem('logoNegocio')}" alt="Logo">` : 
        ''}
    </div>

    <div class="header text-center">
      <h2 style="margin: 0; font-size: 14px;">RESTAURANTE</h2>
      ${tipoPedido ? `<div class="mb-1">${tipoPedido}</div>` : ''}
      <div class="mb-1">${new Date().toLocaleString()}</div>
      ${!mesaSeleccionada.startsWith('DOM-') && !mesaSeleccionada.startsWith('REC-') ? 
        `<div class="mb-1">Mesa: ${mesaSeleccionada}</div>` : ''}
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
        ${pedido.items.map(item => `
          <tr>
            <td>${item.nombre}</td>
            <td>${item.cantidad}</td>
            <td class="text-right">${formatearNumero(item.precio)}</td>
            <td class="text-right">${formatearNumero(item.precio * item.cantidad)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    <div class="border-top">
      <div class="mb-1">Subtotal: <span class="text-right">$ ${formatearNumero(subtotal)}</span></div>
      <div class="mb-1">Propina (${propina}%): <span class="text-right">$ ${formatearNumero(propinaMonto)}</span></div>
      <div class="mb-1">Descuento: <span class="text-right">$ ${formatearNumero(descuento)}</span></div>
      ${valorDomicilio > 0 ? `<div class="mb-1">Domicilio: <span class="text-right">$ ${formatearNumero(valorDomicilio)}</span></div>` : ''}
      <div class="mb-1 total-row"><strong>Total: $ ${formatearNumero(total)}</strong></div>
    </div>
    
    <div class="border-top">
      <div class="mb-1">Método de Pago: ${metodoPago}</div>
      ${metodoPago === 'efectivo' ? `
        <div class="mb-1">Recibido en Efectivo: $ ${formatearNumero(factura.montoRecibido)}</div>
        <div class="mb-1">Cambio: $ ${formatearNumero(factura.cambio)}</div>
      ` : ''}
      ${metodoPago === 'transferencia' ? `
        <div class="mb-1">N° Transferencia: ${factura.numeroTransferencia}</div>
        <div class="mb-1">Transferencia: $ ${formatearNumero(factura.montoTransferencia)}</div>
      ` : ''}
      ${metodoPago === 'mixto' ? `
        <div class="mb-1">Monto en Efectivo: $ ${formatearNumero(factura.montoRecibido)}</div>
        <div class="mb-1">Cambio: $ ${formatearNumero(factura.cambio)}</div>
        <div class="mb-1">N° Transferencia: ${factura.numeroTransferencia}</div>
        <div class="mb-1">Transferencia: $ ${formatearNumero(factura.montoTransferencia)}</div>
      ` : ''}
    </div>
    
    <div class="text-center mt-1">
      <div class="border-top">¡Gracias por su compra!</div>
      <div class="border-top">ToySoft POS</div>
    </div>
  `;

  // Esperar a que el documento esté listo
  setTimeout(() => {
    const contenidoDiv = ventana.document.getElementById('contenido');
    if (contenidoDiv) {
      contenidoDiv.innerHTML = contenidoRecibo;
      ventana.focus();
    }
  }, 100);

  // Cerrar el modal de pago
  bootstrap.Modal.getInstance(document.getElementById('modalPago')).hide();

  // Eliminar la mesa/pedido
  mesasActivas.delete(mesaSeleccionada);
  guardarMesas();
  actualizarMesasActivas();
  
  // Limpiar la vista actual
  document.getElementById('ordenCuerpo').innerHTML = '';
  document.getElementById('propina').value = '';
  document.getElementById('descuento').value = '';
  document.getElementById('valorDomicilio').value = '';
  document.getElementById('totalOrden').textContent = '$ 0';
  document.getElementById('desgloseTotal').innerHTML = '';
  document.getElementById('mesaActual').textContent = '-';
  mesaSeleccionada = null;
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
              width: 57mm;
              margin: 0;
              padding: 1mm;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .mb-1 { margin-bottom: 0.5mm; }
            .mt-1 { margin-top: 0.5mm; }
            table { 
              width: 100%;
              border-collapse: collapse;
              margin: 1mm 0;
              font-size: 14px;
            }
            th, td { 
              padding: 0.5mm;
              text-align: left;
              font-size: 14px;
            }
            .border-top { 
              border-top: 1px dashed #000;
              margin-top: 1mm;
              padding-top: 1mm;
            }
            .header {
              border-bottom: 1px dashed #000;
              padding-bottom: 1mm;
              margin-bottom: 1mm;
            }
            .total-row {
              font-weight: bold;
              font-size: 16px;
            }
            .botones-impresion {
              position: fixed;
              top: 10px;
              right: 10px;
              z-index: 1000;
              background: #fff;
              padding: 5px;
              border-radius: 5px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            }
            .botones-impresion button {
              margin: 0 5px;
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
            .logo-container {
              text-align: center;
              margin-bottom: 2mm;
            }
            .logo-container img {
              max-width: 100%;
              max-height: 120px;
            }
            @media print {
              .botones-impresion {
                display: none;
              }
              @page {
                margin: 0;
                size: 57mm auto;
              }
              body {
                width: 57mm;
              }
            }
          </style>
        </head>
        <body>
          <div class="botones-impresion">
            <button onclick="window.print()">Imprimir</button>
            <button onclick="window.close()">Cerrar</button>
          </div>
          <div id="contenido"></div>
        </body>
      </html>
    `;
    
    ventana.document.write(contenido);
    ventana.document.close();
  }
}

// Función para mostrar el modal de cierre diario
function mostrarModalCierreDiario() {
    try {
        console.log('Iniciando mostrarModalCierreDiario...');
        // Obtener ventas del día desde la clave 'ventas'
        const ventas = JSON.parse(localStorage.getItem('ventas')) || [];
        const hoy = new Date();
        const hoyStr = hoy.toISOString().slice(0, 10); // YYYY-MM-DD
        const ventasHoy = ventas.filter(v => {
            const fechaVenta = new Date(v.fecha);
            const fechaVentaStr = fechaVenta.toISOString().slice(0, 10);
            return fechaVentaStr === hoyStr;
        });
        // Calcular totales por método de pago
        let totalEfectivo = 0, totalTransferencia = 0, totalTarjeta = 0, totalCredito = 0, totalMixto = 0, totalVentas = 0;
        ventasHoy.forEach(v => {
            const total = parseFloat(v.total) || 0;
            const metodo = (v.metodoPago || '').toLowerCase();
            if (metodo === 'mixto') {
                const efectivoMixto = parseFloat(v.montoRecibido) || 0;
                const transferenciaMixto = parseFloat(v.montoTransferencia) || 0;
                totalMixto += total;
                totalEfectivo += efectivoMixto;
                totalTransferencia += transferenciaMixto;
            } else {
                switch (metodo) {
                    case 'efectivo':
                        totalEfectivo += total;
                        break;
                    case 'transferencia':
                        totalTransferencia += total;
                        break;
                    case 'tarjeta':
                        totalTarjeta += total;
                        break;
                    case 'crédito':
                        totalCredito += total;
                        break;
                }
            }
            totalVentas += total;
        });
        // Obtener gastos del día
        const gastos = JSON.parse(localStorage.getItem('gastos')) || [];
        const gastosHoy = gastos.filter(g => {
            const fechaGasto = new Date(g.fecha);
            const fechaGastoStr = fechaGasto.toISOString().slice(0, 10);
            return fechaGastoStr === hoyStr;
        });
        const totalGastos = gastosHoy.reduce((sum, g) => sum + (parseFloat(g.monto) || 0), 0);
        // Calcular balance final
        const balanceFinal = totalVentas - totalGastos;
        // Actualizar valores en el modal
        document.getElementById('totalVentasHoy').textContent = `$ ${totalVentas.toLocaleString()}`;
        document.getElementById('totalEfectivoHoy').textContent = `$ ${totalEfectivo.toLocaleString()}`;
        document.getElementById('totalTransferenciaHoy').textContent = `$ ${totalTransferencia.toLocaleString()}`;
        if(document.getElementById('totalTarjetaHoy')) document.getElementById('totalTarjetaHoy').textContent = `$ ${totalTarjeta.toLocaleString()}`;
        if(document.getElementById('totalCreditoHoy')) document.getElementById('totalCreditoHoy').textContent = `$ ${totalCredito.toLocaleString()}`;
        if(document.getElementById('totalMixtoHoy')) document.getElementById('totalMixtoHoy').textContent = `$ ${totalMixto.toLocaleString()}`;
        document.getElementById('totalGastosHoy').textContent = `$ ${totalGastos.toLocaleString()}`;
        document.getElementById('balanceFinal').textContent = `$ ${balanceFinal.toLocaleString()}`;
        // Actualizar detalles de créditos pendientes
        const creditosPendientes = ventasHoy.filter(v => (v.metodoPago || '').toLowerCase() === 'crédito');
        const detallesCreditos = document.getElementById('detallesCreditos');
        if (detallesCreditos) {
            detallesCreditos.innerHTML = creditosPendientes.map(credito => `
                <div class="mb-2">
                    <div>Cliente: ${credito.cliente || 'No especificado'}</div>
                    <div>Monto: $ ${credito.total.toLocaleString()}</div>
                    <div>Fecha: ${new Date(credito.fecha).toLocaleString()}</div>
                </div>
            `).join('') || '<div>No hay créditos pendientes</div>';
        }
        // Limpiar el campo de detalles
        document.getElementById('detallesCierre').value = '';
        // Mostrar el modal
        const modal = new bootstrap.Modal(document.getElementById('modalCierreDiario'));
        modal.show();
        console.log('Modal de cierre diario mostrado correctamente');
    } catch (error) {
        console.error('Error en mostrarModalCierreDiario:', error);
        alert('Error al mostrar el cierre diario: ' + error.message);
    }
}

function guardarCierreDiario() {
    try {
        const detalles = document.getElementById('detallesCierre').value;
        const fecha = new Date().toLocaleDateString();
        
        // Obtener datos actuales
        const cierres = JSON.parse(localStorage.getItem('cierresDiarios')) || [];
        
        // Obtener ventas del día
        const hoy = new Date();
        const hoyStr = hoy.toLocaleDateString();
        const ventasHoy = historialVentas.filter(v => {
            try {
                const fechaVenta = new Date(v.fecha);
                return fechaVenta.toLocaleDateString() === hoyStr;
            } catch (error) {
                console.error('Error al procesar fecha de venta:', error);
                return false;
            }
        });
        
        // Calcular totales
        const totalVentas = ventasHoy.reduce((sum, v) => sum + (v.total || 0), 0);
        const totalEfectivo = ventasHoy.filter(v => v.metodoPago === 'efectivo')
            .reduce((sum, v) => sum + (v.total || 0), 0);
        const totalTransferencia = ventasHoy.filter(v => v.metodoPago === 'transferencia')
            .reduce((sum, v) => sum + (v.total || 0), 0);
        const totalTarjeta = ventasHoy.filter(v => v.metodoPago === 'tarjeta')
            .reduce((sum, v) => sum + (v.total || 0), 0);
        const totalCredito = ventasHoy.filter(v => v.metodoPago === 'credito')
            .reduce((sum, v) => sum + (v.total || 0), 0);
        
        // Obtener gastos del día
        const gastos = JSON.parse(localStorage.getItem('gastos')) || [];
        const gastosHoy = gastos.filter(g => {
            try {
                return new Date(g.fecha).toLocaleDateString() === hoyStr;
            } catch (error) {
                console.error('Error al procesar fecha de gasto:', error);
                return false;
            }
        });
        const totalGastos = gastosHoy.reduce((sum, g) => sum + (g.monto || 0), 0);
        
        // Calcular balance final
        const balanceFinal = totalVentas - totalCredito - totalGastos;
        
        // Crear nuevo cierre
        const nuevoCierre = {
            id: Date.now(),
            fecha,
            totalVentas,
            totalEfectivo,
            totalTransferencia,
            totalTarjeta,
            totalCredito,
            totalGastos,
            balanceFinal,
            detalles,
            creditosPendientes: ventasHoy.filter(v => v.metodoPago === 'credito').map(v => ({
                cliente: v.cliente,
                monto: v.total,
                fecha: v.fecha
            }))
        };
        
        // Verificar si ya existe un cierre para hoy
        const cierreExistente = cierres.findIndex(c => c.fecha === fecha);
        if (cierreExistente !== -1) {
            if (!confirm('Ya existe un cierre para hoy. ¿Desea sobrescribirlo?')) {
                return;
            }
            cierres[cierreExistente] = nuevoCierre;
        } else {
            cierres.push(nuevoCierre);
        }
        
        // Guardar en localStorage
        localStorage.setItem('cierresDiarios', JSON.stringify(cierres));
        
        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalCierreDiario'));
        modal.hide();
        
        // Mostrar mensaje de éxito
        alert('Cierre diario guardado exitosamente');
    } catch (error) {
        console.error('Error en guardarCierreDiario:', error);
        alert('Error al guardar el cierre diario: ' + error.message);
    }
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
        // Obtener ventas del día desde la clave 'ventas'
        const ventas = JSON.parse(localStorage.getItem('ventas')) || [];
        const hoy = new Date();
        const hoyStr = hoy.toISOString().slice(0, 10); // YYYY-MM-DD
        const ventasHoy = ventas.filter(v => {
            const fechaVenta = new Date(v.fecha);
            const fechaVentaStr = fechaVenta.toISOString().slice(0, 10);
            return fechaVentaStr === hoyStr;
        });
        // Calcular totales por método de pago (igual que en el modal)
        let totalEfectivo = 0, totalTransferencia = 0, totalTarjeta = 0, totalCredito = 0, totalMixto = 0, totalVentas = 0;
        ventasHoy.forEach(v => {
            const total = parseFloat(v.total) || 0;
            const metodo = (v.metodoPago || '').toLowerCase();
            if (metodo === 'mixto') {
                const efectivoMixto = parseFloat(v.montoRecibido) || 0;
                const transferenciaMixto = parseFloat(v.montoTransferencia) || 0;
                totalMixto += total;
                totalEfectivo += efectivoMixto;
                totalTransferencia += transferenciaMixto;
            } else {
                switch (metodo) {
                    case 'efectivo':
                        totalEfectivo += total;
                        break;
                    case 'transferencia':
                        totalTransferencia += total;
                        break;
                    case 'tarjeta':
                        totalTarjeta += total;
                        break;
                    case 'crédito':
                        totalCredito += total;
                        break;
                }
            }
            totalVentas += total;
        });
        // Obtener gastos del día
        const gastos = JSON.parse(localStorage.getItem('gastos')) || [];
        const gastosHoy = gastos.filter(g => {
            const fechaGasto = new Date(g.fecha);
            const fechaGastoStr = fechaGasto.toISOString().slice(0, 10);
            return fechaGastoStr === hoyStr;
        });
        const totalGastos = gastosHoy.reduce((sum, g) => sum + (parseFloat(g.monto) || 0), 0);
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
                            width: 57mm;
                            margin: 0;
                            padding: 1mm;
                        }
                        .text-center { text-align: center; }
                        .text-right { text-align: right; }
                        .mb-1 { margin-bottom: 0.5mm; }
                        .mt-1 { margin-top: 0.5mm; }
                        .border-top { 
                            border-top: 1px dashed #000;
                            margin-top: 1mm;
                            padding-top: 1mm;
                        }
                        .header {
                            border-bottom: 1px dashed #000;
                            padding-bottom: 1mm;
                            margin-bottom: 1mm;
                        }
                        .total-row {
                            font-weight: bold;
                            font-size: 16px;
                        }
                        .botones-impresion {
                            position: fixed;
                            top: 10px;
                            right: 10px;
                            z-index: 1000;
                            background: #fff;
                            padding: 5px;
                            border-radius: 5px;
                            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                        }
                        .botones-impresion button {
                            margin: 0 5px;
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
                        .logo-container {
                            text-align: center;
                            margin-bottom: 2mm;
                        }
                        .logo-container img {
                            max-width: 100%;
                            max-height: 120px;
                        }
                        @media print {
                            .botones-impresion {
                                display: none;
                            }
                            @page {
                                margin: 0;
                                size: 57mm auto;
                            }
                            body {
                                width: 57mm;
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
                        <div class="mb-1">${hoyStr}</div>
                    </div>
                    
                    <div class="border-top">
                        <div class="mb-1">Total Ventas: $ ${totalVentas.toLocaleString()}</div>
                        <div class="mb-1">- Efectivo: $ ${totalEfectivo.toLocaleString()}</div>
                        <div class="mb-1">- Transferencia: $ ${totalTransferencia.toLocaleString()}</div>
                        <div class="mb-1">- Tarjeta: $ ${totalTarjeta.toLocaleString()}</div>
                        <div class="mb-1">- Crédito: $ ${totalCredito.toLocaleString()}</div>
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

                    <div class="border-top mt-1">
                        <div class="mb-1">Créditos Pendientes:</div>
                        ${ventasHoy.filter(v => (v.metodoPago || '').toLowerCase() === 'crédito').map(credito => `
                            <div class="mb-1">- ${credito.cliente || 'No especificado'}: $ ${credito.total.toLocaleString()}</div>
                        `).join('') || '<div class="mb-1">No hay créditos pendientes</div>'}
                    </div>
                    
                    <div class="text-center mt-1">
                        <div class="border-top">¡Fin del Balance!</div>
                        <div class="border-top">ToySoft POS</div>
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
  
  document.getElementById('valorDomicilio').addEventListener('input', () => {
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

// Función para generar recibo preliminar
function generarReciboPreliminar() {
  if (!mesaSeleccionada || !mesasActivas.has(mesaSeleccionada)) {
    alert('Por favor, seleccione una mesa con productos');
    return;
  }

  const pedido = mesasActivas.get(mesaSeleccionada);
  if (!pedido || !pedido.items || pedido.items.length === 0) {
    alert('No hay productos para generar recibo');
    return;
  }

  // Calcular totales
  const subtotal = pedido.items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  const propina = parseFloat(document.getElementById('propina').value) || 0;
  const descuento = parseFloat(document.getElementById('descuento').value) || 0;
  const valorDomicilio = mesaSeleccionada.startsWith('DOM-') ? (parseFloat(document.getElementById('valorDomicilio').value) || 0) : 0;
  const propinaMonto = Math.round((subtotal * propina) / 100);
  const total = Math.round(subtotal + propinaMonto - descuento + valorDomicilio);

  // Obtener la ventana de impresión
  const ventanaPrevia = obtenerVentanaImpresion();
  if (!ventanaPrevia) {
    alert('No se pudo abrir la ventana de impresión. Por favor, verifique que los bloqueadores de ventanas emergentes estén desactivados.');
    return;
  }

  // Determinar tipo de pedido e información adicional
  let tipoPedido = '';
  let infoAdicional = '';

  if (mesaSeleccionada.startsWith('DOM-')) {
    tipoPedido = 'Pedido a Domicilio';
    if (pedido.cliente) {
      infoAdicional = `
        <div class="border-top">
          <div class="mb-1">Cliente: ${pedido.cliente}</div>
          <div class="mb-1">Dir: ${pedido.direccion || 'No especificada'}</div>
          <div class="mb-1">Tel: ${pedido.telefono || 'No especificado'}</div>
        </div>
      `;
    }
  } else if (mesaSeleccionada.startsWith('REC-')) {
    tipoPedido = 'Pedido para Recoger';
    if (pedido.cliente) {
      infoAdicional = `
        <div class="border-top">
          <div class="mb-1">Cliente: ${pedido.cliente}</div>
          <div class="mb-1">Tel: ${pedido.telefono || 'No especificado'}</div>
          ${pedido.horaRecoger ? `<div class="mb-1">Hora: ${pedido.horaRecoger}</div>` : ''}
        </div>
      `;
    }
  }

  const contenidoRecibo = `
    <div class="logo-container">
      ${localStorage.getItem('logoNegocio') ? 
        `<img src="${localStorage.getItem('logoNegocio')}" alt="Logo">` : 
        ''}
    </div>

    <div class="header text-center">
      <h2 style="margin: 0; font-size: 14px;">RESTAURANTE</h2>
      <div class="mb-1">RECIBO PRELIMINAR</div>
      ${tipoPedido ? `<div class="mb-1">${tipoPedido}</div>` : ''}
      <div class="mb-1">${new Date().toLocaleString()}</div>
      ${!mesaSeleccionada.startsWith('DOM-') && !mesaSeleccionada.startsWith('REC-') ? 
        `<div class="mb-1">Mesa: ${mesaSeleccionada}</div>` : ''}
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
        ${pedido.items.map(item => `
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
      <div class="mb-1">Subtotal: <span class="text-right">$ ${formatearNumero(subtotal)}</span></div>
      <div class="mb-1">Propina (${propina}%): <span class="text-right">$ ${formatearNumero(propinaMonto)}</span></div>
      <div class="mb-1">Descuento: <span class="text-right">$ ${formatearNumero(descuento)}</span></div>
      ${valorDomicilio > 0 ? `<div class="mb-1">Domicilio: <span class="text-right">$ ${formatearNumero(valorDomicilio)}</span></div>` : ''}
      <div class="mb-1 total-row"><strong>Total: $ ${formatearNumero(total)}</strong></div>
    </div>
    
    <div class="text-center mt-1">
      <div class="border-top">RECIBO PRELIMINAR - NO VÁLIDO COMO FACTURA</div>
      <div class="border-top">ToySoft POS</div>
    </div>
  `;

  // Esperar a que el documento esté listo
  setTimeout(() => {
    const contenidoDiv = ventanaPrevia.document.getElementById('contenido');
    if (contenidoDiv) {
      contenidoDiv.innerHTML = contenidoRecibo;
      ventanaPrevia.focus();
    }
  }, 100);
}

function imprimirBalancePorPeriodo(tipoPeriodo) {
    try {
        // Obtener ventas desde la clave 'ventas'
        const ventas = JSON.parse(localStorage.getItem('ventas')) || [];
        const hoy = new Date();
        let fechaInicio, fechaFin;
        // Determinar el rango de fechas según el tipo de período
        switch(tipoPeriodo) {
            case 'semanal':
                fechaInicio = new Date(hoy);
                fechaInicio.setDate(hoy.getDate() - hoy.getDay() + 1);
                fechaInicio.setHours(0, 0, 0, 0);
                fechaFin = new Date(fechaInicio);
                fechaFin.setDate(fechaInicio.getDate() + 6);
                fechaFin.setHours(23, 59, 59, 999);
                break;
            case 'mensual':
                fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
                fechaInicio.setHours(0, 0, 0, 0);
                fechaFin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
                fechaFin.setHours(23, 59, 59, 999);
                break;
            case 'anual':
                fechaInicio = new Date(hoy.getFullYear(), 0, 1);
                fechaInicio.setHours(0, 0, 0, 0);
                fechaFin = new Date(hoy.getFullYear(), 11, 31);
                fechaFin.setHours(23, 59, 59, 999);
                break;
            default:
                throw new Error('Tipo de período no válido');
        }
        // Filtrar ventas por rango de fechas
        const ventasFiltradas = ventas.filter(v => {
            const fechaVenta = new Date(v.fecha);
            return fechaVenta >= fechaInicio && fechaVenta <= fechaFin;
        });
        // Calcular totales por método de pago (igual que en el balance diario)
        let totalEfectivo = 0, totalTransferencia = 0, totalTarjeta = 0, totalCredito = 0, totalMixto = 0, totalVentas = 0;
        ventasFiltradas.forEach(v => {
            const total = parseFloat(v.total) || 0;
            const metodo = (v.metodoPago || '').toLowerCase();
            if (metodo === 'mixto') {
                const efectivoMixto = parseFloat(v.montoRecibido) || 0;
                const transferenciaMixto = parseFloat(v.montoTransferencia) || 0;
                totalMixto += total;
                totalEfectivo += efectivoMixto;
                totalTransferencia += transferenciaMixto;
            } else {
                switch (metodo) {
                    case 'efectivo':
                        totalEfectivo += total;
                        break;
                    case 'transferencia':
                        totalTransferencia += total;
                        break;
                    case 'tarjeta':
                        totalTarjeta += total;
                        break;
                    case 'crédito':
                        totalCredito += total;
                        break;
                }
            }
            totalVentas += total;
        });
        // Obtener gastos del período
        const gastos = JSON.parse(localStorage.getItem('gastos')) || [];
        const gastosFiltrados = gastos.filter(gasto => {
            const fechaGasto = new Date(gasto.fecha);
            return fechaGasto >= fechaInicio && fechaGasto <= fechaFin;
        });
        const totalGastos = gastosFiltrados.reduce((sum, g) => sum + (parseFloat(g.monto) || 0), 0);
        // Calcular balance final
        const balanceFinal = totalVentas - totalGastos;
        // Formatear fechas para mostrar
        const formatoFecha = (fecha) => {
            return fecha.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        };
        const ventana = obtenerVentanaImpresion();
        const contenido = `
            <html>
                <head>
                    <title>Balance ${tipoPeriodo.charAt(0).toUpperCase() + tipoPeriodo.slice(1)}</title>
                    <style>
                        body { 
                            font-family: monospace;
                            font-size: 14px;
                            width: 57mm;
                            margin: 0;
                            padding: 1mm;
                        }
                        .text-center { text-align: center; }
                        .text-right { text-align: right; }
                        .mb-1 { margin-bottom: 0.5mm; }
                        .mt-1 { margin-top: 0.5mm; }
                        .border-top { 
                            border-top: 1px dashed #000;
                            margin-top: 1mm;
                            padding-top: 1mm;
                        }
                        .header {
                            border-bottom: 1px dashed #000;
                            padding-bottom: 1mm;
                            margin-bottom: 1mm;
                        }
                        .total-row {
                            font-weight: bold;
                            font-size: 16px;
                        }
                        .botones-impresion {
                            position: fixed;
                            top: 10px;
                            right: 10px;
                            z-index: 1000;
                            background: #fff;
                            padding: 5px;
                            border-radius: 5px;
                            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                        }
                        .botones-impresion button {
                            margin: 0 5px;
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
                        .logo-container {
                            text-align: center;
                            margin-bottom: 2mm;
                        }
                        .logo-container img {
                            max-width: 100%;
                            max-height: 120px;
                        }
                        @media print {
                            .botones-impresion {
                                display: none;
                            }
                            @page {
                                margin: 0;
                                size: 57mm auto;
                            }
                            body {
                                width: 57mm;
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
                        <h2 style="margin: 0; font-size: 14px;">BALANCE ${tipoPeriodo.toUpperCase()}</h2>
                        <div class="mb-1">Del ${formatoFecha(fechaInicio)}</div>
                        <div class="mb-1">Al ${formatoFecha(fechaFin)}</div>
                    </div>
                    <div class="border-top">
                        <div class="mb-1">Total Ventas: $ ${totalVentas.toLocaleString()}</div>
                        <div class="mb-1">- Efectivo: $ ${totalEfectivo.toLocaleString()}</div>
                        <div class="mb-1">- Transferencia: $ ${totalTransferencia.toLocaleString()}</div>
                        <div class="mb-1">- Tarjeta: $ ${totalTarjeta.toLocaleString()}</div>
                        <div class="mb-1">- Crédito: $ ${totalCredito.toLocaleString()}</div>
                    </div>
                    <div class="border-top">
                        <div class="mb-1">Total Gastos: $ ${totalGastos.toLocaleString()}</div>
                    </div>
                    <div class="border-top">
                        <div class="mb-1 total-row">Balance Final: $ ${balanceFinal.toLocaleString()}</div>
                    </div>
                    <div class="border-top mt-1">
                        <div class="mb-1">Detalle de Gastos:</div>
                        ${gastosFiltrados.map(gasto => `
                            <div class="mb-1">- ${gasto.descripcion}: $ ${gasto.monto.toLocaleString()}</div>
                        `).join('')}
                    </div>
                    <div class="border-top mt-1">
                        <div class="mb-1">Créditos Pendientes:</div>
                        ${ventasFiltradas.filter(v => (v.metodoPago || '').toLowerCase() === 'crédito').map(credito => `
                            <div class="mb-1">- ${credito.cliente || 'No especificado'}: $ ${credito.total.toLocaleString()}</div>
                        `).join('') || '<div class="mb-1">No hay créditos pendientes</div>'}
                    </div>
                    <div class="text-center mt-1">
                        <div class="border-top">¡Fin del Balance!</div>
                        <div class="border-top">ToySoft POS</div>
                    </div>
                </body>
            </html>
        `;
        ventana.document.write(contenido);
        ventana.document.close();
    } catch (error) {
        console.error('Error al imprimir balance:', error);
        alert('Error al generar el balance: ' + error.message);
    }
}
  