const {BrowserWindow, ipcMain,  Notification} = require("electron");
const {getConnection} = require("./Logica/BaseDeDatos/database.js");
const CreadorDeTablas = require("./Logica/BaseDeDatos/creadorDeTablas.js");
const ConectorBD = require("./Logica/BaseDeDatos/database.js");
const DAOUsuario = require( "./Logica/Usuario/daoUsuario.js");
const DAOInsumo = require( "./Logica/Inventario/daoInsumo.js");
const DAOExistencia = require( "./Logica/Inventario/daoExistencia.js");
const DAOUtilidades = require( "./Logica/Inventario/daoUtilidades.js");
const DAOUbicacion = require( "./Logica/Inventario/daoUbicacion.js");
const DAOMovimiento = require( "./Logica/Inventario/daoMovimiento.js");
const CreadorUsuario = require("./Logica/Usuario/creadorUsuario.js");
const DAOMenu = require("./Logica/Inventario/daoMenu");
const DAOProveedor = require("./Logica/Proveedor/daoProveedor");
const norminv = require("norminv");
//const path = require('path');

var usuario

anfitrión = 'sdgdi.c0mbzvyk9gbp.us-east-1.rds.amazonaws.com'
usuarioBD = 'admin'
contraseña = 'Adminsdgdi'
baseDeDatos = 'sdgdi'
puerto = 3306
var conectorBD = new ConectorBD(anfitrión, usuarioBD, contraseña, baseDeDatos, puerto)

var dAOUsuario
var dAOInsumo
var dAOExistencia
var dAOUtilidades
var dAOUbicacion
var dAOMenu
var dAOProveedor

async function iniciarDAOs() {
    var connector = await conectorBD.getConector()
    dAOUsuario = new DAOUsuario(connector)
    dAOInsumo = new DAOInsumo(connector)
    dAOExistencia = new DAOExistencia(connector)
    dAOUtilidades = new DAOUtilidades(connector)
    dAOUbicacion = new DAOUbicacion(connector)
    dAOMovimiento = new DAOMovimiento(connector)
    dAOMenu = new DAOMenu(connector)
    dAOProveedor = new DAOProveedor(connector)
}

iniciarDAOs();

async function calcularStocks(){
    console.log("Esto tambien sucede")
    const insumos = await dAOInsumo.leerTodo()

    insumos.forEach(async function(insumo){
        if(insumo.costo_ordenar != null && insumo.tiempo_entrega != null){
            const movimientos = await dAOMovimiento.leerSegunUnValorOrdenadoPorFecha('codigo_insumo', insumo.codigo)

            if(movimientos.length >= 2){
                const date1 = movimientos[0].fecha.toString().replace( /[-]/g, '/' );
                let primeraFecha = new Date(Date.parse( date1 ))
                const date2 = movimientos[movimientos.length - 1].fecha.toString().replace( /[-]/g, '/' )
                let ultimaFecha = new Date(Date.parse( date2 ))

                if(ultimaFecha.getTime() - primeraFecha.getTime() > 2592000000){
                    let extracciones = 0, reingresos = 0

                    movimientos.forEach(function(movimiento){
                        if(movimiento.tipo == "extraccion") extracciones += movimiento.cantidad
                        if(movimiento.tipo == "reingreso") reingresos += movimiento.cantidad
                    })

                    const tiempoActividad = Math.trunc((ultimaFecha.getTime() - primeraFecha.getTime()) / 86400000)
                    const demanda = extracciones - reingresos
                    const demandaAnual = demanda * 365 / tiempoActividad
                    ubicaciones = await dAOUbicacion.leerUbicaciones()
                    existencias = await dAOExistencia.leerSegunUnValor("codigo_insumo", insumo.codigo)

                    ubicaciones.forEach(async function(ubicacion){
                        let valorTotalDelInventarioAnual = 0

                        existencias.forEach(async function(existencia){
                            if(existencia.ubicacion == ubicacion.nombre){
                                valorTotalDelInventarioAnual += existencia.cantidad_actual * insumo.costo
                            }
                        })

                        valorTotalDelInventarioAnual = valorTotalDelInventarioAnual * 365 / tiempoActividad

                        existencias.forEach(async function(existencia){
                            if(existencia.ubicacion == ubicacion.nombre){
                                existencia.costo_mantener = insumo.costo*ubicacion.costo_almacenamiento*ubicacion.costo_servicios/valorTotalDelInventarioAnual

                                const Q = Math.sqrt(2*demandaAnual*insumo.costo_ordenar/existencia.costo_mantener)
                                const P = (Math.pow(demandaAnual,2)/Q)/(existencia.costo_mantener/5000+Math.pow(demandaAnual,2)/Q)
                                const Z = norminv(P, 0, 1)
                                const stockMin = Math.round((demandaAnual / 365) * insumo.tiempo_entrega + Z)
                                const stockMax = stockMin+Q

                                existencia.stock_minimo = stockMin
                                existencia.stock_maximo =stockMax

                                await dAOExistencia.actualizarSimple(existencia.codigo, existencia)

                                //demandaDiaria = demanda/tiempoActividad

                                //existencia.stock_minimo = demandaDiaria * insumo.tiempo_entrega + P
                            }
                        })
                    })

                    //insumo.stock_minimo = demandaAnual * insumo.tiempo_entrega /365

                    //await dAOInsumo.actualizarSimple(insumo.codigo, insumo)
                }
            }
        }
    })
}

