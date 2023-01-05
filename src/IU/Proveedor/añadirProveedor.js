const {remote, ipcRenderer} = require("electron")

const formulario = document.getElementById("formularioCrearProveedor");
const proveedorId = document.getElementById("id");
const proveedorNombre = document.getElementById("nombre");
const proveedorDireccion = document.getElementById("direccion");
const proveedorTelefono = document.getElementById("telefono");
const proveedorEmail = document.getElementById("email");
const proveedorContacto = document.getElementById("contacto");

formulario.addEventListener("submit", (e) => {
    e.preventDefault();

    if(proveedorId.value == ""){
        alert("Ingrese un identificador")
    }else if(proveedorNombre.value == ""){
        alert("Ingrese un nombre")
    }else if(proveedorDireccion.value == ""){
        alert("Ingrese una dirección")
    }else{
        const nuevoInsumo = {
            id: proveedorId.value,
            nombre: proveedorNombre.value,
            direccion: proveedorDireccion.value,
            Telefono: proveedorTelefono.value,
            Email: proveedorEmail.value,
            Contacto: proveedorContacto.value
        }
    
        ipcRenderer.send('asynchronous-crearProveedor', nuevoInsumo)
    
        ipcRenderer.removeAllListeners('asynchronous-reply-crearProveedor')
        
        ipcRenderer.on('asynchronous-reply-crearProveedor', (event, resp) => {
            resp.forEach(function(res){
                alert(res)
            })
        })
    }
})