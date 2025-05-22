// Variables globales
window.categorias = JSON.parse(localStorage.getItem('categorias')) || [];
window.productos = JSON.parse(localStorage.getItem('productos')) || [];
window.ventas = JSON.parse(localStorage.getItem('ventas')) || [];
window.clientes = JSON.parse(localStorage.getItem('clientes')) || [];

// Variables para backup automático
const MAX_BACKUPS = 3; // Reducido a 3 backups
const BACKUP_INTERVAL = 60 * 60 * 1000; // 1 hora en lugar de 30 minutos
const MAX_VENTAS_BACKUP = 100; // Solo guardar las últimas 100 ventas en el backup

// Variables globales para paginación
let paginaActualClientes = 1;
let paginaActualProductos = 1;
let clientesPorPagina = 10;
let productosPorPagina = 10;
let clientesFiltrados = [];
let productosFiltrados = [];

// Funciones de Backup y Restauración
function crearBackup() {
    // Crear una copia de las ventas limitada a las últimas MAX_VENTAS_BACKUP
    const ventasLimitadas = window.ventas.slice(-MAX_VENTAS_BACKUP);
    
    const datos = {
        categorias: window.categorias,
        productos: window.productos,
        clientes: window.clientes,
        ventas: ventasLimitadas,
        fecha: new Date().toISOString()
    };
    return datos;
}

function guardarBackupAutomatico() {
    try {
        const backups = JSON.parse(localStorage.getItem('backups_automaticos')) || [];
        const nuevoBackup = crearBackup();
        
        // Verificar el tamaño del nuevo backup
        const backupSize = new Blob([JSON.stringify(nuevoBackup)]).size;
        const maxSize = 2 * 1024 * 1024; // 2MB límite
        
        if (backupSize > maxSize) {
            console.warn('El backup es demasiado grande, se omitirá');
            return;
        }
        
        backups.unshift(nuevoBackup);
        if (backups.length > MAX_BACKUPS) {
            backups.pop();
        }
        
        localStorage.setItem('backups_automaticos', JSON.stringify(backups));
    } catch (error) {
        console.error('Error al guardar backup automático:', error);
    }
}

function iniciarBackupAutomatico() {
    // Realizar un backup inicial
    guardarBackupAutomatico();
    
    // Configurar el intervalo
    setInterval(guardarBackupAutomatico, BACKUP_INTERVAL);
}

function exportarDatos() {
    const datos = crearBackup();
    const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_pos_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function validarDatos(datos) {
    const errores = [];
    
    // Validar estructura básica
    if (!datos.categorias || !Array.isArray(datos.categorias)) errores.push('Categorías inválidas');
    if (!datos.productos || !Array.isArray(datos.productos)) errores.push('Productos inválidos');
    if (!datos.clientes || !Array.isArray(datos.clientes)) errores.push('Clientes inválidos');
    if (!datos.ventas || !Array.isArray(datos.ventas)) errores.push('Ventas inválidas');
    
    // Validar datos de productos
    if (datos.productos) {
        datos.productos.forEach((producto, index) => {
            if (!producto.nombre || !producto.precio || !producto.categoria) {
                errores.push(`Producto ${index + 1} incompleto`);
            }
        });
    }
    
    // Validar datos de clientes
    if (datos.clientes) {
        datos.clientes.forEach((cliente, index) => {
            if (!cliente.nombre || !cliente.telefono) {
                errores.push(`Cliente ${index + 1} incompleto`);
            }
        });
    }
    
    return errores;
}

function mostrarResumenDatos(datos) {
    const resumen = `
        Categorías: ${datos.categorias.length}
        Productos: ${datos.productos.length}
        Clientes: ${datos.clientes.length}
        Ventas: ${datos.ventas.length}
        Fecha: ${new Date(datos.fecha).toLocaleString()}
    `;
    return resumen;
}

function importarDatos(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const datos = JSON.parse(e.target.result);
            
            // Validar datos
            const errores = validarDatos(datos);
            if (errores.length > 0) {
                throw new Error('Errores en los datos:\n' + errores.join('\n'));
            }

            // Mostrar resumen y pedir confirmación
            const resumen = mostrarResumenDatos(datos);
            if (confirm(`¿Estás seguro de que deseas restaurar estos datos?\n\n${resumen}\n\nSe sobrescribirán los datos actuales.`)) {
                // Restaurar datos
                window.categorias = datos.categorias;
                window.productos = datos.productos;
                window.clientes = datos.clientes;
                window.ventas = datos.ventas;

                // Guardar en localStorage
                localStorage.setItem('categorias', JSON.stringify(window.categorias));
                localStorage.setItem('productos', JSON.stringify(window.productos));
                localStorage.setItem('clientes', JSON.stringify(window.clientes));
                localStorage.setItem('ventas', JSON.stringify(window.ventas));

                // Recargar la interfaz
                cargarCategorias();
                cargarProductos();
                cargarClientes();
                cargarVentas();

                alert('Datos restaurados exitosamente');
            }
        } catch (error) {
            alert('Error al importar los datos: ' + error.message);
        }
    };
    reader.readAsText(file);
}

