const {remote, ipcRenderer} = require("electron")

const formulario = document.getElementById("buscarProveedor");
const buscarProveedorBusquedaSimple = document.getElementById("busquedaSimple");
const buscarProveedorBusquedaAvanzada = document.getElementById("busquedaAvanzada");
const buscarProveedorOpcionBusquedaSimple = document.getElementById("opcionBusquedaSimple");
const buscarProveedorOpcionBusquedaAvanzada = document.getElementById("opcionBusquedaAvanzada");
const buscarProveedorBusquedaSimpleValor = document.getElementById("valorBusquedaSimple");
const buscarProveedorBusquedaSimpleCriterio = document.getElementById("criterioBusquedaSimple");
let buscarProveedorListaCoincidencias = document.getElementById("coincidencias");
const proveedorId = document.getElementById("id");
const proveedorNombre = document.getElementById("nombre");
const proveedorDireccion = document.getElementById("direccion");
const proveedorTelefono = document.getElementById("telefono");
const proveedorEmail = document.getElementById("email");
const proveedorContacto = document.getElementById("contacto");
let buscarProveedorResultado = document.getElementById("resultado");
let proveedorActualizar = document.getElementById("actualizar");

/*let resProductoNombre = document.getElementById("res_nombre");
let resProductoID = document.getElementById("res_id");
let resProductoEtiqueta = document.getElementById("res_etiqueta");
let resProductoUnidad = document.getElementById("res_unidad");
let resProductoCantidad = document.getElementById("res_cantidad");*/
let listaExistencias = document.getElementById("listaExistencias");

buscarProveedorOpcionBusquedaSimple.addEventListener('click', (e) => {
    buscarProveedorBusquedaSimple.hidden = false
    buscarProveedorBusquedaAvanzada.hidden = true
})

buscarProveedorOpcionBusquedaAvanzada.addEventListener('click', (e) => {
    buscarProveedorBusquedaAvanzada.hidden = false
    buscarProveedorBusquedaSimple.hidden = true
})

buscarProveedorBusquedaSimpleValor.addEventListener('keyup', (e) => {
    const criterios = [
        buscarProveedorBusquedaSimpleCriterio.value,
        buscarProveedorBusquedaSimpleValor.value
    ]

    if(criterios[0] == "identificador") criterios[0] = "id"
    if(criterios[0] == "dirección") criterios[0] = "direccion"
    if(criterios[0] == "teléfono") criterios[0] = "telefono"

    ipcRenderer.send('asynchronous-buscarProveedorProgresivamente', criterios)
    
    ipcRenderer.on('asynchronous-reply-buscarProveedorProgresivamente', (event, resultado) => {
        listarCoincidencias(resultado)
    })
})

formulario.addEventListener("submit", (e) => {
    e.preventDefault();

    if(buscarProveedorOpcionBusquedaSimple.checked){
        if(buscarProveedorBusquedaSimpleValor.value != "" || buscarProveedorBusquedaSimpleCriterio.value == "teléfono" ||
        buscarProveedorBusquedaSimpleCriterio.value == "email" || buscarProveedorBusquedaSimpleCriterio.value == "contacto"){
            const criterios = [
                buscarProveedorBusquedaSimpleCriterio.value,
                buscarProveedorBusquedaSimpleValor.value
            ]
            
            if(criterios[0] == "identificador") criterios[0] = "id"
            if(criterios[0] == "dirección") criterios[0] = "direccion"
            if(criterios[0] == "teléfono") criterios[0] = "telefono"

            ipcRenderer.send('asynchronous-buscarProveedorSimple', criterios)
            
            ipcRenderer.removeAllListeners('asynchronous-reply-buscarProveedorSimple')

            ipcRenderer.on('asynchronous-reply-buscarProveedorSimple', (event, resultado) => {
                listarProveedor(resultado)
            })
        }else{
            if(buscarProveedorBusquedaSimpleCriterio.value == "identificador" || buscarProveedorBusquedaSimpleCriterio.value == "nombre" ||
            buscarProveedorBusquedaSimpleCriterio.value == "dirección"){
                ipcRenderer.send('asynchronous-buscarTodosLosProveedores', undefined)
                
                ipcRenderer.removeAllListeners('asynchronous-reply-buscarTodosLosProveedores')

                ipcRenderer.on('asynchronous-reply-buscarTodosLosProveedores', (event, resultado) => {
                    listarProveedor(resultado)
                })
            }
        }
    }

    if(buscarProveedorOpcionBusquedaAvanzada.checked){
        if(proveedorId.value != "" || proveedorNombre.value != "" || proveedorDireccion.value != "" || 
        proveedorTelefono.value != "" || proveedorEmail.value != "" || proveedorContacto.value != ""){

            const proveedor = {
                id: proveedorId.value,
                nombre: proveedorNombre.value,
                direccion: proveedorDireccion.value,
                telefono: proveedorTelefono.value,
                email: proveedorEmail.value,
                contacto: proveedorContacto.value
            }

            ipcRenderer.send('asynchronous-buscarProveedorAvanzado', proveedor)

            ipcRenderer.removeAllListeners('asynchronous-reply-buscarProveedorAvanzado')

            ipcRenderer.on('asynchronous-reply-buscarProveedorAvanzado', (event, resultado) => {
                listarProveedor(resultado)
            })
        }else alert("Ingrese algún valor")
    }
})

