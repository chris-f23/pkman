const Discord = require('discord.js');
const config = require('../config.json');

const embeberErrorInterno = (error) =>
    new Discord.MessageEmbed()
        .setTitle("Ha ocurrido un error!")
        .setDescription(error.message)
        .setColor(config.colors.error);

const embeberTiempoAgotado = () =>
    new Discord.MessageEmbed()
        .setTitle("Tiempo agotado!")
        .setDescription("Se ha agotado el tiempo, vuelve a intentarlo más tarde.")
        .setColor(config.colors.warning);

const embeberInformacion = (informacion) =>
    new Discord.MessageEmbed()
        .setTitle("Información:")
        .setDescription(informacion)
        .setColor(config.colors.info);

module.exports = {
    embeberErrorInterno,
    embeberTiempoAgotado,
    embeberInformacion
}