ipcMain.on('asynchronous-stockMinimo', async (event, arg) => {
    console.log("Esto sucede")
    calcularStocks()
})


/*async function calcularStockMaximo(){
    const insumos = await dAOInsumo.leerTodo()

    insumos.forEach(async function(insumo){
        
        if(insumo.stock_maximo == null && insumo.tiempo_entrega != null){

            const existencias = await dAOExistencia.leerSegunUnValor('codigo_insumo', insumo.codigo)

            const almacenes = await dAOAlmacen.leerAlmacen()
            let ubicaciones[]
            almacenes.forEach(async function(almacen){

                ubicaciones.push({
                    nombre: almacen.nombre,
                    costo: almacen.costo,
                    gasto: almacen.gasto,
                    cantidad: 0
                })
            })

            existencias.forEach(async function(existencia){
                ubicaciones.forEach(async function(ubicacion){
                    if(existencia.ubicacion == ubicacion.nombre){
                        ubicacion.cantidad++
                    }
                })
            })

            let costoMantenerInventario = 0

            ubicaciones.forEach(async function(ubicacion){
                if(ubicacion.cantidad != 0) costoMantenerInventario += ubicacion.cantidad * insumo.valor + ubicacion.costo + ubicacion.gasto
            })

            const movimientos = await dAOMovimiento.leerSegunUnValorOrdenadoPorFecha('codigo_insumo', insumo.codigo)()

            if(movimientos.lenght > 2){
                const date1 = movimientos[0].fecha.replace( /[-]/g, '/' );
                let primeraFecha = new Date(Date.parse( date ))

                const date2 = movimientos[movimientos.lenght - 1].fecha.replace( /[-]/g, '/' )
                let ultimaFecha = new Date(Date.parse( date ))

                if(ultimaFecha.getMilliseconds() - primeraFecha.getMilliseconds() > 2592000000){
                    const extracciones = 0, reingresos = 0

                    movimientos.forEach(function(movimiento){
                        if(movimiento.tipo == "extraccion") extracciones += movimiento.cantidad
                        if(movimiento.tipo == "reingreso") reingresos += movimiento.cantidad
                    })
                    
                    const tiempoActividad = Math.trunc((ultimaFecha.getMilliseconds() - primeraFecha.getMilliseconds()) / 86400000)
                    const demanda = extracciones - reingresos
                    const demandaAnual = demanda * 365 / tiempoActividad

                    insumo.stock_minimo = demandaAnual * insumo.tiempo_entrega /365

                    await dAOInsumo.actualizarSimple(insumo.codigo, insumo)
                }
            }
        }
    })
}*/