function mostrarBackupsAutomaticos() {
    const backups = JSON.parse(localStorage.getItem('backups_automaticos')) || [];
    if (backups.length === 0) {
        alert('No hay backups automáticos disponibles');
        return;
    }

    const opciones = backups.map((backup, index) => {
        const fecha = new Date(backup.fecha).toLocaleString();
        return `${index + 1}. ${fecha} (${backup.productos.length} productos, ${backup.clientes.length} clientes)`;
    }).join('\n');

    const seleccion = prompt(`Seleccione un backup para restaurar (1-${backups.length}):\n\n${opciones}`);
    const indice = parseInt(seleccion) - 1;

    if (indice >= 0 && indice < backups.length) {
        const backup = backups[indice];
        const resumen = mostrarResumenDatos(backup);
        
        if (confirm(`¿Restaurar este backup?\n\n${resumen}`)) {
            window.categorias = backup.categorias;
            window.productos = backup.productos;
            window.clientes = backup.clientes;
            window.ventas = backup.ventas;

            localStorage.setItem('categorias', JSON.stringify(window.categorias));
            localStorage.setItem('productos', JSON.stringify(window.productos));
            localStorage.setItem('clientes', JSON.stringify(window.clientes));
            localStorage.setItem('ventas', JSON.stringify(window.ventas));

            cargarCategorias();
            cargarProductos();
            cargarClientes();
            cargarVentas();

            alert('Backup restaurado exitosamente');
        }
    }
}

// Inicialización
window.onload = function() {
    console.log('Inicializando admon.js...');
    console.log('Categorías:', window.categorias);
    console.log('Productos:', window.productos);
    console.log('Clientes:', window.clientes);
    
    cargarCategorias();
    cargarProductos();
    cargarClientes();
    cargarVentas();
    
    // Iniciar backup automático
    iniciarBackupAutomatico();
};

// Funciones para Categorías
function agregarCategoria() {
    console.log('Intentando agregar categoría...');
    const inputCategoria = document.getElementById('nuevaCategoria');
    if (!inputCategoria) {
        console.error('No se encontró el input de categoría');
        return;
    }

    const nombre = inputCategoria.value.trim();
    if (!nombre) {
        alert('Por favor ingrese un nombre para la categoría');
        return;
    }

    if (window.categorias.includes(nombre)) {
        alert('Esta categoría ya existe');
        return;
    }

    window.categorias.push(nombre);
    localStorage.setItem('categorias', JSON.stringify(window.categorias));
    cargarCategorias();
    inputCategoria.value = '';
    console.log('Categoría agregada:', nombre);
}

function cargarCategorias() {
    console.log('Cargando categorías...');
    const listaCategorias = document.getElementById('listaCategorias');
    const selectCategoria = document.getElementById('categoriaProducto');
    
    if (!listaCategorias || !selectCategoria) {
        console.error('No se encontraron los elementos para cargar categorías');
        return;
    }

    listaCategorias.innerHTML = '';
    selectCategoria.innerHTML = '<option value="">Seleccionar categoría</option>';
    
    window.categorias.forEach(categoria => {
        // Lista de categorías
        const div = document.createElement('div');
        div.className = 'd-flex align-items-center mb-2';
        div.innerHTML = `
            <div class="form-check me-3">
                <input class="form-check-input checkbox-alerta" type="checkbox" value="${categoria}" id="cat_${categoria}">
                <label class="form-check-label" for="cat_${categoria}">${categoria}</label>
            </div>
            <button class="btn btn-sm btn-outline-info ms-auto" onclick="modificarCategoria('${categoria}')">Modificar</button>
        `;
        listaCategorias.appendChild(div);

        // Select de categorías
        const option = document.createElement('option');
        option.value = categoria;
        option.textContent = categoria;
        selectCategoria.appendChild(option);
    });
    console.log('Categorías cargadas:', window.categorias);
}

// Funciones para Productos
function agregarProducto() {
    console.log('Intentando agregar producto...');
    const nombre = document.getElementById('nombreProducto').value.trim();
    const precio = parseFloat(document.getElementById('precioProducto').value);
    const categoria = document.getElementById('categoriaProducto').value;

    if (!nombre || isNaN(precio) || !categoria) {
        alert('Por favor complete todos los campos');
        return;
    }

    const producto = {
        id: Date.now(),
        nombre: nombre,
        precio: precio,
        categoria: categoria
    };

    window.productos.push(producto);
    localStorage.setItem('productos', JSON.stringify(window.productos));
    cargarProductos();
    
    // Limpiar campos
    document.getElementById('nombreProducto').value = '';
    document.getElementById('precioProducto').value = '';
    document.getElementById('categoriaProducto').value = '';
    console.log('Producto agregado:', producto);
}

