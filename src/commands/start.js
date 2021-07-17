const Discord = require('discord.js');
const { embeberErrorInterno, embeberTiempoAgotado } = require('../common_embeds.js');
const pokemonData = require('../../fanzeyi-pokedex.json');
const config = require('../../config.json');

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

function convertirTiposEnEmoji(tipos) {
    if (tipos.length === 0) return '❔';

    return tipos.map((tipo) => {
        let emoji = '❔';
        switch (tipo) {
            case 'Grass': emoji = '🍃'; break;
            case 'Poison': emoji = '☠️'; break;
            case 'Fire': emoji = '🔥'; break;
            case 'Flying': emoji = '✈️'; break;
            case 'Water': emoji = '🌊'; break;
            case 'Bug': emoji = '🐞'; break;
            case 'Normal': emoji = '✋'; break;
            case 'Electric': emoji = '⚡'; break;
            case 'Ground': emoji = '🪨'; break;
            case 'Stone': emoji = '🗿'; break;
            case 'Psychic': emoji = '🔮'; break;
            case 'Steel': emoji = '🔧'; break;
            case 'Ice': emoji = '🧊'; break;
            case 'Fighting': emoji = '👊'; break;
            case 'Fairy': emoji = '🧚'; break;
            case 'Ghost': emoji = '👻'; break;
            case 'Dragon': emoji = '🐲'; break;
            case 'Dark': emoji = '🌑'; break;
            default:
                break;
        }
        return `${emoji} ${tipo}`;
    }).join('/ ');
}

const embeberPokemonSeleccionado = (pokemon, entrenador) => {
    let stats = Object.entries(pokemon.base).map(([key, value]) => {
        let nombreStat = '❔: ';
        switch (key) {
            case 'hp': nombreStat = '❤️ HP: '; break;
            case 'atk': nombreStat = '🗡️ ATK: '; break;
            case 'def': nombreStat = '🛡️ DEF: '; break;
            case 's_atk': nombreStat = '🔸 S. ATK: '; break;
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
        `📌 **TIPO**: ${convertirTiposEnEmoji(pokemon.type)}\n`,
        ...stats, "\n"
    ];

    return new Discord.MessageEmbed()
        .setTitle("El pokemon que elegiste fue...")
        .setImage(`https://img.pokemondb.net/sprites/home/normal/${pokemon.name.toLowerCase()}.png`)
        .setDescription(datos)
        // .setImage(`https://www.serebii.net/pokemongo/pokemon/${imagenSrc}.png`)
        .setImage(`https://img.pokemondb.net/sprites/home/normal/${pokemon.name.toLowerCase()}.png`)
        .setThumbnail(`https://img.pokemondb.net/sprites/sword-shield/icon/${pokemon.name.toLowerCase()}.png`)
        .setFooter(`🏃‍♂️ ENTRENADOR: ${entrenador}\n`)
        .setColor(config.colors.success);
}

const embeberElegirPokemon = (opciones, tiempoEspera) =>
    new Discord.MessageEmbed()
        .setTitle(`Elige a tu pokemón inicial! (${tiempoEspera / 1000} segundos)`)
        .setDescription(
            opciones.map((opcion, index) => {
                return `${convertirDigitoEnEmoji(index + 1)}: ${opcion.name}`;
            }))
        .setColor(config.colors.primary);

function obtenerPokemonsRandom(cantidad = 3) {
    if (isNaN(cantidad) || cantidad < 3 || cantidad > 9)
        throw new Error("La cantidad especificada debe ser un numero entre 3 y 9.")

    let pokemons = []
    for (let index = 0; index < cantidad; index++) {
        let randomNum = Math.floor(Math.random() * pokemonData.length + 1);
        pokemons[index] = pokemonData.find(_pokemon => _pokemon.id == randomNum);
    }

    return pokemons;
}

/**
 * El comando 'start' envia un mensaje en donde se puede elegir a 
 * 1 de entre 3 pokemons (o entre una cantidad especificada por parametro).
 * Luego de elegirlo, se envia un mensaje con la información del pokemon elegido.
 */
module.exports.run = (client, message, args) => {
    // El primer parametro especifica la cantidad de opciones (3 por defecto).
    let cantidadOpciones = 3;
    if (args[0] !== undefined) {
        cantidadOpciones = parseInt(args[0]);
    }

    let pokemons = obtenerPokemonsRandom(cantidadOpciones);

    // Tiempo de espera por defecto = 10 segundos (+2 segundos por opciones sobre 3).
    let tiempoEspera = 10000 + (2000 * (cantidadOpciones - 3));

    message.reply(
        embeberElegirPokemon(pokemons, tiempoEspera))
        .then(_msjElegirPokemon => {
            // Agregar reacciones para cada opcion.
            for (let index = 0; index < pokemons.length; index++) {
                _msjElegirPokemon.react(convertirDigitoEnEmoji(index + 1))
                    .catch(error => { });
            }

            // Filtrar solo las reacciones del autor del comando y las reacciones que estén dentro de las opciones.
            const filtroReacciones = (reaccion, usuario) => {
                return usuario == message.author &&
                    pokemons.map((pokemon, index) => convertirDigitoEnEmoji(index + 1))
                        .includes(reaccion.emoji.name);
            }

            // Crear el colector de reacciones. Terminar cuando se seleccione una reaccion o cuando se acabe el tiempo.
            let colectorReacciones = new Discord.ReactionCollector(_msjElegirPokemon, filtroReacciones, { max: 1, time: tiempoEspera });

            colectorReacciones.on('end', (collected, reason) => {
                // Si se acaba el tiempo, notificar al usuario. Si no, mostrar el pokemon seleccionado.
                if (reason === "time") {
                    message.channel.send(embeberTiempoAgotado());
                } else {
                    let seleccion = convertirEmojiEnDigito(collected.array()[0].emoji.name) - 1;
                    message.channel.send(embeberPokemonSeleccionado(pokemons[seleccion], message.author.tag));
                }

                // Finalmente, eliminar el mensaje de seleccion.
                _msjElegirPokemon.delete()
                    .catch(error => {
                        console.log(`> Error controlado (${error.name}: ${error.message})`);
                    });
            });

        })
        .catch(error => {
            try {
                // Intentar notificar al usuario
                console.error(error);
                message.channel.send(embeberErrorInterno(error));
            } catch (_error) {
                console.log("> No se pudo notificar al usuario sobre el error.");
            }
        });
}