// Definición de tipos para Clientes
export interface Cliente {
    id: number;
    documento: string;
    nombre: string;
    apellido: string;
    telefono: string;
    correo: string;
    fechaRegistro: string;
}

// Definición de tipos para Productos
export interface Producto {
    id: number;
    nombre: string;
    precio: number;
    categoria: string;
}

// Definición de tipos para Ventas
export interface Venta {
    id: number;
    fecha: string;
    mesa: number;
    total: number;
    propina: number;
    descuento: number;
    totalFinal: number;
    productos: {
        id: number;
        cantidad: number;
    }[];
}

// Definición de tipos para el estado global
export interface EstadoGlobal {
    clientes: Cliente[];
    productos: Producto[];
    ventas: Venta[];
    categorias: string[];
} 