function cargarProductos() {
    console.log('Cargando productos...');
    const listaProductos = document.getElementById('listaProductos');
    if (!listaProductos) {
        console.error('No se encontró el elemento para cargar productos');
        return;
    }

    // Usar productos filtrados si hay búsqueda, sino usar todos los productos
    const productosAMostrar = productosFiltrados.length > 0 ? productosFiltrados : window.productos;
    
    // Calcular paginación
    const inicio = (paginaActualProductos - 1) * productosPorPagina;
    const fin = inicio + productosPorPagina;
    const productosPaginados = productosAMostrar.slice(inicio, fin);

    listaProductos.innerHTML = '';

    productosPaginados.forEach(producto => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="checkbox" class="form-check-input checkbox-alerta" value="${producto.id}"></td>
            <td>${producto.nombre}</td>
            <td>$${producto.precio}</td>
            <td>${producto.categoria}</td>
            <td>
                <button class="btn btn-sm btn-outline-info" onclick="modificarProducto(${producto.id})">Modificar</button>
            </td>
        `;
        listaProductos.appendChild(tr);
    });

    // Generar paginación
    const totalPaginas = Math.ceil(productosAMostrar.length / productosPorPagina);
    generarPaginacion('paginacionProductos', totalPaginas, paginaActualProductos, cambiarPaginaProductos);
}

// Funciones para Clientes
function agregarCliente() {
    const documento = document.getElementById('documentoCliente').value.trim();
    const nombre = document.getElementById('nombreCliente').value.trim();
    const apellido = document.getElementById('apellidoCliente').value.trim();
    const telefono = document.getElementById('telefonoCliente').value.trim();
    const direccion = document.getElementById('direccionCliente').value.trim();
    const correo = document.getElementById('correoCliente').value.trim();

    if (!documento || !nombre || !apellido || !telefono) {
        alert('Por favor complete todos los campos obligatorios (Documento, Nombre, Apellido y Teléfono)');
        return;
    }

    const nuevoCliente = {
        id: Date.now(),
        documento,
        nombre,
        apellido,
        telefono,
        direccion,
        correo
    };

    window.clientes.push(nuevoCliente);
    localStorage.setItem('clientes', JSON.stringify(window.clientes));
    cargarClientes();

    // Limpiar campos
    document.getElementById('documentoCliente').value = '';
    document.getElementById('nombreCliente').value = '';
    document.getElementById('apellidoCliente').value = '';
    document.getElementById('telefonoCliente').value = '';
    document.getElementById('direccionCliente').value = '';
    document.getElementById('correoCliente').value = '';
}

function cargarClientes() {
    const tbody = document.getElementById('listaClientes');
    if (!tbody) return;

    const inicio = (paginaActualClientes - 1) * clientesPorPagina;
    const fin = inicio + clientesPorPagina;
    const clientesAMostrar = clientesFiltrados.slice(inicio, fin);

    tbody.innerHTML = '';
    clientesAMostrar.forEach(cliente => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="checkbox" value="${cliente.id}"></td>
            <td>${cliente.documento}</td>
            <td>${cliente.nombre}</td>
            <td>${cliente.apellido}</td>
            <td>${cliente.telefono}</td>
            <td>${cliente.direccion || '-'}</td>
            <td>${cliente.correo || '-'}</td>
            <td>
                <button class="btn btn-sm btn-info" onclick="modificarCliente(${cliente.id})">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    const totalPaginas = Math.ceil(clientesFiltrados.length / clientesPorPagina);
    generarPaginacion('paginacionClientes', totalPaginas, paginaActualClientes, cambiarPaginaClientes);
}

// Funciones para Ventas
function cargarVentas() {
    console.log('Cargando ventas...');
    const tbody = document.getElementById('historialVentas');
    if (!tbody) {
        console.error('No se encontró el elemento para cargar ventas');
        return;
    }

    tbody.innerHTML = '';

    window.ventas.forEach(venta => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${new Date(venta.fecha).toLocaleString()}</td>
            <td>${venta.mesa}</td>
            <td>$${venta.total}</td>
            <td>$${venta.propina}</td>
            <td>$${venta.descuento}</td>
            <td>$${venta.totalFinal}</td>
        `;
        tbody.appendChild(tr);
    });
    console.log('Ventas cargadas:', window.ventas);
}

// Funciones de eliminación
function eliminarCategoria() {
    const checkboxes = document.querySelectorAll('#listaCategorias input[type="checkbox"]:checked');
    if (checkboxes.length === 0) {
        alert('Por favor seleccione al menos una categoría para eliminar');
        return;
    }

    const categoriasAEliminar = Array.from(checkboxes).map(cb => cb.value);
    const confirmacion = confirm(`¿Está seguro que desea eliminar ${categoriasAEliminar.length} categoría(s)?`);

    if (confirmacion) {
        window.categorias = window.categorias.filter(c => !categoriasAEliminar.includes(c));
        localStorage.setItem('categorias', JSON.stringify(window.categorias));
        cargarCategorias();
    }
}

function eliminarProducto() {
    const checkboxes = document.querySelectorAll('#listaProductos input[type="checkbox"]:checked');
    if (checkboxes.length === 0) {
        alert('Por favor seleccione al menos un producto para eliminar');
        return;
    }

    const productosAEliminar = Array.from(checkboxes).map(cb => parseInt(cb.value));
    const confirmacion = confirm(`¿Está seguro que desea eliminar ${productosAEliminar.length} producto(s)?`);

    if (confirmacion) {
        window.productos = window.productos.filter(p => !productosAEliminar.includes(p.id));
        localStorage.setItem('productos', JSON.stringify(window.productos));
        cargarProductos();
    }
}

