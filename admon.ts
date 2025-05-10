import { Cliente, Producto, Venta, EstadoGlobal } from './types';

// Variables globales con tipos
let categorias: string[] = JSON.parse(localStorage.getItem('categorias') || '[]');
let productos: Producto[] = JSON.parse(localStorage.getItem('productos') || '[]');
let ventas: Venta[] = JSON.parse(localStorage.getItem('ventas') || '[]');
let clientes: Cliente[] = JSON.parse(localStorage.getItem('clientes') || '[]');

// Inicialización
document.addEventListener('DOMContentLoaded', (): void => {
    cargarCategorias();
    cargarProductos();
    cargarVentas();
    cargarClientes();
});

// Funciones para Clientes
function agregarCliente(): void {
    const nombre: string | null = prompt('Ingrese el nombre del cliente:');
    if (!nombre) return;

    const telefono: string | null = prompt('Ingrese el teléfono del cliente:');
    if (!telefono) return;

    const cliente: Cliente = {
        id: Date.now(),
        nombre: nombre,
        telefono: telefono,
        fechaRegistro: new Date().toISOString()
    };

    clientes.push(cliente);
    localStorage.setItem('clientes', JSON.stringify(clientes));
    cargarClientes();
}

function eliminarCliente(): void {
    const checkboxes: NodeListOf<HTMLInputElement> = document.querySelectorAll('#listaClientes input[type="checkbox"]:checked');
    if (checkboxes.length === 0) {
        alert('Por favor seleccione al menos un cliente para eliminar');
        return;
    }

    const clientesAEliminar: number[] = Array.from(checkboxes).map(cb => parseInt(cb.value));
    const confirmacion: boolean = confirm(`¿Está seguro que desea eliminar ${clientesAEliminar.length} cliente(s)?`);

    if (confirmacion) {
        clientes = clientes.filter(cliente => !clientesAEliminar.includes(cliente.id));
        localStorage.setItem('clientes', JSON.stringify(clientes));
        cargarClientes();
    }
}

function cargarClientes(): void {
    const listaClientes: HTMLElement | null = document.getElementById('listaClientes');
    if (!listaClientes) return;

    listaClientes.innerHTML = '';

    clientes.forEach(cliente => {
        const div: HTMLDivElement = document.createElement('div');
        div.className = 'd-flex align-items-center mb-2';
        div.innerHTML = `
            <div class="form-check me-3">
                <input class="form-check-input checkbox-alerta" type="checkbox" value="${cliente.id}" id="cli_${cliente.id}">
                <label class="form-check-label" for="cli_${cliente.id}">
                    ${cliente.nombre} - ${cliente.telefono}
                </label>
            </div>
            <button class="btn btn-sm btn-outline-info ms-auto" onclick="modificarCliente(${cliente.id})">Modificar</button>
        `;
        listaClientes.appendChild(div);
    });
}

function modificarCliente(id: number): void {
    const cliente: Cliente | undefined = clientes.find(c => c.id === id);
    if (!cliente) return;

    const modal = new bootstrap.Modal(document.getElementById('modalModificarCliente')!);
    const idInput = document.getElementById('clienteIdModificar') as HTMLInputElement;
    const nombreInput = document.getElementById('nombreClienteModificar') as HTMLInputElement;
    const telefonoInput = document.getElementById('telefonoClienteModificar') as HTMLInputElement;

    idInput.value = id.toString();
    nombreInput.value = cliente.nombre;
    telefonoInput.value = cliente.telefono;

    modal.show();
}

function guardarModificacionCliente(): void {
    const idInput = document.getElementById('clienteIdModificar') as HTMLInputElement;
    const nombreInput = document.getElementById('nombreClienteModificar') as HTMLInputElement;
    const telefonoInput = document.getElementById('telefonoClienteModificar') as HTMLInputElement;

    const id = parseInt(idInput.value);
    const nombre = nombreInput.value.trim();
    const telefono = telefonoInput.value.trim();

    if (!nombre || !telefono) {
        alert('Por favor complete todos los campos');
        return;
    }

    const cliente = clientes.find(c => c.id === id);
    if (cliente) {
        cliente.nombre = nombre;
        cliente.telefono = telefono;
        localStorage.setItem('clientes', JSON.stringify(clientes));
        cargarClientes();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalModificarCliente')!);
        modal?.hide();
    }
}

// Funciones para Categorías
function agregarCategoria(): void {
    const input: HTMLInputElement | null = document.getElementById('nuevaCategoria') as HTMLInputElement;
    if (!input) return;

    const nombre: string = input.value.trim();
    if (!nombre) {
        alert('Por favor ingrese un nombre para la categoría');
        return;
    }

    if (categorias.includes(nombre)) {
        alert('Esta categoría ya existe');
        return;
    }

    categorias.push(nombre);
    localStorage.setItem('categorias', JSON.stringify(categorias));
    cargarCategorias();
    input.value = '';
}