function listarCoincidencias(coincidencias) {
    let lista = ""

    coincidencias.forEach(function(coincidencia) {
        switch (buscarProveedorBusquedaSimpleCriterio.value) {
            case 'identificador':
                lista += '<option>'+coincidencia.id+'</option>'
                break;
            case 'nombre':
                lista += '<option>'+coincidencia.nombre+'</option>'
                break;
            case 'dirección':
                lista += '<option>'+coincidencia.direccion+'</option>'
                break;
            case 'teléfono':
                lista += '<option>'+coincidencia.telefono+'</option>'
                break;
            case 'email':
                lista += '<option>'+coincidencia.email+'</option>'
                break;
            case 'contacto':
                lista += '<option>'+coincidencia.contacto+'</option>'
        }       
    });

    buscarProveedorListaCoincidencias.innerHTML = lista
}

function actualizarProveedor(codigoProveedor){
    const formularioActualizar = document.getElementById("formularioActualizar");
    const idActualizado = document.getElementById("idActualizar");
    const nombreActualizado = document.getElementById("nombreaActualizar");
    const direccionActualizado = document.getElementById("direccionActualizar");
    const telefonoActualizado = document.getElementById("telefonoActualizar");
    const email = document.getElementById("emailActualizar");
    const contacto = document.getElementById("contactoActualizar");
    
    const proveedor = {
        id: idActualizado.value,
        nombre: nombreActualizado.value,
        direccion:  direccionActualizado.value,
        telefono: telefonoActualizado.value,
        email: email.value,
        contacto: contacto.value,
    }

    ipcRenderer.send('asynchronous-actualizarProveedor', [codigoProveedor, proveedor])

    formularioActualizar.remove()
}

function eliminarProveedor(idProveedor){
    const confirmacionEliminar = document.getElementById("confirmacionEliminar")

    buscarProveedorResultado.removeChild(document.getElementById(idProveedor))

    ipcRenderer.send('asynchronous-eliminarProveedor', idProveedor)

    confirmacionEliminar.remove()
}

function cerrarVentana(ventanaId){
    const ventana = document.getElementById(ventanaId);

    ventana.remove()
}

