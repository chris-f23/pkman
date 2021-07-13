const config = require('../config.json');
const fs = require('fs');
const path = require('path');

function cargarComandos() {
    let comandos = new Map();
    try {
        let archivosComandos = fs.readdirSync(path.join(__dirname, 'commands'));    
        archivosComandos.forEach((nombreArchivo) => {
            const _rutaComando = path.join(__dirname, 'commands', nombreArchivo);
    
            // Omitir directorios.
            if (fs.lstatSync(_rutaComando).isDirectory()) return;
    
            // Verificar extension.
            if (path.extname(_rutaComando) === '.js') {
                // Obtiene el nombre del comando.
                let nombreComando = nombreArchivo.toLowerCase().replace('.js', '').replace('_', '-');
    
                // Obtiene el modulo del comando.
                let moduloComando = require(_rutaComando);
    
                // Registra el comando.
                comandos.set(nombreComando, moduloComando);
    
                console.log(`> Comando "${nombreArchivo}" registrado como "${config.prefix}${nombreComando}".`);
            } else {
                console.log(`> "${nombreArchivo}" no es un comando valido.`);
            }
        });
        
        if (comandos.length === 0) {
            throw new Error("No se encontraron comandos.");
        }
    } catch (error) {
        throw error;
    }

    return comandos;
}

module.exports = {
    cargarComandos
}