function eliminarCategoria(): void {
    const checkboxes: NodeListOf<HTMLInputElement> = document.querySelectorAll('#listaCategorias input[type="checkbox"]:checked');
    if (checkboxes.length === 0) {
        alert('Por favor seleccione al menos una categoría para eliminar');
        return;
    }

    const categoriasAEliminar: string[] = Array.from(checkboxes).map(cb => cb.value);
    const productosEnCategorias: Producto[] = productos.filter(p => categoriasAEliminar.includes(p.categoria));

    let mensaje: string = `¿Está seguro que desea eliminar las siguientes categorías?\n\n`;
    mensaje += categoriasAEliminar.join('\n');

    if (productosEnCategorias.length > 0) {
        mensaje += `\n\nADVERTENCIA: Hay ${productosEnCategorias.length} producto(s) en estas categorías.`;
        mensaje += `\nSi elimina estas categorías, los productos también se eliminarán.`;
    }

    if (confirm(mensaje)) {
        if (productosEnCategorias.length > 0) {
            productos = productos.filter(p => !categoriasAEliminar.includes(p.categoria));
            localStorage.setItem('productos', JSON.stringify(productos));
        }

        categorias = categorias.filter(c => !categoriasAEliminar.includes(c));
        localStorage.setItem('categorias', JSON.stringify(categorias));
        cargarCategorias();
        cargarProductos();
    }
}

function cargarCategorias(): void {
    const listaCategorias: HTMLElement | null = document.getElementById('listaCategorias');
    const selectCategoria: HTMLSelectElement | null = document.getElementById('categoriaProducto') as HTMLSelectElement;
    
    if (!listaCategorias || !selectCategoria) return;

    listaCategorias.innerHTML = '';
    selectCategoria.innerHTML = '<option value="">Seleccionar categoría</option>';
    
    categorias.forEach(categoria => {
        const div: HTMLDivElement = document.createElement('div');
        div.className = 'd-flex align-items-center mb-2';
        div.innerHTML = `
            <div class="form-check me-3">
                <input class="form-check-input checkbox-alerta" type="checkbox" value="${categoria}" id="cat_${categoria}">
                <label class="form-check-label" for="cat_${categoria}">
                    ${categoria}
                </label>
            </div>
            <button class="btn btn-sm btn-outline-info ms-auto" onclick="modificarCategoria('${categoria}')">Modificar</button>
        `;
        listaCategorias.appendChild(div);

        const option: HTMLOptionElement = document.createElement('option');
        option.value = categoria;
        option.textContent = categoria;
        selectCategoria.appendChild(option);
    });
}

function modificarCategoria(nombreActual: string): void {
    const modal = new bootstrap.Modal(document.getElementById('modalModificarCategoria')!);
    const categoriaActualInput = document.getElementById('categoriaActualModificar') as HTMLInputElement;
    const nombreInput = document.getElementById('nombreCategoriaModificar') as HTMLInputElement;

    categoriaActualInput.value = nombreActual;
    nombreInput.value = nombreActual;

    modal.show();
}

function guardarModificacionCategoria(): void {
    const categoriaActualInput = document.getElementById('categoriaActualModificar') as HTMLInputElement;
    const nombreInput = document.getElementById('nombreCategoriaModificar') as HTMLInputElement;

    const nombreActual = categoriaActualInput.value;
    const nuevoNombre = nombreInput.value.trim();

    if (!nuevoNombre) {
        alert('Por favor ingrese un nombre para la categoría');
        return;
    }

    if (categorias.includes(nuevoNombre) && nuevoNombre !== nombreActual) {
        alert('Esta categoría ya existe');
        return;
    }

    const index = categorias.indexOf(nombreActual);
    if (index !== -1) {
        productos.forEach(producto => {
            if (producto.categoria === nombreActual) {
                producto.categoria = nuevoNombre;
            }
        });

        categorias[index] = nuevoNombre;
        localStorage.setItem('categorias', JSON.stringify(categorias));
        localStorage.setItem('productos', JSON.stringify(productos));
        cargarCategorias();
        cargarProductos();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalModificarCategoria')!);
        modal?.hide();
    }
}

