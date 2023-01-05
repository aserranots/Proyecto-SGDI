const mysql = require('promise-mysql')

const connection = mysql.createConnection({
    host: 'sdgdi.c0mbzvyk9gbp.us-east-1.rds.amazonaws.com',
    user: 'admin',
    password: 'Adminsdgdi',
    database: 'misdgdi',
    port: 3306
})

function getConnection(){
    return connection;
}

class ConectorBD {
    constructor(anfitrión, usuario, contraseña, baseDeDatos, puerto){
        this.anfitrión = anfitrión
        this.usuario = usuario
        this.contraseña = contraseña
        this.baseDeDatos = baseDeDatos
        this.puerto=puerto
        
    }

    async getConector(){
        const connection = await mysql.createConnection({
            host: this.anfitrión,
            user: this.usuario,
            password: this.contraseña,
            database: this.baseDeDatos,
            port:this.puerto

        })

        return connection;
    }
}

module.exports = ConectorBD;