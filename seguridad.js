// Configuración de credenciales
const credenciales = {
    usuario: 'admin',
    clave: '1234'
};

// Configuración de horario de cierre
const configuracionCierre = {
    horaCierre: 11, // Hora en formato 12 horas
    minutoCierre: 30,
    periodo: 'PM', // AM o PM
    horarioExtendido: false,
    activo: false // Indica si la configuración de hora está activa
};

// Verificar si hay una sesión activa
function verificarSesion() {
    const sesionActiva = localStorage.getItem('sesionActiva') === 'true';
    console.log('Verificando sesión:', sesionActiva);
    return sesionActiva;
}

// Verificar si se ha realizado el cierre diario
function verificarCierreDiario() {
    const fechaHoy = new Date().toLocaleDateString();
    const cierresDiarios = JSON.parse(localStorage.getItem('cierresDiarios') || '[]');
    const cierreHoy = cierresDiarios.find(cierre => 
        new Date(cierre.fecha).toLocaleDateString() === fechaHoy
    );
    return !!cierreHoy;
}

// Función para convertir hora 12h a 24h
function convertirHora12a24(hora, periodo) {
    if (periodo === 'PM' && hora !== 12) {
        return hora + 12;
    } else if (periodo === 'AM' && hora === 12) {
        return 0;
    }
    return hora;
}

// Función para configurar la hora de cierre
function configurarHoraCierre(hora, minuto, periodo, activo) {
    configuracionCierre.horaCierre = hora;
    configuracionCierre.minutoCierre = minuto;
    configuracionCierre.periodo = periodo;
    configuracionCierre.activo = activo;
    localStorage.setItem('configuracionCierre', JSON.stringify(configuracionCierre));
    console.log('Hora de cierre configurada:', `${hora}:${minuto} ${periodo}, Activo: ${activo}`);
}

// Función para extender el horario
function extenderHorario() {
    const respuesta = confirm('¿Está seguro que desea extender el horario para atender más clientes?');
    if (respuesta) {
        configuracionCierre.horarioExtendido = true;
        localStorage.setItem('configuracionCierre', JSON.stringify(configuracionCierre));
        alert('Horario extendido activado. Puede continuar atendiendo clientes.');
    }
}

// Función para verificar si es hora de cierre
function esHoraDeCierre() {
    // Si la configuración no está activa, nunca es hora de cierre
    if (!configuracionCierre.activo) {
        return false;
    }

    // Si el horario está extendido, no es hora de cierre
    if (configuracionCierre.horarioExtendido) {
        return false;
    }

    const ahora = new Date();
    const horaActual = ahora.getHours();
    const minutoActual = ahora.getMinutes();
    
    // Convertir hora de cierre a formato 24h
    const horaCierre24 = convertirHora12a24(configuracionCierre.horaCierre, configuracionCierre.periodo);
    
    // Si la hora actual es mayor o igual a la hora de cierre
    if (horaActual > horaCierre24 || 
        (horaActual === horaCierre24 && minutoActual >= configuracionCierre.minutoCierre)) {
        return true;
    }
    return false;
}

// Verificar sesión y cierre diario
function verificarAcceso() {
    if (!verificarSesion()) {
        console.log('Redirigiendo al login...');
        window.location.href = 'index.html';
        return;
    }

    // Verificar si es necesario hacer cierre diario
    if (!verificarCierreDiario()) {
        if (esHoraDeCierre()) {
            const respuesta = confirm('Es hora de cierre. ¿Desea extender el horario para atender más clientes?');
            if (respuesta) {
                extenderHorario();
            } else {
                alert('Es necesario realizar el cierre diario antes de continuar.');
                mostrarModalCierreDiario();
                return;
            }
        }
    }
}

// Iniciar sesión
function iniciarSesion() {
    const usuario = document.getElementById('usuario').value;
    const clave = document.getElementById('clave').value;

    console.log('Intento de login:', usuario, clave);

    if (usuario === credenciales.usuario && clave === credenciales.clave) {
        console.log('Login exitoso');
        localStorage.setItem('sesionActiva', 'true');
        mostrarApp();
    } else {
        console.log('Login fallido');
        alert('Credenciales incorrectas');
    }
}

// Mostrar la aplicación
function mostrarApp() {
    const loginSection = document.getElementById('loginSection');
    const appSection = document.getElementById('appSection');
    
    console.log('Mostrando aplicación...');
    
    if (loginSection && appSection) {
        // Ocultar login con fade out
        loginSection.style.opacity = '0';
        loginSection.style.transition = 'opacity 0.3s ease';
        
        setTimeout(() => {
            loginSection.style.display = 'none';
            appSection.style.display = 'block';
            // Mostrar app con fade in
            setTimeout(() => {
                appSection.style.opacity = '1';
            }, 50);
        }, 300);
    } else {
        console.error('No se encontraron las secciones necesarias');
    }
}

// Cerrar sesión
function cerrarSesion() {
    // Verificar si se ha realizado el cierre diario
    if (!verificarCierreDiario()) {
        if (esHoraDeCierre()) {
            const respuesta = confirm('Es hora de cierre. ¿Desea extender el horario para atender más clientes?');
            if (respuesta) {
                extenderHorario();
                return;
            } else {
                alert('Debe realizar el cierre diario antes de cerrar sesión.');
                mostrarModalCierreDiario();
                return;
            }
        }
    }
    
    localStorage.removeItem('sesionActiva');
    window.location.href = 'index.html';
}

// Verificar sesión al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    const loginSection = document.getElementById('loginSection');
    const appSection = document.getElementById('appSection');
    
    if (localStorage.getItem('sesionActiva') === 'true') {
        loginSection.style.display = 'none';
        appSection.style.display = 'block';
        appSection.style.opacity = '1';
    } else {
        loginSection.style.opacity = '1';
    }

    const configGuardada = localStorage.getItem('configuracionCierre');
    if (configGuardada) {
        Object.assign(configuracionCierre, JSON.parse(configGuardada));
    }
}); 