// Funciones para Productos
function agregarProducto(): void {
    const nombreInput: HTMLInputElement | null = document.getElementById('nombreProducto') as HTMLInputElement;
    const precioInput: HTMLInputElement | null = document.getElementById('precioProducto') as HTMLInputElement;
    const categoriaSelect: HTMLSelectElement | null = document.getElementById('categoriaProducto') as HTMLSelectElement;

    if (!nombreInput || !precioInput || !categoriaSelect) return;

    const nombre: string = nombreInput.value.trim();
    const precio: number = parseFloat(precioInput.value);
    const categoria: string = categoriaSelect.value;

    if (!nombre || isNaN(precio) || !categoria) {
        alert('Por favor complete todos los campos');
        return;
    }

    const producto: Producto = {
        id: Date.now(),
        nombre: nombre,
        precio: precio,
        categoria: categoria
    };

    productos.push(producto);
    localStorage.setItem('productos', JSON.stringify(productos));
    cargarProductos();
    
    nombreInput.value = '';
    precioInput.value = '';
    categoriaSelect.value = '';
}

function eliminarProducto(): void {
    const checkboxes: NodeListOf<HTMLInputElement> = document.querySelectorAll('#listaProductos input[type="checkbox"]:checked');
    if (checkboxes.length === 0) {
        alert('Por favor seleccione al menos un producto para eliminar');
        return;
    }

    const productosAEliminar: number[] = Array.from(checkboxes).map(cb => parseInt(cb.value));
    const confirmacion: boolean = confirm(`¿Está seguro que desea eliminar ${productosAEliminar.length} producto(s)?`);

    if (confirmacion) {
        productos = productos.filter(producto => !productosAEliminar.includes(producto.id));
        localStorage.setItem('productos', JSON.stringify(productos));
        cargarProductos();
    }
}

function cargarProductos(): void {
    const listaProductos: HTMLElement | null = document.getElementById('listaProductos');
    if (!listaProductos) return;

    listaProductos.innerHTML = '';

    productos.forEach(producto => {
        const div: HTMLDivElement = document.createElement('div');
        div.className = 'd-flex align-items-center mb-2';
        div.innerHTML = `
            <div class="form-check me-3">
                <input class="form-check-input checkbox-alerta" type="checkbox" value="${producto.id}" id="prod_${producto.id}">
                <label class="form-check-label" for="prod_${producto.id}">
                    ${producto.nombre} - $${producto.precio} (${producto.categoria})
                </label>
            </div>
            <button class="btn btn-sm btn-outline-info ms-auto" onclick="modificarProducto(${producto.id})">Modificar</button>
        `;
        listaProductos.appendChild(div);
    });
}

function modificarProducto(id: number): void {
    const producto: Producto | undefined = productos.find(p => p.id === id);
    if (!producto) return;

    const modal = new bootstrap.Modal(document.getElementById('modalModificarProducto')!);
    const idInput = document.getElementById('productoIdModificar') as HTMLInputElement;
    const nombreInput = document.getElementById('nombreProductoModificar') as HTMLInputElement;
    const precioInput = document.getElementById('precioProductoModificar') as HTMLInputElement;
    const categoriaSelect = document.getElementById('categoriaProductoModificar') as HTMLSelectElement;

    // Llenar el select de categorías
    categoriaSelect.innerHTML = '<option value="">Seleccionar categoría</option>';
    categorias.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria;
        option.textContent = categoria;
        if (categoria === producto.categoria) {
            option.selected = true;
        }
        categoriaSelect.appendChild(option);
    });

    idInput.value = id.toString();
    nombreInput.value = producto.nombre;
    precioInput.value = producto.precio.toString();

    modal.show();
}

function guardarModificacionProducto(): void {
    const idInput = document.getElementById('productoIdModificar') as HTMLInputElement;
    const nombreInput = document.getElementById('nombreProductoModificar') as HTMLInputElement;
    const precioInput = document.getElementById('precioProductoModificar') as HTMLInputElement;
    const categoriaSelect = document.getElementById('categoriaProductoModificar') as HTMLSelectElement;

    const id = parseInt(idInput.value);
    const nombre = nombreInput.value.trim();
    const precio = parseInt(precioInput.value);
    const categoria = categoriaSelect.value;

    if (!nombre || !precio || !categoria) {
        alert('Por favor complete todos los campos');
        return;
    }

    const producto = productos.find(p => p.id === id);
    if (producto) {
        producto.nombre = nombre;
        producto.precio = precio;
        producto.categoria = categoria;
        localStorage.setItem('productos', JSON.stringify(productos));
        cargarProductos();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalModificarProducto')!);
        modal?.hide();
    }
}

// Funciones para Ventas
function cargarVentas(): void {
    const tbody: HTMLElement | null = document.getElementById('historialVentas');
    if (!tbody) return;

    tbody.innerHTML = '';

    ventas.forEach(venta => {
        const tr: HTMLTableRowElement = document.createElement('tr');
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
} 