ipcMain.on('asynchronous-crearTablas', async (event, arg) => {
    creadorDeTablas = new CreadorDeTablas(await conectorBD.getConector());
    //await creadorDeTablas.crearTablaConsumible()
    //await creadorDeTablas.crearTablaExistencia()
    //await creadorDeTablas.crearTablaIngrediente()
    //await creadorDeTablas.crearTablaInsumo()
    //await creadorDeTablas.crearTablaIntemPedido()
    //await creadorDeTablas.crearTablaPedidoDeProveedor()
    //await creadorDeTablas.crearTablaPermisos()
    //await creadorDeTablas.crearTablaProveedor()
    //await creadorDeTablas.crearTablaUsuario()
    //await creadorDeTablas.crearTablaCategoria()
    //await creadorDeTablas.crearTablaEtiqueta()
    //await creadorDeTablas.crearTablaUnidad()
    //await creadorDeTablas.crearTablaMovimiento()
    //await creadorDeTablas.crearTablaUbicacion()
})

ipcMain.on('asynchronous-obtener-ventas', async (event) => {
    ventas = await dAOMenu.leerVentasPorDia();
    event.reply('asynchronous-obtener-ventas-reply', ventas)
})

ipcMain.on('asynchronous-obtener-ventas-semana', async (event) => {
    ventas = await dAOMenu.leerVentasPorSemana();
    event.reply('asynchronous-obtener-ventas-semana-reply', ventas)
})

ipcMain.on('asynchronous-obtener-ventas-mes', async (event) => {
    ventas = await dAOMenu.leerVentasPorMes();
    event.reply('asynchronous-obtener-ventas-mes-reply', ventas)
})

ipcMain.on('asynchronous-obtener-ventas-anual', async (event) => {
    ventas = await dAOMenu.leerVentasPorAnual();
    event.reply('asynchronous-obtener-ventas-anual-reply', ventas)
})

ipcMain.on('asynchronous-ingresar', async (event, credenciales) => {
    creadorUsuario = new CreadorUsuario(dAOUsuario);
    usuario = await creadorUsuario.ingresar(credenciales.usuario, credenciales.contraseña)

    if(usuario.id == credenciales.usuario) {
        event.reply('asynchronous-reply-ingresar', usuario)
    } else {
        event.reply('asynchronous-reply-ingresar', "no usuario")
    }
})

ipcMain.on('asynchronous-crearUsuario', async (event, nuevoUsuario) => {
    creadorUsuario = new CreadorUsuario(dAOUsuario);

    creadorUsuario.crearNuevoUsuario(nuevoUsuario, "trabajador")
})

ipcMain.on('asynchronous-consultarDatosDeUsuario', async (event, arg) => {
    event.reply('asynchronous-reply-consultarDatosDeUsuario', usuario)
})

ipcMain.on('asynchronous-actualizarUsuario', async (event, valores) => {
    const resultado = await dAOUsuario.actualizar(valores[0], valores[1], valores[2])

    const consultaUsuario = await dAOUsuario.leer(valores[0], valores[1])

    usuario = consultaUsuario[0][0]

    event.reply('asynchronous-reply-actualizarUsuario', usuario)
})

ipcMain.on('asynchronous-actualizarContraseña', async (event, valores) => {
    const resultado = await dAOUsuario.actualizarContraseña(valores[0], valores[1], valores[2])
})

ipcMain.on('asynchronous-actualizarCorreo', async (event, valores) => {
    const resultado = await dAOUsuario.actualizarCorreo(valores[0], valores[1], valores[2])

    const consultaUsuario = await dAOUsuario.leer(valores[0], valores[1])

    usuario = consultaUsuario[0][0]

    event.reply('asynchronous-reply-actualizarCorreo', usuario)
})

