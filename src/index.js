// Dependencias:
require('dotenv').config();
const config = require('../config.json');
const { embeberErrorInterno } = require('./common_embeds.js');
const { cargarComandos } = require('./setup');
const Discord = require('discord.js');

try {
    const comandos = cargarComandos();
    console.log("> Comandos registrados:", comandos.entries());

    const client = new Discord.Client();

    client.on('ready', () => {
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
                // Intentar ejecutar el comando.
                comandos.get(comando).run(client, mensaje, args);
            } catch (error) {
                // Intentar notificar al usuario sobre el error.
                console.error(error);
                try {
                    mensaje.channel.send(embeberErrorInterno(error));
                } catch (_error) {
                    console.log("> No se pudo notificar al usuario sobre el error.");
                }
            }
        }
    });

    // Utiliza el token de acceso ubicado en el archivo '.env'.
    client.login(process.env.TOKEN);

} catch (error) {
    console.error(error);
}