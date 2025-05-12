// Variables globales
let inventario = [];
let productoSeleccionado = null;

// Función para cargar el inventario
function cargarInventario() {
    try {
        const inventarioGuardado = localStorage.getItem('inventario');
        if (inventarioGuardado) {
            inventario = JSON.parse(inventarioGuardado);
        }
        mostrarInventario();
        cargarCategorias();
    } catch (error) {
        console.error('Error al cargar el inventario:', error);
        alert('Error al cargar el inventario');
    }
}

// Función para guardar el inventario
function guardarInventario() {
    try {
        localStorage.setItem('inventario', JSON.stringify(inventario));
    } catch (error) {
        console.error('Error al guardar el inventario:', error);
        alert('Error al guardar el inventario');
    }
}

// Función para mostrar el inventario
function mostrarInventario() {
    const tabla = document.getElementById('tablaInventario');
    tabla.innerHTML = '';

    inventario.forEach(producto => {
        const estado = calcularEstadoStock(producto);
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${producto.codigo}</td>
            <td>${producto.nombre}</td>
            <td>${producto.categoria}</td>
            <td>${producto.stockActual} ${producto.unidadMedida}</td>
            <td>${producto.stockMinimo} ${producto.unidadMedida}</td>
            <td>${producto.stockMaximo} ${producto.unidadMedida}</td>
            <td>
                <span class="badge ${getEstadoClass(estado)}">${estado}</span>
            </td>
            <td>${new Date(producto.ultimaActualizacion).toLocaleString()}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editarProducto('${producto.codigo}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-info" onclick="ajustarStock('${producto.codigo}')">
                    <i class="fas fa-boxes"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="eliminarProducto('${producto.codigo}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tabla.appendChild(fila);
    });
}

// Función para calcular el estado del stock
function calcularEstadoStock(producto) {
    const porcentaje = (producto.stockActual / producto.stockMaximo) * 100;
    if (producto.stockActual <= producto.stockMinimo) {
        return 'Bajo';
    } else if (porcentaje >= 80) {
        return 'Alto';
    } else {
        return 'Normal';
    }
}

// Función para obtener la clase CSS del estado
function getEstadoClass(estado) {
    switch (estado.toLowerCase()) {
        case 'bajo':
            return 'bg-danger';
        case 'alto':
            return 'bg-success';
        default:
            return 'bg-warning';
    }
}

// Función para cargar las categorías
function cargarCategorias() {
    const categorias = JSON.parse(localStorage.getItem('categorias')) || [];
    const selectCategoria = document.getElementById('categoriaProducto');
    const selectFiltroCategoria = document.getElementById('filtroCategoria');
    
    // Limpiar opciones existentes
    selectCategoria.innerHTML = '<option value="">Seleccione una categoría</option>';
    selectFiltroCategoria.innerHTML = '<option value="">Todas las categorías</option>';
    
    // Agregar categorías
    categorias.forEach(categoria => {
        selectCategoria.innerHTML += `<option value="${categoria}">${categoria}</option>`;
        selectFiltroCategoria.innerHTML += `<option value="${categoria}">${categoria}</option>`;
    });
}

// Función para mostrar el modal de producto
function mostrarModalProducto(codigo = null) {
    const modal = new bootstrap.Modal(document.getElementById('modalProducto'));
    const form = document.getElementById('formProducto');
    
    // Limpiar formulario
    form.reset();
    
    if (codigo) {
        // Modo edición
        productoSeleccionado = inventario.find(p => p.codigo === codigo);
        if (productoSeleccionado) {
            document.getElementById('codigoProducto').value = productoSeleccionado.codigo;
            document.getElementById('nombreProducto').value = productoSeleccionado.nombre;
            document.getElementById('categoriaProducto').value = productoSeleccionado.categoria;
            document.getElementById('stockActual').value = productoSeleccionado.stockActual;
            document.getElementById('stockMinimo').value = productoSeleccionado.stockMinimo;
            document.getElementById('stockMaximo').value = productoSeleccionado.stockMaximo;
            document.getElementById('unidadMedida').value = productoSeleccionado.unidadMedida;
        }
    } else {
        // Modo nuevo
        productoSeleccionado = null;
        document.getElementById('codigoProducto').value = generarCodigo();
    }
    
    modal.show();
}

// Función para generar código único
function generarCodigo() {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PROD-${timestamp}-${random}`;
}

// Función para guardar producto
function guardarProducto() {
    const form = document.getElementById('formProducto');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const producto = {
        codigo: document.getElementById('codigoProducto').value,
        nombre: document.getElementById('nombreProducto').value,
        categoria: document.getElementById('categoriaProducto').value,
        stockActual: parseFloat(document.getElementById('stockActual').value),
        stockMinimo: parseFloat(document.getElementById('stockMinimo').value),
        stockMaximo: parseFloat(document.getElementById('stockMaximo').value),
        unidadMedida: document.getElementById('unidadMedida').value,
        ultimaActualizacion: new Date().toISOString()
    };

    if (productoSeleccionado) {
        // Actualizar producto existente
        const index = inventario.findIndex(p => p.codigo === producto.codigo);
        if (index !== -1) {
            inventario[index] = producto;
        }
    } else {
        // Agregar nuevo producto
        inventario.push(producto);
    }

    guardarInventario();
    mostrarInventario();
    bootstrap.Modal.getInstance(document.getElementById('modalProducto')).hide();
}

// Función para editar producto
function editarProducto(codigo) {
    mostrarModalProducto(codigo);
}

// Función para eliminar producto
function eliminarProducto(codigo) {
    if (confirm('¿Está seguro que desea eliminar este producto?')) {
        inventario = inventario.filter(p => p.codigo !== codigo);
        guardarInventario();
        mostrarInventario();
    }
}

// Función para ajustar stock
function ajustarStock(codigo) {
    productoSeleccionado = inventario.find(p => p.codigo === codigo);
    if (productoSeleccionado) {
        const modal = new bootstrap.Modal(document.getElementById('modalAjusteStock'));
        document.getElementById('formAjusteStock').reset();
        modal.show();
    }
}

// Función para procesar ajuste de stock
function procesarAjusteStock() {
    const form = document.getElementById('formAjusteStock');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const tipoAjuste = document.getElementById('tipoAjuste').value;
    const cantidad = parseFloat(document.getElementById('cantidadAjuste').value);
    const motivo = document.getElementById('motivoAjuste').value;

    if (productoSeleccionado) {
        const index = inventario.findIndex(p => p.codigo === productoSeleccionado.codigo);
        if (index !== -1) {
            // Actualizar stock
            if (tipoAjuste === 'entrada') {
                inventario[index].stockActual += cantidad;
            } else {
                if (inventario[index].stockActual < cantidad) {
                    alert('No hay suficiente stock disponible');
                    return;
                }
                inventario[index].stockActual -= cantidad;
            }

            // Registrar el ajuste
            const ajuste = {
                fecha: new Date().toISOString(),
                tipo: tipoAjuste,
                cantidad: cantidad,
                motivo: motivo,
                stockAnterior: productoSeleccionado.stockActual,
                stockNuevo: inventario[index].stockActual
            };

            if (!inventario[index].ajustes) {
                inventario[index].ajustes = [];
            }
            inventario[index].ajustes.push(ajuste);
            inventario[index].ultimaActualizacion = new Date().toISOString();

            guardarInventario();
            mostrarInventario();
            bootstrap.Modal.getInstance(document.getElementById('modalAjusteStock')).hide();
        }
    }
}

// Función para aplicar filtros
function aplicarFiltros() {
    const busqueda = document.getElementById('buscarProducto').value.toLowerCase();
    const categoria = document.getElementById('filtroCategoria').value;
    const estado = document.getElementById('filtroEstado').value;

    const productosFiltrados = inventario.filter(producto => {
        const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda) ||
                                producto.codigo.toLowerCase().includes(busqueda);
        const coincideCategoria = !categoria || producto.categoria === categoria;
        const coincideEstado = !estado || calcularEstadoStock(producto).toLowerCase() === estado.toLowerCase();

        return coincideBusqueda && coincideCategoria && coincideEstado;
    });

    mostrarInventarioFiltrado(productosFiltrados);
}

// Función para mostrar inventario filtrado
function mostrarInventarioFiltrado(productos) {
    const tabla = document.getElementById('tablaInventario');
    tabla.innerHTML = '';

    productos.forEach(producto => {
        const estado = calcularEstadoStock(producto);
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${producto.codigo}</td>
            <td>${producto.nombre}</td>
            <td>${producto.categoria}</td>
            <td>${producto.stockActual} ${producto.unidadMedida}</td>
            <td>${producto.stockMinimo} ${producto.unidadMedida}</td>
            <td>${producto.stockMaximo} ${producto.unidadMedida}</td>
            <td>
                <span class="badge ${getEstadoClass(estado)}">${estado}</span>
            </td>
            <td>${new Date(producto.ultimaActualizacion).toLocaleString()}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editarProducto('${producto.codigo}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-info" onclick="ajustarStock('${producto.codigo}')">
                    <i class="fas fa-boxes"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="eliminarProducto('${producto.codigo}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tabla.appendChild(fila);
    });
}

// Función para exportar a Excel
function exportarInventarioExcel() {
    try {
        const wb = XLSX.utils.book_new();
        
        // Preparar datos para exportar
        const datos = inventario.map(producto => ({
            'Código': producto.codigo,
            'Nombre': producto.nombre,
            'Categoría': producto.categoria,
            'Stock Actual': `${producto.stockActual} ${producto.unidadMedida}`,
            'Stock Mínimo': `${producto.stockMinimo} ${producto.unidadMedida}`,
            'Stock Máximo': `${producto.stockMaximo} ${producto.unidadMedida}`,
            'Estado': calcularEstadoStock(producto),
            'Última Actualización': new Date(producto.ultimaActualizacion).toLocaleString()
        }));

        // Crear hoja de cálculo
        const ws = XLSX.utils.json_to_sheet(datos);

        // Ajustar anchos de columna
        const anchos = [
            { wch: 15 }, // Código
            { wch: 30 }, // Nombre
            { wch: 20 }, // Categoría
            { wch: 15 }, // Stock Actual
            { wch: 15 }, // Stock Mínimo
            { wch: 15 }, // Stock Máximo
            { wch: 10 }, // Estado
            { wch: 20 }  // Última Actualización
        ];
        ws['!cols'] = anchos;

        // Agregar hoja al libro
        XLSX.utils.book_append_sheet(wb, ws, 'Inventario');

        // Generar archivo
        const fecha = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `Inventario_${fecha}.xlsx`);
        
        alert('Archivo Excel generado exitosamente');
    } catch (error) {
        console.error('Error al exportar a Excel:', error);
        alert('Error al generar el archivo Excel');
    }
}

// Cargar inventario al iniciar
document.addEventListener('DOMContentLoaded', cargarInventario); 