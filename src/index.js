// Dependencias:
require('dotenv').config();
const config = require('../config.json');
const { cargarComandos } = require('./setup');
const Discord = require('discord.js');

try {
    const comandos = cargarComandos() || new Map();
    console.log("> Comandos registrados:", comandos.entries());

    const client = new Discord.Client();

    client.on('ready', () => {
        client.user.setStatus('online');
        console.log("> Bot conectado, escuchando solicitudes...");
    });

    client.on('message', (mensaje) => {
        if (client.user.equals(mensaje.author)) return;
        if (!mensaje.content.startsWith(config.prefix)) return;

        // Extraer el comando y sus argumentos.
        let comandoCompleto = mensaje.content.replace(config.prefix, '').split(new RegExp(/\s+/));
        let comando = comandoCompleto.shift();
        let args = comandoCompleto;
    
        // Si el comando existe, ejecutarlo.
        if (comandos.get(comando)) {
            console.log(`> ${mensaje.createdAt.toLocaleString()} - ${mensaje.author.tag} -> Comando: "${config.prefix}${comando}",`, "Args:", args);
            try {
                comandos.get(comando).run(client, mensaje, args);
            } catch (error) {
                console.log(error);            
            }
        }
    });

    // El token de acceso ubicado en el archivo '.env'.
    client.login(process.env.TOKEN);
} catch (error) {
    console.error(error);
    throw error;
}