function eliminarCliente() {
    const checkboxes = document.querySelectorAll('#listaClientes input[type="checkbox"]:checked');
    if (checkboxes.length === 0) {
        alert('Por favor seleccione al menos un cliente para eliminar');
        return;
    }

    const clientesAEliminar = Array.from(checkboxes).map(cb => parseInt(cb.value));
    const confirmacion = confirm(`¿Está seguro que desea eliminar ${clientesAEliminar.length} cliente(s)?`);

    if (confirmacion) {
        window.clientes = window.clientes.filter(c => !clientesAEliminar.includes(c.id));
        localStorage.setItem('clientes', JSON.stringify(window.clientes));
        cargarClientes();
    }
}

// Funciones de modificación
function modificarCliente(id) {
    const cliente = window.clientes.find(c => c.id === id);
    if (!cliente) return;

    const nuevoDocumento = prompt('Documento:', cliente.documento);
    if (nuevoDocumento === null) return;

    const nuevoNombre = prompt('Nombre:', cliente.nombre);
    if (nuevoNombre === null) return;

    const nuevoApellido = prompt('Apellido:', cliente.apellido);
    if (nuevoApellido === null) return;

    const nuevoTelefono = prompt('Teléfono:', cliente.telefono);
    if (nuevoTelefono === null) return;

    const nuevaDireccion = prompt('Dirección:', cliente.direccion || '');
    if (nuevaDireccion === null) return;

    const nuevoCorreo = prompt('Correo electrónico (opcional):', cliente.correo || '');
    if (nuevoCorreo === null) return;

    if (!nuevoDocumento || !nuevoNombre || !nuevoApellido || !nuevoTelefono) {
        alert('Los campos Documento, Nombre, Apellido y Teléfono son obligatorios');
        return;
    }

    cliente.documento = nuevoDocumento;
    cliente.nombre = nuevoNombre;
    cliente.apellido = nuevoApellido;
    cliente.telefono = nuevoTelefono;
    cliente.direccion = nuevaDireccion;
    cliente.correo = nuevoCorreo;

    localStorage.setItem('clientes', JSON.stringify(window.clientes));
    cargarClientes();
}

function modificarCategoria(nombreActual) {
    const modal = new bootstrap.Modal(document.getElementById('modalModificarCategoria'));
    const categoriaActualInput = document.getElementById('categoriaActualModificar');
    const nombreInput = document.getElementById('nombreCategoriaModificar');

    categoriaActualInput.value = nombreActual;
    nombreInput.value = nombreActual;

    modal.show();
}

function guardarModificacionCategoria() {
    const categoriaActualInput = document.getElementById('categoriaActualModificar');
    const nombreInput = document.getElementById('nombreCategoriaModificar');

    const nombreActual = categoriaActualInput.value;
    const nuevoNombre = nombreInput.value.trim();

    if (!nuevoNombre) {
        alert('Por favor ingrese un nombre para la categoría');
        return;
    }

    if (window.categorias.includes(nuevoNombre) && nuevoNombre !== nombreActual) {
        alert('Esta categoría ya existe');
        return;
    }

    const index = window.categorias.indexOf(nombreActual);
    if (index !== -1) {
        window.productos.forEach(producto => {
            if (producto.categoria === nombreActual) {
                producto.categoria = nuevoNombre;
            }
        });

        window.categorias[index] = nuevoNombre;
        localStorage.setItem('categorias', JSON.stringify(window.categorias));
        localStorage.setItem('productos', JSON.stringify(window.productos));
        cargarCategorias();
        cargarProductos();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalModificarCategoria'));
        modal.hide();
    }
}

function modificarProducto(id) {
    const producto = window.productos.find(p => p.id === id);
    if (!producto) return;

    const modal = new bootstrap.Modal(document.getElementById('modalModificarProducto'));
    const idInput = document.getElementById('productoIdModificar');
    const nombreInput = document.getElementById('nombreProductoModificar');
    const precioInput = document.getElementById('precioProductoModificar');
    const categoriaSelect = document.getElementById('categoriaProductoModificar');

    // Llenar el select de categorías
    categoriaSelect.innerHTML = '<option value="">Seleccionar categoría</option>';
    window.categorias.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria;
        option.textContent = categoria;
        if (categoria === producto.categoria) {
            option.selected = true;
        }
        categoriaSelect.appendChild(option);
    });

    idInput.value = id;
    nombreInput.value = producto.nombre;
    precioInput.value = producto.precio;

    modal.show();
}

function guardarModificacionProducto() {
    const idInput = document.getElementById('productoIdModificar');
    const nombreInput = document.getElementById('nombreProductoModificar');
    const precioInput = document.getElementById('precioProductoModificar');
    const categoriaSelect = document.getElementById('categoriaProductoModificar');

    const id = parseInt(idInput.value);
    const nombre = nombreInput.value.trim();
    const precio = parseInt(precioInput.value);
    const categoria = categoriaSelect.value;

    if (!nombre || !precio || !categoria) {
        alert('Por favor complete todos los campos');
        return;
    }

    const producto = window.productos.find(p => p.id === id);
    if (producto) {
        producto.nombre = nombre;
        producto.precio = precio;
        producto.categoria = categoria;
        localStorage.setItem('productos', JSON.stringify(window.productos));
        cargarProductos();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalModificarProducto'));
        modal.hide();
    }
}