ipcMain.on('asynchronous-crearInsumo', async (event, nuevoInsumo) => {
    let resp = []

    let validacionCategoria = false , validacionEtiqueta = false, validacionUnidad = false

    let categorias = await dAOUtilidades.leerCategorias()

    categorias.forEach(function(categoria){
        if(nuevoInsumo.categoria == categoria.nombre) validacionCategoria = true
    })

    if(!validacionCategoria) resp.push("La categoria ingresada no existe")

    let etiquetas = await dAOUtilidades.leerEtiquetas()

    etiquetas.forEach(function(etiqueta){
        if(nuevoInsumo.etiqueta == etiqueta.nombre) validacionEtiqueta = true
    })

    if(!validacionEtiqueta) resp.push("La etiqueta ingresada no existe")

    let unidades = await dAOUtilidades.leerUnidades()

    unidades.forEach(function(unidad){
        if(nuevoInsumo.unidad == unidad.nombre) validacionUnidad = true
    })

    if(!validacionUnidad) resp.push("La unidad ingresada no existe")

    //if(nuevoInsumo.stock_minimo <= nuevoInsumo.stock_maximo) validacionStock = true; else resp.push("El stock mínimo no debe ser mayor que el stock máximo")

    if(validacionCategoria && validacionEtiqueta && validacionUnidad){
        if(usuario.permisoCrearInsumo) dAOInsumo.crear(nuevoInsumo); else resp.push("No tiene permitido crear nuevos insumos")
    }

    event.reply('asynchronous-reply-crearInsumo', resp)
})

ipcMain.on('asynchronous-buscarInsumo', async (event, codigo) => {
    const resultado = await dAOInsumo.leer(codigo)

    event.reply('asynchronous-reply-buscarInsumo', resultado)
})

ipcMain.on('asynchronous-buscarInsumoProgresivamente', async (event, valores) => {
    const resultado = await dAOInsumo.leerProgresivamente(valores[0], valores[1])

    event.reply('asynchronous-reply-buscarInsumoProgresivamente', resultado)
})

ipcMain.on('asynchronous-buscarTodosLosInsumos', async (event, undefined) => {
    const resultado = await dAOInsumo.leerTodo()

    event.reply('asynchronous-reply-buscarTodosLosInsumos', resultado)
})

ipcMain.on('asynchronous-buscarInsumoSimple', async (event, valores) => {
    const resultado = await dAOInsumo.leerSegunUnValor(valores[0], valores[1])

    event.reply('asynchronous-reply-buscarInsumoSimple', resultado)
})

ipcMain.on('asynchronous-buscarInsumoAvanzado', async (event, valores) => {
    const resultado = await dAOInsumo.leerSegunCualquierValor(valores)

    event.reply('asynchronous-reply-buscarInsumoAvanzado', resultado)
})

ipcMain.on('asynchronous-actualizarInsumo', async (event, valores) => {
    const resultado = await dAOInsumo.actualizar(valores[0], valores[1])

    event.reply('asynchronous-reply-actualizarInsumo', resultado)
})

ipcMain.on('asynchronous-actualizarInsumoCantidad', async (event, valores) => {
    const resultado = await dAOInsumo.actualizarSumarCantidad(valores[0], valores[1])

    event.reply('asynchronous-reply-actualizarInsumo', resultado)
})

ipcMain.on('asynchronous-eliminarInsumo', async (event, codigo) => {
    const resultado = await dAOInsumo.eliminar(codigo)
    const resultado2 = await dAOExistencia.eliminarPorInsumo(codigo)

    //event.reply('asynchronous-reply-buscarInsumoAvanzado', resultado)
})

