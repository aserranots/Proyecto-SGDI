const {remote, ipcRenderer} = require("electron")

const formularioActualizarUsuario = document.getElementById("formularioActualizarUsuario");
const usuarioId = document.getElementById("usuario");
const usuarioNombre = document.getElementById("nombre");
const usuarioDireccion = document.getElementById("direccion");
const usuarioTelefono = document.getElementById("telefono");
const usuarioCargo = document.getElementById("cargo");
const usuarioEmail = document.getElementById("email");
const formularioActualizarContraseña = document.getElementById("formularioActualizarContraseña");
const nuevaContraseña = document.getElementById("nueva_contraseña");
const confirmarContraeña = document.getElementById("confirmar_contraeña");
const formularioActualizarCorreo = document.getElementById("formularioActualizarCorreo");

ipcRenderer.send('asynchronous-consultarDatosDeUsuario', null)

ipcRenderer.removeAllListeners('asynchronous-reply-consultarDatosDeUsuario')

ipcRenderer.on('asynchronous-reply-consultarDatosDeUsuario', (event, resultado) => {
    mostrarDatos(resultado)
})

function mostrarDatos(usuario){
    usuarioId.innerHTML = usuario.id
    usuarioNombre.value = usuario.nombre
    usuarioDireccion.value = usuario.direccion
    usuarioTelefono.value = usuario.telefono
    usuarioCargo.value = usuario.cargo
    usuarioEmail.value = usuario.email
}

formularioActualizarUsuario.addEventListener("submit", (e) => {
    e.preventDefault();

    desplegarVentanaDeConfirmarcion("usuario")
})

formularioActualizarContraseña.addEventListener("submit", (e) => {
    e.preventDefault();

    if(nuevaContraseña.value == confirmarContraeña.value) desplegarVentanaDeConfirmarcion("contraseña");
    else alert("Confirme correctamente la nueva contraseña") 
})

formularioActualizarCorreo.addEventListener("submit", (e) => {
    e.preventDefault();

    desplegarVentanaDeConfirmarcion("correo");
})

function desplegarVentanaDeConfirmarcion(formulario) {
    if(formulario == "usuario"){
        const ventanaDeConfirmacion = '<form id="ventanaDeConfirmarcionUsuario" class="card card-body animate__animated animate__fadeIn" style = "position: fixed; top: 50%; left: 50%; z-index: 1">'+
        '<label>Introduzca su contraseña</label>'+
        '<div class="form-group">'+
        '<input id="contraseñaUsuario" type="password" placeholder="Contraseña" class="form-control" autofocus>'+
        '</div>'+
        '<button onclick="actualizarUsuario()" type="button" class="btn btn-primary mt-3">Actualizar datos</button>'+
        '<button onclick="cerrarVentana(\'ventanaDeConfirmarcionUsuario\')" type="button" class="btn btn-primary mt-3">Cancelar</button>'+
        '</form>'

        document.body.insertAdjacentHTML('afterbegin', ventanaDeConfirmacion)
    }

    if(formulario == "contraseña"){
        const ventanaDeConfirmacion = '<form id="ventanaDeConfirmarcionContraseña" class="card card-body animate__animated animate__fadeIn" style = "position: fixed; top: 50%; left: 50%; z-index: 1">'+
        '<label>Introduzca su contraseña</label>'+
        '<div class="form-group">'+
        '<input id="contraseñaContraseña" type="password" placeholder="Contraseña" class="form-control" autofocus>'+
        '</div>'+
        '<button onclick="actualizarContraseña()" type="button" class="btn btn-primary mt-3">Actualizar datos</button>'+
        '<button onclick="cerrarVentana(\'ventanaDeConfirmarcionContraseña\')" type="button" class="btn btn-primary mt-3">Cancelar</button>'+
        '</form>'

        document.body.insertAdjacentHTML('afterbegin', ventanaDeConfirmacion)
    }

    if(formulario == "correo"){
        const ventanaDeConfirmacion = '<form id="ventanaDeConfirmarcionCorreo" class="card card-body animate__animated animate__fadeIn" style = "position: fixed; top: 50%; left: 50%; z-index: 1">'+
        '<label>Introduzca su contraseña</label>'+
        '<div class="form-group">'+
        '<input id="contraseñaCorreo" type="password" placeholder="Contraseña" class="form-control" autofocus>'+
        '</div>'+
        '<button onclick="actualizarCorreo()" type="button" class="btn btn-primary mt-3">Actualizar datos</button>'+
        '<button onclick="cerrarVentana(\'ventanaDeConfirmarcionCorreo\')" type="button" class="btn btn-primary mt-3">Cancelar</button>'+
        '</form>'

        document.body.insertAdjacentHTML('afterbegin', ventanaDeConfirmacion)
    }
}

function actualizarUsuario() {
    const contraseñaUsuario = document.getElementById("contraseñaUsuario");
    
    if(contraseñaUsuario.value != ""){
        const nuevosDatos = {
            nombre: usuarioNombre.value,
            direccion: usuarioDireccion.value,
            telefono: usuarioTelefono.value,
            cargo: usuarioCargo.value
        }

        const valores = [usuarioId.innerHTML, contraseñaUsuario.value, nuevosDatos]

        ipcRenderer.send('asynchronous-actualizarUsuario', valores)

        ipcRenderer.removeAllListeners('asynchronous-reply-actualizarUsuario')

        ipcRenderer.on('asynchronous-reply-actualizarUsuario', (event, resultado) => {
            ipcRenderer.send('asynchronous-consultarDatosDeUsuario', null)

            ipcRenderer.removeAllListeners('asynchronous-reply-consultarDatosDeUsuario')

            ipcRenderer.on('asynchronous-reply-consultarDatosDeUsuario', (event, resultado) => {
                mostrarDatos(resultado)
            })
        })

        cerrarVentana("ventanaDeConfirmarcionUsuario")
        
    } else alert("introdusca su contraseña de usuario")
}

function actualizarContraseña() {
    const contraseñaUsuario = document.getElementById("contraseñaContraseña");
    
    if(contraseñaUsuario.value != ""){
        const valores = [usuarioId.innerHTML, contraseñaUsuario.value, nuevaContraseña.value]

        ipcRenderer.send('asynchronous-actualizarContraseña', valores)

        cerrarVentana("ventanaDeConfirmarcionContraseña")
    } else alert("introdusca su actual contraseña de usuario")
}

function actualizarCorreo() {
    const contraseñaUsuario = document.getElementById("contraseñaCorreo");
    
    if(contraseñaUsuario.value != ""){
        const valores = [usuarioId.innerHTML, contraseñaUsuario.value, usuarioEmail.value]

        ipcRenderer.send('asynchronous-actualizarCorreo', valores)

        ipcRenderer.removeAllListeners('asynchronous-reply-actualizarCorreo')

        ipcRenderer.on('asynchronous-reply-actualizarCorreo', (event, resultado) => {
            ipcRenderer.send('asynchronous-consultarDatosDeUsuario', null)

            ipcRenderer.removeAllListeners('asynchronous-reply-consultarDatosDeUsuario')

            ipcRenderer.on('asynchronous-reply-consultarDatosDeUsuario', (event, resultado) => {
                mostrarDatos(resultado)
            })
        })

        cerrarVentana("ventanaDeConfirmarcionCorreo")
        
    } else alert("introdusca su contraseña de usuario")
}

function cerrarVentana(ventanaId){
    const ventana = document.getElementById(ventanaId);

    ventana.remove()
}