// Funciones para Cierre Diario
function mostrarModalCierreDiario() {
    try {
        console.log('Iniciando mostrarModalCierreDiario...');
        if (typeof bootstrap === 'undefined') {
            console.error('Bootstrap no está disponible');
            alert('Error: Bootstrap no está disponible');
            return;
        }
        const modalElement = document.getElementById('modalCierreDiario');
        console.log('Elemento del modal:', modalElement);
        if (!modalElement) {
            console.error('No se encontró el elemento modal');
            alert('Error: No se encontró el modal de cierre diario');
            return;
        }
        if (!document.body.contains(modalElement)) {
            console.error('El modal no está en el DOM');
            alert('Error: El modal no está en el DOM');
            return;
        }
        const modal = new bootstrap.Modal(modalElement);
        // Obtener ventas del día
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
        const balanceFinal = totalVentas - totalGastos;
        // Actualizar valores en el modal
        document.getElementById('totalVentasHoy').textContent = `$ ${totalVentas.toLocaleString()}`;
        document.getElementById('totalEfectivoHoy').textContent = `$ ${totalEfectivo.toLocaleString()}`;
        document.getElementById('totalTransferenciaHoy').textContent = `$ ${totalTransferencia.toLocaleString()}`;
        if(document.getElementById('totalTarjetaHoy')) document.getElementById('totalTarjetaHoy').textContent = `$ ${totalTarjeta.toLocaleString()}`;
        if(document.getElementById('totalCreditoHoy')) document.getElementById('totalCreditoHoy').textContent = `$ ${totalCredito.toLocaleString()}`;
        if(document.getElementById('totalMixtoHoy')) document.getElementById('totalMixtoHoy').textContent = `$ ${totalMixto.toLocaleString()}`;
        document.getElementById('totalGastos').textContent = `$ ${totalGastos.toLocaleString()}`;
        document.getElementById('balanceFinal').textContent = `$ ${balanceFinal.toLocaleString()}`;
        document.getElementById('detallesCierre').value = '';
        modal.show();
        console.log('Modal mostrado correctamente');
    } catch (error) {
        console.error('Error al mostrar el modal:', error);
        alert('Error al mostrar el modal de cierre diario: ' + error.message);
    }
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
        totalGastos: parseFloat(document.getElementById('totalGastos').textContent.replace('$', '').replace(',', '')),
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

// Función para exportar cierres diarios a Excel
function exportarCierresDiariosExcel() {
    try {
        // Obtener todos los cierres
        const cierres = JSON.parse(localStorage.getItem('cierresDiarios')) || [];
        
        if (cierres.length === 0) {
            alert('No hay cierres diarios para exportar');
            return;
        }

        // Crear un nuevo libro de Excel
        const wb = XLSX.utils.book_new();
        
        // Crear los datos para la hoja de cálculo
        const datos = [
            ['CIERRES DIARIOS'],
            [''],
            ['Fecha', 'Total Ventas', 'Efectivo', 'Transferencia', 'Gastos', 'Balance Final', 'Detalles']
        ];
        
        // Agregar cada cierre como una fila
        cierres.forEach(cierre => {
            datos.push([
                cierre.fecha,
                `$ ${cierre.totalVentas.toLocaleString()}`,
                `$ ${cierre.totalEfectivo.toLocaleString()}`,
                `$ ${cierre.totalTransferencia.toLocaleString()}`,
                `$ ${cierre.totalGastos.toLocaleString()}`,
                `$ ${cierre.balanceFinal.toLocaleString()}`,
                cierre.detalles || ''
            ]);
        });
        
        // Crear la hoja de cálculo
        const ws = XLSX.utils.aoa_to_sheet(datos);
        
        // Ajustar el ancho de las columnas
        const wscols = [
            {wch: 15}, // Fecha
            {wch: 15}, // Total Ventas
            {wch: 15}, // Efectivo
            {wch: 15}, // Transferencia
            {wch: 15}, // Gastos
            {wch: 15}, // Balance Final
            {wch: 40}  // Detalles
        ];
        ws['!cols'] = wscols;
        
        // Agregar la hoja al libro
        XLSX.utils.book_append_sheet(wb, ws, 'Cierres Diarios');
        
        // Generar el archivo Excel
        const fechaFormateada = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `Cierres_Diarios_${fechaFormateada}.xlsx`);
        
        alert('Archivo Excel generado exitosamente');
    } catch (error) {
        console.error('Error al exportar a Excel:', error);
        alert('Error al generar el archivo Excel. Por favor, intente nuevamente.');
    }
}

// Funciones de búsqueda y filtrado
function filtrarClientes() {
    const busqueda = document.getElementById('buscarCliente').value.toLowerCase();
    clientesFiltrados = window.clientes.filter(cliente => 
        cliente.documento.toLowerCase().includes(busqueda) ||
        cliente.nombre.toLowerCase().includes(busqueda) ||
        cliente.apellido.toLowerCase().includes(busqueda) ||
        cliente.telefono.toLowerCase().includes(busqueda) ||
        cliente.correo.toLowerCase().includes(busqueda)
    );
    paginaActualClientes = 1;
    cargarClientes();
}

