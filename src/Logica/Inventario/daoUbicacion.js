const {Notification} = require("electron");

class DAOUbicacion {
    constructor (conexion) {
        this.conexion = conexion;
    }

    async crearUbicacion(ubicacion) {
        try {
            const resp = await this.conexion.query('INSERT INTO ubicacion SET ?', ubicacion);

            new Notification({
                title: "Inventario",
                body: "Ubicacion agregada"
            }).show();

            return resp
        } catch (error) {
            console.log(error);
        }
    }

    async leerUbicaciones() {
        try {
            const resp = await this.conexion.query('SELECT * FROM ubicacion');
            return resp

        } catch (error) {
            console.log(error);
        }
    }

    async actualizarUbicacion(nombre, nuevaUbicacion) {
        try {
            const resp1 = await this.conexion.query('UPDATE ubicacion SET nombre = ? WHERE nombre = ?', [nuevaUbicacion, nombre]);
            const resp2 = await this.conexion.query('UPDATE etiqueta SET ubicacion = ? WHERE ubicacion = ?', [nuevaUbicaciona, nombre]);
            
            new Notification({
                title: "Inventario",
                body: "Ubicacion modificada"
            }).show();

            const resp = [resp1, resp2]
            return resp
        } catch (error) {
            console.log(error);
        }
    }

    async eliminarUbicacion(nombre) {
        try {
            const resp1 = await this.conexion.query('DELETE FROM ubicacion WHERE nombre = ?', nombre);
            const resp2 = await this.conexion.query('DELETE FROM etiqueta WHERE ubicacion = ?', nombre);

            new Notification({
                title: "Inventario",
                body: "Ubicacion eliminada"
            }).show();

            const resp = [resp1, resp2]
            return resp
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = DAOUbicacion