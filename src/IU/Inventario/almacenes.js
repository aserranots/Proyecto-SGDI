const {ipcRenderer} = require("electron")

const agregarAlmacenNombre = document.getElementById("Nombre");
const agregarAlmacenCostoDeServicios = document.getElementById("CostoDeServicios");
const agregarAlmacenCostoDeAlmacenamiento = document.getElementById("CostoDeAlmacenamiento");
const formulario = document.getElementById("formularioCrearAlmacen");
const listaUbicacionActual = document.getElementById("listaUbicacionActual");
const modificarUbicacionNombre = document.getElementById("modificarUbicacionNombre");
const modificarUbicacion = document.getElementById("modificarUbicacion");
const eliminarUbicacionNombre = document.getElementById("eliminarUbicacionNombre");
const listaEliminarUbicacionNombre = document.getElementById("listaEliminarUbicacionNombre");
const eliminarUbicacion = document.getElementById("eliminarUbicacion");

formulario.addEventListener('click', (e) => {
    if(agregarAlmacenNombre.value != "" && agregarAlmacenCostoDeServicios.value != "" && agregarAlmacenCostoDeAlmacenamiento.value != ""){
        almacen = {
            nombre: agregarAlmacenNombre.value,
            costo_almacenamiento: agregarAlmacenCostoDeServicios.value,
            costo_servicios: agregarAlmacenCostoDeAlmacenamiento.value
        }

        ipcRenderer.send('asynchronous-crearAlmacen', almacen)
    }
})

/*modificarUnidad.addEventListener('click', (e) => {
    if(unidadActual.value != "", modificarUnidadNombre.value != "" && modificarUnidadSimbolo.value != ""){
        unidad = {
            nombre: modificarUnidadNombre.value,
            simbolo: modificarUnidadSimbolo.value
        }

        ipcRenderer.send('asynchronous-actualizarUnidad', [unidadActual.value, unidad])
    }
})

eliminarUnidad.addEventListener('click', (e) => {
    if(eliminarUnidadNombre.value != ""){
        ipcRenderer.send('asynchronous-eliminarUnidad', eliminarUnidadNombre.value)
    }
})*/