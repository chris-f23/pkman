const Discord = require('discord.js');
const pokemonData = require('../../fanzeyi-pokedex.json');

function convertirDigitoEnEmoji(digito) {
    switch (digito) {
        case 0: return '0️⃣';
        case 1: return '1️⃣';
        case 2: return '2️⃣';
        case 3: return '3️⃣';
        case 4: return '4️⃣';
        case 5: return '5️⃣';
        case 6: return '6️⃣';
        case 7: return '7️⃣';
        case 8: return '8️⃣';
        case 9: return '9️⃣';
        default: throw new Error(`El digito especificado no es un numero valido.`);
    }
}

function convertirEmojiEnDigito(emoji) {
    switch (emoji) {
        case '0️⃣': return 0;
        case '1️⃣': return 1;
        case '2️⃣': return 2;
        case '3️⃣': return 3;
        case '4️⃣': return 4;
        case '5️⃣': return 5;
        case '6️⃣': return 6;
        case '7️⃣': return 7;
        case '8️⃣': return 8;
        case '9️⃣': return 9;
        default: throw new Error(`El emoji especificado no es un numero valido.`);
    }
}

const embeberPokemonSeleccionado = (pokemon, entrenador) => {
    let stats = Object.entries(pokemon.base).map(([key, value]) => {
        let nombreStat = '❔: ';
        switch (key) {
            case 'hp': nombreStat = '❤️ HP: '; break;
            case 'atk': nombreStat = '🗡️ ATK: '; break;
            case 'def': nombreStat = '🛡️ DEF: '; break;
            case 's_atk': nombreStat = '🔸 S. ARK: '; break;
            case 's_def': nombreStat = '🔹 S. DEF: '; break;
            case 'spd': nombreStat = '🎇 SPD: '; break;
        
            default:
                break;
        }
        return `**${nombreStat}**${value}`;
    });

    let datos = [
        `🏷️ **POKEMON**: ${pokemon.name}`,
        `🆔 **ID**: ${pokemon.id}`,
        `💠 **TIPO**: ${pokemon.type.toString().replace(",", "/")}`,
        `🏃‍♂️ **ENTRENADOR**: ${entrenador}\n`,
        ...stats
    ];

    let imagenSrc = pokemon.id.toString();
    if (imagenSrc.length === 1) {
        imagenSrc = "00" + imagenSrc;
    } else if (imagenSrc.length === 2) {
        imagenSrc = "0" + imagenSrc;
    }
    
    return new Discord.MessageEmbed()
        .setTitle("El pokemon que elegiste fue...")
        .setDescription(datos)
        .setImage(`https://www.serebii.net/pokemongo/pokemon/${imagenSrc}.png`)
        .setThumbnail(`https://www.serebii.net/pokemongo/pokemon/${imagenSrc}.png`)
        .setColor("#5cb85c");
}

const embeberErrorInterno = (error) =>
    new Discord.MessageEmbed()
        .setTitle("Error interno!")
        .setDescription("Ha ocurrido un error interno.")
        .setFooter(`> ${error.message}`)
        .setColor("#d9534f");

const embeberTiempoAgotado = () =>
    new Discord.MessageEmbed()
        .setTitle("Tiempo agotado!")
        .setDescription("Se ha agotado el tiempo, vuelve a intentarlo más tarde.")
        .setColor("#fd7e14");

const embeberElegirPokemon = (opciones, tiempoEspera) =>
    new Discord.MessageEmbed()
        .setTitle(`Elige a tu pokemón inicial! (${tiempoEspera / 1000} segundos)`)
        .setDescription(
            opciones.map((opcion, index) => {
                return `${convertirDigitoEnEmoji(index + 1)}: ${opcion.name}`;
            }))
        .setColor("#0275d8");

function obtenerPokemonsRandom(cantidad = 3) {
    if (cantidad < 1 || cantidad > 9) throw new Error("La cantidad de pokemon a obtener debe ser entre 1 y 9.");

    let pokemons = []
    for (let index = 0; index < cantidad; index++) {
        let randomNum = Math.floor(Math.random() * pokemonData.length + 1);
        pokemons[index] = pokemonData.find(_pokemon => _pokemon.id == randomNum);
    }

    return pokemons;
}

module.exports.run = async (client, message, args) => {
    try {
        let pokemons = obtenerPokemonsRandom();
        let tiempoEspera = 10000;

        let _msjElegirPokemon = await message.reply(embeberElegirPokemon(pokemons, tiempoEspera));

        // Agregar reacciones para cada opcion.
        pokemons.forEach(async (pokemon, index) => {
            try {
                await _msjElegirPokemon.react(convertirDigitoEnEmoji(index + 1));
            } catch (error) {}
        });

        // Filtrar solo las reacciones del autor del comando y las reacciones que estén dentro de las opciones.
        const filtroReacciones = (reaccion, usuario) => {
            return usuario == message.author &&
                pokemons.map((pokemon, index) => convertirDigitoEnEmoji(index + 1))
                    .includes(reaccion.emoji.name);
        }

        // Crear el colector de reacciones. Terminar cuando se seleccione una reaccion o cuando se acabe el tiempo.
        let colectorReacciones = new Discord.ReactionCollector(_msjElegirPokemon, filtroReacciones, { max: 1, time: tiempoEspera });
        colectorReacciones.on('end', (collected, reason) => {
            // Si se acaba el tiempo, notificar al usuario y borrar el mensaje.
            if (reason === "time") {
                message.channel.send(embeberTiempoAgotado());
                _msjElegirPokemon.delete();
                return;
            }

            let seleccion = convertirEmojiEnDigito(collected.array()[0].emoji.name) - 1;
            message.channel.send(embeberPokemonSeleccionado(pokemons[seleccion], message.author.tag));
            _msjElegirPokemon.delete();
        });
    } catch (error) {
        console.error(error);

        try {
            // Intentar notificar al usuario
            message.channel.send(embeberErrorInterno(error));
        } catch (_error) {
            console.log("> No se pudo notificar al usuario sobre el error.");
        }
    }
}