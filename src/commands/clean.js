const Discord = require('discord.js');
const { embeberErrorInterno, embeberInformacion } = require('../common_embeds.js');
const config = require('../../config.json');

const LIMITE_DEFECTO = 30;
const TIEMPO_ESPERA = 10000;

function calcularLimiteMensajes(limiteStr) {
    if (limiteStr === undefined) {
        return LIMITE_DEFECTO;
    }

    let limiteInt = parseInt(limiteStr);
    if (isNaN(limiteInt) || limiteInt < 1 || limiteInt > 99)
        throw new Error("El limite especificado debe ser un numero entre 1 y 100.");

    return limiteInt;
}

/**
 * El comando 'clean' permite borrar hasta 30 mensajes que hayan sido enviados por el bot
 * o que comiencen con el prefijo del bot.
 */
module.exports.run = (client, message, args) => {
    // El primer parametro especifica el limite de mensajes (30 por defecto).
    let limiteMensajes = calcularLimiteMensajes(args[0]);

    message.channel.messages.fetch({ limit: limiteMensajes })
        .then(async (resultados) => {
            // Eliminar los mensajes.
            const mensajesPorEliminar = await resultados.filter((_mensaje) => {
                return (_mensaje.author === client.user) ||
                    (_mensaje.author === message.author && _mensaje.content.startsWith(config.prefix))
            });

            message.channel.bulkDelete(mensajesPorEliminar);

            // Notificar al usuario y eliminar el mensaje.
            message.reply(
                embeberInformacion([
                    `- Se buscaron ${limiteMensajes} mensajes.`,
                    `- Se borraron ${mensajesPorEliminar.array().length} mensajes.`,
                    `- Este mensaje se eliminará en ${TIEMPO_ESPERA / 1000} segundos...`
                ]))
                .then((mensajeInformacion) => {
                    setTimeout(() => {
                        mensajeInformacion.delete().catch((error) => {
                            console.log(`> Error controlado (${error.name}: ${error.message})`);
                        });

                    }, TIEMPO_ESPERA);
                });
        })
        .catch(error => {
            try {
                console.error(error);
                message.channel.send(embeberErrorInterno(error))
            } catch (_error) {
                console.log("> No se pudo notificar al usuario sobre el error.");
            }
        });
}