ipcMain.on('asynchronous-crearExistencia', async (event, nuevaExistencia) => {
    let resp = []

    let validacionInsumo = false , validacionCantidad = false, validacionUbicacion = false

    let insumos = await dAOInsumo.leerTodo()

    insumos.forEach(function(insumo){
        if(nuevaExistencia.codigo_insumo == insumo.codigo) validacionInsumo = true
    })

    if(!validacionInsumo) resp.push("El codigo de insumo ingresado no existe")

    if(nuevaExistencia.cantidad > 0) validacionCantidad = true

    if(!validacionCantidad) resp.push("La cantidad ingresada debe ser mayor a cero")

    let ubicaciones = await dAOUbicacion.leerUbicaciones()

    ubicaciones.forEach(function(ubicacion){
        if(nuevaExistencia.ubicacion == ubicacion.nombre) validacionUbicacion = true
    })

    if(!validacionUbicacion) resp.push("La ubicación ingresada no existe")

    if(validacionInsumo && validacionCantidad && validacionUbicacion){
        if(usuario.permisoCrearInsumo){
            let res = await dAOExistencia.crear(nuevaExistencia)

            if(res == "OK") await dAOInsumo.actualizarSumarCantidad(nuevaExistencia.codigo_insumo, nuevaExistencia.cantidad); else resp.push(res)
        }
    }
    
    event.reply('asynchronous-reply-crearExistencia', resp)
})

ipcMain.on('asynchronous-buscarExistencia', async (event, codigo) => {
    const resultado = await dAOExistencia.leer(codigo)

    event.reply('asynchronous-reply-buscarExistencia', resultado)
})

ipcMain.on('asynchronous-buscarExistenciaProgresivamente', async (event, valores) => {
    const resultado = await dAOExistencia.leerProgresivamente(valores[0], valores[1])

    event.reply('asynchronous-reply-buscarExistenciaProgresivamente', resultado)
})

ipcMain.on('asynchronous-buscarTodasLasExistencias', async (event, undefined) => {
    const resultado = await dAOExistencia.leerTodo()

    event.reply('asynchronous-reply-buscarTodasLasExistencias', resultado)
})

ipcMain.on('asynchronous-buscarExistenciaSimple', async (event, valores) => {
    const resultado = await dAOExistencia.leerSegunUnValor(valores[0], valores[1])

    event.reply('asynchronous-reply-buscarExistenciaSimple', resultado)
})

ipcMain.on('asynchronous-buscarExistenciaAvanzado', async (event, valores) => {
    const resultado = await dAOExistencia.leerSegunCualquierValor(valores)

    event.reply('asynchronous-reply-buscarExistenciaAvanzado', resultado)
})

ipcMain.on('asynchronous-actualizarExistencia', async (event, valores) => {
    const resultado = await dAOExistencia.actualizar(valores[0], valores[1])

    //event.reply('asynchronous-reply-actualizarExistencia', resultado)
})

ipcMain.on('asynchronous-actualizarExistenciaCantidad', async (event, valores) => {
    const resultadoExistencia = await dAOExistencia.actualizarSumarCantidad(valores[0], valores[1])

    if(resultadoExistencia == "OK"){
        const resultadoInsumo = await dAOInsumo.actualizarSumarCantidad(valores[2], valores[1])
    }

    event.reply('asynchronous-reply-actualizarExistenciaCantidad', resultadoExistencia)
})

ipcMain.on('asynchronous-eliminarExistencia', async (event, codigo) => {
    const resultado = await dAOExistencia.eliminar(codigo)

    event.reply('asynchronous-reply-buscarExistenciaAvanzado', resultado)
})

ipcMain.on('asynchronous-crearCategoria', async (event, nombre) => {
    const resultado = await dAOUtilidades.crearCategoria(nombre)

    //event.reply('asynchronous-reply-crearCategoria', resultado)
})