function filtrarProductos() {
    const busqueda = document.getElementById('buscarProducto').value.toLowerCase();
    productosFiltrados = window.productos.filter(producto => 
        producto.nombre.toLowerCase().includes(busqueda) ||
        producto.categoria.toLowerCase().includes(busqueda) ||
        producto.precio.toString().includes(busqueda)
    );
    paginaActualProductos = 1;
    cargarProductos();
}

// Funciones de paginación
function cambiarPaginaClientes(nuevaPagina) {
    paginaActualClientes = nuevaPagina;
    cargarClientes();
}

function cambiarPaginaProductos(nuevaPagina) {
    paginaActualProductos = nuevaPagina;
    cargarProductos();
}

// Función para generar la paginación
function generarPaginacion(elementoId, totalPaginas, paginaActual, funcionCambio) {
    const paginacion = document.getElementById(elementoId);
    paginacion.innerHTML = '';

    // Botón anterior
    const liAnterior = document.createElement('li');
    liAnterior.className = `page-item ${paginaActual === 1 ? 'disabled' : ''}`;
    liAnterior.innerHTML = `
        <a class="page-link" href="#" onclick="event.preventDefault(); ${funcionCambio.name}(${paginaActual - 1})">Anterior</a>
    `;
    paginacion.appendChild(liAnterior);

    // Números de página
    for (let i = 1; i <= totalPaginas; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === paginaActual ? 'active' : ''}`;
        li.innerHTML = `
            <a class="page-link" href="#" onclick="event.preventDefault(); ${funcionCambio.name}(${i})">${i}</a>
        `;
        paginacion.appendChild(li);
    }

    // Botón siguiente
    const liSiguiente = document.createElement('li');
    liSiguiente.className = `page-item ${paginaActual === totalPaginas ? 'disabled' : ''}`;
    liSiguiente.innerHTML = `
        <a class="page-link" href="#" onclick="event.preventDefault(); ${funcionCambio.name}(${paginaActual + 1})">Siguiente</a>
    `;
    paginacion.appendChild(liSiguiente);
}

function abrirWhatsAppFlotante() {
  window.open(
    'https://web.whatsapp.com/',
    'WhatsAppWeb',
    'width=500,height=700,left=200,top=100'
  );
}

function enviarMensajeWhatsApp() {
  const numero = document.getElementById('numeroWhatsapp').value.trim();
  const mensaje = encodeURIComponent(document.getElementById('mensajeWhatsapp').value.trim());
  if (!numero) {
    alert('Por favor ingresa el número de WhatsApp del cliente.');
    return;
  }
  window.open(`https://wa.me/${numero}?text=${mensaje}`, '_blank');
}

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

    // Guardar la configuración
    const configuracion = {
        horaCierre: hora,
        minutoCierre: minuto,
        periodo: periodo,
        activo: activo
    };
    
    localStorage.setItem('configuracionCierre', JSON.stringify(configuracion));
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalConfiguracionCierre'));
    modal.hide();

    if (activo) {
        alert(`Hora de cierre configurada: ${hora}:${minuto.toString().padStart(2, '0')} ${periodo}`);
    } else {
        alert('Configuración de hora de cierre desactivada. No habrá restricciones de horario.');
    }
}

// Función para extender el horario
function extenderHorario() {
    if (confirm('¿Desea extender el horario para permitir más clientes?')) {
        const configuracion = JSON.parse(localStorage.getItem('configuracionCierre') || '{}');
        configuracion.horarioExtendido = true;
        localStorage.setItem('configuracionCierre', JSON.stringify(configuracion));
        alert('Horario extendido exitosamente');
    }
}