function desplegarVentanaActualizar(proveedor){
    const ventanaActualizar = '<form id="formularioActualizar" class="card card-body animate__animated animate__fadeIn" style="position: fixed; z-index: 1; margin-left: 40%">'+
                                '<div class="form-group mb-1">'+
                                '<label>Identificador*</label>'+
                                '<input id="idActualizar" type="text" value="'+proveedor.id+'" class="form-control mb-2">'+
                                '</div>'+
                                '<label>Nombre*</label>'+
                                '<div class="form-group mb-1">'+
                                '<input id="nombreaActualizar" type="text" value="'+proveedor.nombre+'" class="form-control mb-2">'+
                                '</div>'+
                                '<label>Dirección*</label>'+
                                '<div class="form-group mb-1">'+
                                '<input id="direccionActualizar" type="text" value="'+proveedor.direccion+'" class="form-control mb-2">'+
                                '</div>'+
                                '<label>Teléfono*</label>'+
                                '<div class="form-group mb-1">'+
                                '<input id="telefonoActualizar" type="text" value="'+proveedor.telefono+'" class="form-control mb-2">'+
                                '</div>'+
                                '<label>Email*</label>'+
                                '<div class="form-group mb-1">'+
                                '<input id="emailActualizar" type="text" value="'+proveedor.email+'" class="form-control mb-2">'+
                                '</div>'+
                                '<label>Contacto</label>'+
                                '<div class="form-group mb-1">'+
                                '<input id="contactoActualizar" type="number" value="'+proveedor.contacto+'" class="form-control mb-2">'+
                                '</div>'+
                                '<button onclick="actualizarProveedor(\''+proveedor.id+'\')" type="button" class="btn btn-primary mt-2">Actualizar</button>'+
                                '<button onclick="cerrarVentana(\'formularioActualizar\')" type="button" class="btn btn-primary mt-2">Cancelar</button>'+
                                '</form>'

    document.body.insertAdjacentHTML('afterbegin', ventanaActualizar)
}

function desplegarVentanaEliminar(idProveedor, nombreProveedor){
    const ventanaEliminar = '<div id="confirmacionEliminar" class="card card-body animate__animated animate__flipInX" style="position: fixed; z-index: 1; margin-top: 20%; margin-left: 30%">'+
                                '<p>¿Está seguro que desea eliminar al proveedor '+nombreProveedor+' ('+idProveedor+')?</p>'+
                                '<button onclick="eliminarProveedor(\''+idProveedor+'\')" type="button" class="btn btn-primary mt-3">Eliminar</button>'+
                                '<button onclick="cerrarVentana(\'confirmacionEliminar\')" type="button" class="btn btn-primary mt-3">Cancelar</button>'+
                                '</div>'
    
    document.body.insertAdjacentHTML('afterbegin', ventanaEliminar)
}

function listarProveedor(proveedores) {
    let filas = ""
    
    proveedores.forEach(function(proveedor) {
        filas += '<tr id="'+proveedor.id+'" class="animate__animated animate__backInLeft">'+
                    '    <td>'+proveedor.id+'</td>'+
                    '    <td>'+proveedor.nombre+'</td>'+
                    '    <td>'+proveedor.direccion+'</td>'+
                    '    <td>'+proveedor.telefono+'</td>'+
                    '    <td>'+proveedor.email+'</td>'+
                    '    <td>'+proveedor.contacto+'</td>'+
                    '    <td><button onclick="desplegarVentanaActualizar({id:\''+proveedor.id+'\',nombre:\''+proveedor.nombre+
                    '\',direccion:\''+proveedor.direccion+'\',telefono:\''+proveedor.telefono+'\',email:\''+proveedor.email+'\',contacto:\''+proveedor.contacto+'\'})" type="button" class="btn btn-primary mt-3">Actualizar</button></td>'+
                    '    <td><button onclick="desplegarVentanaEliminar(\''+proveedor.id+'\', \''+proveedor.nombre+'\')" type="button" class="btn btn-primary mt-3">Eliminar</button></td>'+
                    '</tr>'
    });
    
    buscarProveedorResultado.innerHTML = filas
}

buscarProveedorBusquedaSimpleCriterio.onchange = function(){
    buscarProveedorBusquedaSimpleValor.value = ""
    buscarProveedorListaCoincidencias.innerHTML = ""

    if(buscarProveedorBusquedaSimpleCriterio.value == "cantidad" || buscarProveedorBusquedaSimpleCriterio.value == "stock máximo" || 
    buscarProveedorBusquedaSimpleCriterio.value == "stock mínimo" || buscarProveedorBusquedaSimpleCriterio.value == "costo"){
        buscarProveedorBusquedaSimpleValor.type = "number"
    }else{
        buscarProveedorBusquedaSimpleValor.type = "text"
    }
}