ipcMain.on('asynchronous-buscarCategorias', async (event, undefined) => {
    const categorias = await dAOUtilidades.leerCategorias()

    event.reply('asynchronous-reply-buscarCategorias', categorias)
})

ipcMain.on('asynchronous-actualizarCategoria', async (event, valores) => {
    const resultado = await dAOUtilidades.actualizarCategoria(valores[0], valores[1])

    //event.reply('asynchronous-reply-actualizarCategoria', resultado)
})

ipcMain.on('asynchronous-eliminarCategoria', async (event, nombre) => {
    const resultado = await dAOUtilidades.eliminarCategoria(nombre)

    //event.reply('asynchronous-reply-eliminarCategoria', resultado)
})

ipcMain.on('asynchronous-crearEtiqueta', async (event, nombre) => {
    const resultado = await dAOUtilidades.crearEtiqueta(nombre)

    //event.reply('asynchronous-reply-crearCategoria', resultado)
})

ipcMain.on('asynchronous-buscarEtiquetas', async (event, undefined) => {
    const etiquetas = await dAOUtilidades.leerEtiquetas()

    event.reply('asynchronous-reply-buscarEtiquetas', etiquetas)
})

ipcMain.on('asynchronous-actualizarEtiqueta', async (event, valores) => {
    const resultado = await dAOUtilidades.actualizarEtiqueta(valores[0], valores[1])

    //event.reply('asynchronous-reply-actualizarCategoria', resultado)
})

ipcMain.on('asynchronous-eliminarEtiqueta', async (event, nombre) => {
    const resultado = await dAOUtilidades.eliminarEtiqueta(nombre)

    //event.reply('asynchronous-reply-eliminarCategoria', resultado)
})

ipcMain.on('asynchronous-crearUnidad', async (event, nombre) => {
    const resultado = await dAOUtilidades.crearUnidad(nombre)

    //event.reply('asynchronous-reply-crearCategoria', resultado)
})

ipcMain.on('asynchronous-buscarUnidades', async (event, undefined) => {
    const unidades = await dAOUtilidades.leerUnidades()

    event.reply('asynchronous-reply-buscarUnidades', unidades)
})

ipcMain.on('asynchronous-actualizarUnidad', async (event, valores) => {
    const resultado = await dAOUtilidades.actualizarUnidad(valores[0], valores[1])

    //event.reply('asynchronous-reply-actualizarCategoria', resultado)
})

ipcMain.on('asynchronous-eliminarUnidad', async (event, nombre) => {
    const resultado = await dAOUtilidades.eliminarUnidad(nombre)

    //event.reply('asynchronous-reply-eliminarCategoria', resultado)
})

ipcMain.on('asynchronous-crearAlmacen', async (event, nuevoAlmacen) => {
    const resultado = await dAOUbicacion.crearUbicacion(nuevoAlmacen)

    //event.reply('asynchronous-reply-crearCategoria', resultado)
})

ipcMain.on('asynchronous-buscarAlmacenes', async (event, undefined) => {
    const almacenes = await dAOUbicacion.leerUbicaciones()

    event.reply('asynchronous-reply-buscarAlmacenes', almacenes)
})

ipcMain.on('asynchronous-actualizarAlmacen', async (event, valores) => {
    const resultado = await dAOUbicacion.actualizarUbicacion(valores[0], valores[1])

    //event.reply('asynchronous-reply-actualizarCategoria', resultado)
})

ipcMain.on('asynchronous-eliminarUbicacion', async (event, nombre) => {
    const resultado = await dAOUtilidades.eliminarUbicacion(nombre)

    //event.reply('asynchronous-reply-eliminarCategoria', resultado)
})

ipcMain.on('asynchronous-registrarMovimiento', async (event, movimiento) => {
    const resultado = await dAOMovimiento.crear(movimiento)

    //event.reply('asynchronous-reply-eliminarCategoria', resultado)
})