// Funciones para manejar el logo
function previewLogo(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Validar tipo de archivo
  if (!file.type.match('image.*')) {
    alert('Por favor seleccione una imagen válida');
    return;
  }

  // Validar tamaño (500KB máximo)
  if (file.size > 500 * 1024) {
    alert('La imagen no debe superar los 500KB');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const logoActual = document.getElementById('logoActual');
    const noLogo = document.getElementById('noLogo');
    
    logoActual.src = e.target.result;
    logoActual.style.display = 'block';
    noLogo.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

function guardarLogo() {
  const logoActual = document.getElementById('logoActual');
  if (!logoActual.src || logoActual.src === window.location.href) {
    alert('Por favor seleccione un logo primero');
    return;
  }

  // Guardar el logo en localStorage
  localStorage.setItem('logoNegocio', logoActual.src);
  alert('Logo guardado correctamente');
}

function eliminarLogo() {
  if (confirm('¿Está seguro de eliminar el logo?')) {
    localStorage.removeItem('logoNegocio');
    const logoActual = document.getElementById('logoActual');
    const noLogo = document.getElementById('noLogo');
    
    logoActual.src = '';
    logoActual.style.display = 'none';
    noLogo.style.display = 'block';
    
    alert('Logo eliminado correctamente');
  }
}

// Función para cargar el logo al iniciar
function cargarLogo() {
  const logoGuardado = localStorage.getItem('logoNegocio');
  if (logoGuardado) {
    const logoActual = document.getElementById('logoActual');
    const noLogo = document.getElementById('noLogo');
    
    logoActual.src = logoGuardado;
    logoActual.style.display = 'block';
    noLogo.style.display = 'none';
  }
}

// Agregar la llamada a cargarLogo en la función de inicialización
document.addEventListener('DOMContentLoaded', function() {
  cargarDatos();
  cargarLogo();
});

function imprimirBalancePorPeriodo(periodo) {
    try {
        // Obtener todas las ventas desde la clave correcta
        const ventas = JSON.parse(localStorage.getItem('ventas')) || [];
        const gastos = JSON.parse(localStorage.getItem('gastos')) || [];
        // Obtener la fecha actual
        const hoy = new Date();
        let fechaInicio, fechaFin;
        // Calcular el rango de fechas según el período
        switch(periodo) {
            case 'semanal':
                fechaInicio = new Date(hoy);
                fechaInicio.setDate(hoy.getDate() - 7);
                fechaFin = new Date(hoy);
                break;
            case 'mensual':
                fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
                fechaFin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
                break;
            case 'anual':
                fechaInicio = new Date(hoy.getFullYear(), 0, 1);
                fechaFin = new Date(hoy.getFullYear(), 11, 31);
                break;
            default:
                throw new Error('Período no válido');
        }
        // Ajustar las fechas para incluir todo el día
        fechaInicio.setHours(0, 0, 0, 0);
        fechaFin.setHours(23, 59, 59, 999);
        // Filtrar ventas y gastos por el período
        const ventasPeriodo = ventas.filter(v => {
            const fechaVenta = new Date(v.fecha);
            return fechaVenta >= fechaInicio && fechaVenta <= fechaFin;
        });
        const gastosPeriodo = gastos.filter(g => {
            const fechaGasto = new Date(g.fecha);
            return fechaGasto >= fechaInicio && fechaGasto <= fechaFin;
        });
        // Calcular totales por método de pago (sin mostrar mixto)
        let totalEfectivo = 0, totalTransferencia = 0, totalTarjeta = 0, totalCredito = 0, totalVentas = 0;
        ventasPeriodo.forEach(v => {
            const total = parseFloat(v.total) || 0;
            const metodo = (v.metodoPago || '').toLowerCase();
            if (metodo === 'mixto') {
                totalEfectivo += parseFloat(v.montoRecibido) || 0;
                totalTransferencia += parseFloat(v.montoTransferencia) || 0;
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
        const totalGastos = gastosPeriodo.reduce((sum, g) => sum + (parseFloat(g.monto) || 0), 0);
        const balanceFinal = totalVentas - totalGastos;
        // Crear el modal de vista previa
        const modalHtml = `
            <div class="modal fade" id="modalVistaPreviaBalance" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Vista Previa - Balance ${periodo}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="balance-preview" style="font-family: 'Courier New', monospace; font-size: 10pt; white-space: pre-line;">
<span style="font-weight: bold;">BALANCE ${periodo.toUpperCase()}</span>
${fechaInicio.toLocaleDateString()} - ${fechaFin.toLocaleDateString()}
------------------------
RESUMEN DE VENTAS
<span style="font-weight: bold;">Total: $${totalVentas.toLocaleString()}</span>
Efectivo: $${totalEfectivo.toLocaleString()}
Transf: $${totalTransferencia.toLocaleString()}
Tarjeta: $${totalTarjeta.toLocaleString()}
Crédito: $${totalCredito.toLocaleString()}
------------------------
GASTOS: $${totalGastos.toLocaleString()}
------------------------
<span style="font-weight: bold;">BALANCE: $${balanceFinal.toLocaleString()}</span>
------------------------
${new Date().toLocaleString()}
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                            <button type="button" class="btn btn-primary" onclick="imprimirBalance('${periodo}')">Imprimir</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        // Agregar el modal al body si no existe
        if (!document.getElementById('modalVistaPreviaBalance')) {
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        }
        // Mostrar el modal
        const modal = new bootstrap.Modal(document.getElementById('modalVistaPreviaBalance'));
        modal.show();
    } catch (error) {
        console.error('Error al generar el balance:', error);
        alert('Error al generar el balance: ' + error.message);
    }
}

// Función para imprimir el balance
function imprimirBalance(periodo) {
    try {
        // Obtener todas las ventas desde la clave correcta
        const ventas = JSON.parse(localStorage.getItem('ventas')) || [];
        const gastos = JSON.parse(localStorage.getItem('gastos')) || [];
        // Obtener la fecha actual
        const hoy = new Date();
        let fechaInicio, fechaFin;
        // Calcular el rango de fechas según el período
        switch(periodo) {
            case 'semanal':
                fechaInicio = new Date(hoy);
                fechaInicio.setDate(hoy.getDate() - 7);
                fechaFin = new Date(hoy);
                break;
            case 'mensual':
                fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
                fechaFin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
                break;
            case 'anual':
                fechaInicio = new Date(hoy.getFullYear(), 0, 1);
                fechaFin = new Date(hoy.getFullYear(), 11, 31);
                break;
            default:
                throw new Error('Período no válido');
        }
        // Ajustar las fechas para incluir todo el día
        fechaInicio.setHours(0, 0, 0, 0);
        fechaFin.setHours(23, 59, 59, 999);
        // Filtrar ventas y gastos por el período
        const ventasPeriodo = ventas.filter(v => {
            const fechaVenta = new Date(v.fecha);
            return fechaVenta >= fechaInicio && fechaVenta <= fechaFin;
        });
        const gastosPeriodo = gastos.filter(g => {
            const fechaGasto = new Date(g.fecha);
            return fechaGasto >= fechaInicio && fechaGasto <= fechaFin;
        });
        // Calcular totales por método de pago (sin mostrar mixto)
        let totalEfectivo = 0, totalTransferencia = 0, totalTarjeta = 0, totalCredito = 0, totalVentas = 0;
        ventasPeriodo.forEach(v => {
            const total = parseFloat(v.total) || 0;
            const metodo = (v.metodoPago || '').toLowerCase();
            if (metodo === 'mixto') {
                totalEfectivo += parseFloat(v.montoRecibido) || 0;
                totalTransferencia += parseFloat(v.montoTransferencia) || 0;
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
        const totalGastos = gastosPeriodo.reduce((sum, g) => sum + (parseFloat(g.monto) || 0), 0);
        const balanceFinal = totalVentas - totalGastos;
        // Detalle de gastos
        let detalleGastos = '';
        if (gastosPeriodo.length > 0) {
            gastosPeriodo.forEach(g => {
                detalleGastos += `- ${g.descripcion || 'Sin descripción'}: $ ${g.monto}\n`;
            });
        } else {
            detalleGastos = 'No hay gastos registrados\n';
        }
        // Créditos pendientes (si aplica)
        let detalleCreditos = '';
        const creditos = ventasPeriodo.filter(v => (v.metodoPago || '').toLowerCase() === 'crédito');
        if (creditos.length > 0) {
            creditos.forEach(c => {
                detalleCreditos += `- ${c.cliente || 'Cliente'}: $ ${c.total}\n`;
            });
        } else {
            detalleCreditos = 'No hay créditos pendientes\n';
        }
        // Formato de fechas para el encabezado
        const fechaInicioStr = fechaInicio.toLocaleDateString();
        const fechaFinStr = fechaFin.toLocaleDateString();
        // Crear el contenido del recibo (formato POS)
        const recibo = `
<span style=\"font-weight: bold;\">BALANCE ${periodo.toUpperCase()}</span>\n${fechaInicioStr} - ${fechaFinStr}\n-----------------------------\nTotal Ventas: $ ${totalVentas.toLocaleString()}\n- Efectivo: $ ${totalEfectivo.toLocaleString()}\n- Transferencia: $ ${totalTransferencia.toLocaleString()}\n- Tarjeta: $ ${totalTarjeta.toLocaleString()}\n- Crédito: $ ${totalCredito.toLocaleString()}\n-----------------------------\nTotal Gastos: $ ${totalGastos.toLocaleString()}\n-----------------------------\n<span style=\"font-weight: bold;\">Balance Final: $ ${balanceFinal.toLocaleString()}</span>\n-----------------------------\nDetalle de Gastos:\n${detalleGastos}-----------------------------\nCréditos Pendientes:\n${detalleCreditos}-----------------------------\n¡Fin del Balance!\nToySoft POS\n`;
        // Imprimir
        const ventanaImpresion = window.open('', '_blank');
        ventanaImpresion.document.write(`
            <html>
                <head>
                    <title>Balance ${periodo}</title>
                    <style>
                        @page {
                            size: 57mm auto;
                            margin: 0;
                        }
                        html, body {
                            width: 57mm !important;
                            min-width: 57mm !important;
                            max-width: 57mm !important;
                            height: 100% !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            overflow: hidden !important;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: flex-start;
                            background: white;
                        }
                        body {
                            font-family: 'Courier New', monospace;
                            font-size: 12pt;
                            white-space: pre-line;
                            word-wrap: break-word;
                            margin: 0 !important;
                            padding: 0 !important;
                            width: 100% !important;
                            box-sizing: border-box;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: flex-start;
                        }
                        .balance-content {
                            width: 100%;
                            max-width: 100%;
                            text-align: center;
                            margin: 0 auto;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        @media print {
                            html, body {
                                width: 57mm !important;
                                min-width: 57mm !important;
                                max-width: 57mm !important;
                                height: 100% !important;
                                margin: 0 !important;
                                padding: 0 !important;
                                overflow: hidden !important;
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                justify-content: flex-start;
                            }
                            body {
                                font-size: 12pt;
                                -webkit-print-color-adjust: exact;
                                width: 100% !important;
                                margin: 0 !important;
                                padding: 0 !important;
                            }
                            .balance-content {
                                width: 100%;
                                max-width: 100%;
                                text-align: center;
                                margin: 0 auto;
                                padding: 0;
                            }
                        }
                    </style>
                </head>
                <body><div class="balance-content">${recibo}</div></body>
            </html>
        `);
        ventanaImpresion.document.close();
        ventanaImpresion.focus();
        setTimeout(() => {
            ventanaImpresion.print();
            ventanaImpresion.close();
        }, 250);
    } catch (error) {
        console.error('Error al imprimir el balance:', error);
        alert('Error al imprimir el balance: ' + error.message);
    }
} 