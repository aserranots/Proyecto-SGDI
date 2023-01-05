const {Notification} = require("electron");

class DAOProveedor {

    constructor (conexion) {
        this.conexion = conexion;
    }

    async crear(nuevoProveedor) {
        try {
            await this.conexion.query('INSERT INTO proveedor SET ?', nuevoProveedor);
    
            new Notification({
                title: "Proveedor",
                body: "Proveedor añadido"
            }).show();
        } catch (error) {
            //console.log(error);
            if(error.code == 'ER_DUP_ENTRY'){
                return 'Ya existe un proveedor con el mismo identificador';
            }
        }

        return 'OK'
    }

    async leer(id) {
        try {
            const proveedor = await this.conexion.query("SELECT * FROM proveedor WHERE id = ?", id);
    
            return proveedor
        } catch (error) {
            console.log(error);
        }
    }

    async leerTodo() {
        try {
            const proveedores = await this.conexion.query("SELECT * FROM proveedor");
    
            return proveedores
        } catch (error) {
            console.log(error);
        }
    }

    async leerSegunCualquierValor(valores) {
        let condicionConsulta = ""
    
        if(valores.id != "") condicionConsulta += "id = '"+valores.id+"' "
        if(valores.nombre != ""){
            if(condicionConsulta == "") condicionConsulta += "nombre = '"+valores.nombre+"' "; else condicionConsulta += "AND nombre = '"+valores.nombre+"' "
        }
        if(valores.direccion != ""){
            if(condicionConsulta == "") condicionConsulta += "direccion = '"+valores.direccion+"' "; else condicionConsulta += "AND direccion = '"+valores.direccion+"' "
        }
        if(valores.telefono != ""){
            if(condicionConsulta == "") condicionConsulta += "telefono = '"+valores.telefono+"' "; else condicionConsulta += "AND telefono = '"+valores.telefono+"' "
        }
        if(valores.email != ""){
            if(condicionConsulta == "") condicionConsulta += "email = '"+valores.email+"' "; else condicionConsulta += "AND email = '"+valores.email+"' "
        }
        if(valores.contacto != ""){
            if(condicionConsulta == "") condicionConsulta += "contacto = '"+valores.contacto+"' "; else condicionConsulta += "AND contacto = '"+valores.contacto+"' "
        }
    
        try {
            if(condicionConsulta != ""){
                const proveedores = await this.conexion.query("SELECT * FROM proveedor WHERE "+condicionConsulta)

                return proveedores
            }
        } catch (error) {
            console.log(error);
        }
    }

    async leerSegunUnValor(campo, valor) {
        try {
            const proveedores = await this.conexion.query("SELECT * FROM proveedor WHERE "+campo+" = ?", valor);
    
            return proveedores
        } catch (error) {
            console.log(error);
        }
    }

    async leerProgresivamente(campo, valor) {
        try {
            const proveedores = await this.conexion.query("SELECT DISTINCT "+campo+" FROM proveedor WHERE "+campo+" like '"+valor+"%'");
    
            return proveedores
        } catch (error) {
            console.log(error);
        }
    }

    async actualizar(codigo, valores) {
        let condicionConsulta = ""
    
        if(valores.codigo != "") condicionConsulta += "codigo = '"+valores.codigo+"' "
        if(valores.categoria != ""){
            if(condicionConsulta == "") condicionConsulta += "categoria = '"+valores.categoria+"' "; else condicionConsulta += ", categoria = '"+valores.categoria+"' "
        }
        if(valores.etiqueta != ""){
            if(condicionConsulta == "") condicionConsulta += "etiqueta = '"+valores.etiqueta+"' "; else condicionConsulta += ", etiqueta = '"+valores.etiqueta+"' "
        }
        if(valores.nombre != ""){
            if(condicionConsulta == "") condicionConsulta += "nombre = '"+valores.nombre+"' "; else condicionConsulta += ", nombre = '"+valores.nombre+"' "
        }
        if(valores.unidad != ""){
            if(condicionConsulta == "") condicionConsulta += "unidad = '"+valores.unidad+"' "; else condicionConsulta += ", unidad = '"+valores.unidad+"' "
        }
        if(valores.stock_minimo != ""){
            if(condicionConsulta == "") condicionConsulta += "stock_minimo = "+valores.stock_minimo; else condicionConsulta += ", stock_minimo = "+valores.stock_minimo+" "
        }
        if(valores.stock_maximo != ""){
            if(condicionConsulta == "") condicionConsulta += "stock_maximo = "+valores.stock_maximo; else condicionConsulta += ", stock_maximo = "+valores.stock_maximo+" "
        }
        if(valores.costo != ""){
            if(condicionConsulta == "") condicionConsulta += "costo = "+valores.costo; else condicionConsulta += ", costo = "+valores.costo
        }
    
        try {
            if(condicionConsulta != ""){
                const resp = await this.conexion.query("UPDATE insumo SET "+condicionConsulta+" WHERE id = ?", codigo)
                
                new Notification({
                    title: "Inventario",
                    body: "Insumo actualizado"
                }).show();

                return resp
            }
        } catch (error) {
            console.log(error);
        }
    }

    async actualizarSimple(codigo, insumoActualizado) {
        try {
            const resp = await this.conexion.query("UPDATE insumo SET ? WHERE id = ?", [insumoActualizado, codigo])
            
            new Notification({
                title: "Inventario",
                body: "Insumo actualizado"
            }).show();

            return resp
        } catch (error) {
            console.log(error);
        }
    }

    async eliminar(codigo) {
        try {
            const resp = await this.conexion.query("DELETE FROM proveedor WHERE id = ?", codigo);
            
            new Notification({
                title: "Proveedor",
                body: "Proveedor eliminado"
            }).show();

            return resp
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = DAOProveedor