ipcMain.on('asynchronous-leerMovimiento', async (event, codigo) => {
    const resultado = await dAOMovimiento.leer(codigo)

    //event.reply('asynchronous-reply-eliminarCategoria', resultado)
})

ipcMain.on('asynchronous-buscarMovimientoSimple', async (event, valores) => {
    const resultado = await dAOMovimiento.leerSegunUnValor(valores[0], valores[1])

    event.reply('asynchronous-reply-buscarMovimientoSimple', resultado)
})

ipcMain.on('asynchronous-crearProveedor', async (event, nuevoProveedor) => {
    const resultado = await dAOProveedor.crear(nuevoProveedor)

    //event.reply('asynchronous-reply-crearCategoria', resultado)
})
ipcMain.on('asynchronous-buscarProveedor', async (event, codigo) => {
    const resultado = await dAOInsumo.leer(codigo)

    event.reply('asynchronous-reply-buscarProveedor', resultado)
})

ipcMain.on('asynchronous-buscarProveedorProgresivamente', async (event, valores) => {
    const resultado = await dAOProveedor.leerProgresivamente(valores[0], valores[1])

    event.reply('asynchronous-reply-buscarProveedorProgresivamente', resultado)
})

ipcMain.on('asynchronous-buscarTodosLosProveedores', async (event, undefined) => {
    const resultado = await dAOProveedor.leerTodo()

    event.reply('asynchronous-reply-buscarTodosLosProveedores', resultado)
})

ipcMain.on('asynchronous-buscarProveedorSimple', async (event, valores) => {
    const resultado = await dAOProveedor.leerSegunUnValor(valores[0], valores[1])

    event.reply('asynchronous-reply-buscarProveedorSimple', resultado)
})

ipcMain.on('asynchronous-buscarProveedorAvanzado', async (event, valores) => {
    const resultado = await dAOProveedor.leerSegunCualquierValor(valores)

    event.reply('asynchronous-reply-buscarProveedorAvanzado', resultado)
})

ipcMain.on('asynchronous-actualizarProveedor', async (event, valores) => {
    const resultado = await dAOProveedor.actualizar(valores[0], valores[1])

    event.reply('asynchronous-reply-actualizarProveedor', resultado)
})

ipcMain.on('asynchronous-eliminarProveedor', async (event, identificador) => {
    const resultado = await dAOUtilidades.eliminar(identificador)

    //event.reply('asynchronous-reply-eliminarCategoria', resultado)
})

//--------------------------------------------------

let ventanaPrincipal

function crearVentanaPrincipal(){
    ventanaPrincipal = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation : false,
            //preload: path.join(__dirname, 'app.js')
        }
    });

    ventanaPrincipal.loadFile('src/iu/index.html');
}

module.exports = {
    crearVentanaPrincipal
}

/*app.whenReady().then(crearVentanaPrincipal);

app.on('windows-all-close', function() {
    if(process.platform == 'darwin'){
        app.quit();
    }
});

app.on('activate', function() {
    if(BrowserWindow.getAllWindows().length == 0){
        crearVentanaPrincipal();
    }
});*/

/* In main process.
const { ipcMain }=require('electron')
ipcMain.on('asynchronous-message',(event, arg)=>{console.log(arg)
// prints "ping"  
event.reply('asynchronous-reply','pong')})
ipcMain.on('synchronous-message',(event, arg)=>{console.log(arg)
// prints "ping"  
event.returnValue='pong'})

 //In renderer process (web page).
 // NB. Electron APIs are only accessible from preload, unless contextIsolation is disabled.
 // See https://www.electronjs.org/docs/tutorial/process-model#preload-scripts for more details.
 const { ipcRenderer }=require('electron')
 console.log(ipcRenderer.sendSync('synchronous-message','ping'))
 // prints "pong"
 ipcRenderer.on('asynchronous-reply',(event, arg)=>{console.log(arg)
 // prints "pong"
})
ipcRenderer.send('asynchronous-message','ping')*/