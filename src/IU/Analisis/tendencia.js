const {ipcRenderer} = require("electron")

var ctx = document.getElementById("myChart").getContext("2d");
const formulario = document.getElementById("formularioConsulta")
const valorBusqueda = document.getElementById("valorBusqueda")
const buscarListaCoincidencias = document.getElementById("coincidencias")
const criterioBusqueda = document.getElementById("criterioBusqueda")
const fechaInicial = document.getElementById("fechaInicial")
const fechaFinal = document.getElementById("fechaFinal")

formulario.addEventListener("submit", (e) => {
    e.preventDefault();

    if(valorBusqueda.value != ""){
        const criterios = [
            "codigo_insumo",
            valorBusqueda.value
        ]
        
        ipcRenderer.send('asynchronous-buscarMovimientoSimple', criterios)

        ipcRenderer.removeAllListeners('asynchronous-reply-buscarMovimientoSimple')
    
        ipcRenderer.on('asynchronous-reply-buscarMovimientoSimple', (event, movimientos) => {
            if(movimientos.length != 0){
                let datos = []
            
                let dato

                /*if(fechaInicial.value == "" && fechaFinal.value == ""){
                    dato = {
                        fecha: new Date(movimiento.fecha).toLocaleString('es-ES'),
                        cantidad: movimiento.cantidad_insumo
                    }
                }else if(fechaInicial.value != "" && fechaFinal.value == ""){
                    if(new Date(movimiento.fecha).getTime() >= new Date(fechaInicial.value).getTime()){
                        dato = {
                            fecha: new Date(movimiento.fecha).toLocaleString('es-ES'),
                            cantidad: movimiento.cantidad_insumo
                        }
                    }
                }else if(fechaInicial.value == "" && fechaFinal.value != ""){
                    if(new Date(movimiento.fecha).getTime() <= new Date(fechaFinal.value).getTime()){
                        dato = {
                            fecha: new Date(movimiento.fecha).toLocaleString('es-ES'),
                            cantidad: movimiento.cantidad_insumo
                        }
                    }
                }else */if(fechaInicial.value != "" && fechaFinal.value != ""){
                    const dias = diasEntreDosFechas(new Date(fechaInicial.value), new Date(fechaFinal.value))
                    
                    let pronostico, desabastecimientoAnterior
                    let mañana
                    
                    if(dias != undefined){
                        dias.forEach(function(dia){
                            let extracciones = 0, reingresos = 0

                            movimientos.forEach(function(movimiento){
                                let diaMovimiento = new Date(movimiento.fecha)
                                diaMovimiento.setTime(diaMovimiento.getTime() - diaMovimiento.getMilliseconds() - diaMovimiento.getSeconds() * 1000 - diaMovimiento.getMinutes() * 60000 - diaMovimiento.getHours() * 3600000)
                                //console.log(dia.getTime+"="+diaMovimiento.getTime())
                                if(dia.getTime() == diaMovimiento.getTime()){
                                    if(movimiento.tipo == "extraccion"){
                                        extracciones += movimiento.cantidad_insumo
                                    }

                                    if(movimiento.tipo == "reingreso"){
                                        reingresos += movimiento.cantidad_insumo
                                    }
                                }
                            })

                            let desabastecimiento = 0

                            if(extracciones > reingresos) desabastecimiento = extracciones - reingresos
                            if(pronostico != undefined) pronostico = 0.7 * desabastecimientoAnterior + (0.3) * pronostico; else pronostico = desabastecimiento

                            dato = {
                                fecha: new Date(dia).toLocaleString('es-ES'),
                                cantidadReal: desabastecimiento,
                                cantidadEstimada: pronostico
                            }

                            desabastecimientoAnterior = desabastecimiento

                            console.log(dato)
                            if(dato != undefined){
                                datos.push(dato)
                            }

                            mañana = dia.setTime(dia.getTime() + 86400000)
                        })

                        if(pronostico != undefined) pronostico = 0.7 * desabastecimientoAnterior + (0.3) * pronostico; else pronostico = desabastecimiento

                        dato = {
                            fecha: mañana.toLocaleString('es-ES'),
                            cantidadReal: undefined,
                            cantidadEstimada: pronostico
                        }

                        console.log(dato)
                        if(dato != undefined){
                            datos.push(dato)
                        }
                    }
                }

                graficar(datos, "Insumo: "+movimientos[0].codigo_insumo)
            }else{
                alert("Aún no se ha hecho ningun movimiento sobre este insumo")
            }
        })
    }else alert("Ingrese algún valor")
})

function diasEntreDosFechas(fechaInicial, fechaFinal){
      
    if(fechaFinal.getTime() > fechaInicial.getTime()){
        let dias = []

        let fechaInicialDia = new Date()
        let fechaFinalDia = new Date()

        fechaInicialDia.setTime(fechaInicial.getTime() - fechaInicial.getMilliseconds() - fechaInicial.getSeconds() * 1000 - fechaInicial.getMinutes() * 60000 - fechaInicial.getHours() * 3600000)
        fechaFinalDia.setTime(fechaFinal.getTime() - fechaFinal.getMilliseconds() - fechaFinal.getSeconds() * 1000 - fechaFinal.getMinutes() * 60000 - fechaFinal.getHours() * 3600000)
        dias.push(new Date(fechaInicialDia))
        let cont = 0
        while(fechaInicialDia.getTime() != fechaFinalDia.getTime() && cont < 100){

            fechaInicialDia.setTime(fechaInicialDia.getTime() + 86400000)

            dias.push(new Date(fechaInicialDia))

            cont++
        }

        return dias
    }
}

valorBusqueda.addEventListener('keyup', (e) => {
    const criterios = [
        "codigo",
        valorBusqueda.value
    ]

    ipcRenderer.send('asynchronous-buscarInsumoProgresivamente', criterios)
    
    ipcRenderer.removeAllListeners('asynchronous-reply-buscarInsumoProgresivamente')

    ipcRenderer.on('asynchronous-reply-buscarInsumoProgresivamente', (event, resultado) => {
        listarCoincidencias(resultado)
    })
})

function listarCoincidencias(coincidencias) {
    let lista = ""

    coincidencias.forEach(function(coincidencia) {
        lista += '<option>'+coincidencia.codigo+'</option>'     
    });

  buscarListaCoincidencias.innerHTML = lista
}

function graficar(datosGrafica, titulo){
    let fechas = [], datos = [], datos2 = []

    datosGrafica.forEach(function(datoGrafica){
        fechas.push(datoGrafica.fecha)
        datos.push(datoGrafica.cantidadReal)
        datos2.push(datoGrafica.cantidadEstimada)
    })

    const data = {
        labels: fechas,
        datasets: [{
            label: "real",
            data: datos,
            borderColor: 'red',
            backgroundColor: 'transparent'
        }, {label: "estimado",
            data: datos2,
            borderColor: 'blue',
            backgroundColor: 'transparent'
        }]
    };

    const config = {
        type: 'line',
        data: data,
        options: {
        responsive: true,
        plugins: {
            legend: {
            position: 'top',
            },
            title: {
            display: true,
            text: 'Chart.js Line Chart'
            }
        }
    },
    };

    var myChart = new Chart(ctx, config)
}