import db from "#db"

const EMOJIS_DIAS = {
  1: '💙',
  2: '🩷',
  3: '💜',
  4: '💛',
  5: '💚',
  6: '❤️'
}

// ✅ Función para limpiar emojis y comandos del nombre
function limpiarNombre(texto) {
  return texto
    .replace(/^[.\/!#]?(parti|participacion)\s*/i, '')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '') // Quita emojis
    .replace(/\s+/g, ' ')
    .trim();
}

export default {
  command: ['parti', 'participacion'],
  category: 'grupo',
  botAdmin: false,
  run: async ({ msg, sock }) => {
    try {
      if (!msg.isGroup) {
        return msg.reply('《✤》 Este comando solo funciona en grupos.');
      }

      let textoCompleto = msg.text || msg.body || '';
      let textoUsuario = limpiarNombre(textoCompleto);

      const ahora = new Date();
      const año = ahora.getFullYear();
      const inicioAño = new Date(año, 0, 1);
      const diasTranscurridos = Math.floor((ahora - inicioAño) / 86400000);
      const semana = Math.ceil((diasTranscurridos + inicioAño.getDay() + 1) / 7);
      
      const diaSemana = ahora.getDay();
      const emojiDia = EMOJIS_DIAS[diaSemana];

      if (!emojiDia) {
        return msg.reply('⚠️ Hoy es Domingo, no hay participación. Vuelve el Lunes 💙');
      }

      const chatData = await db.getChat(msg.chat);
      const dbKey = `participacion_semana_${año}_${semana}`;
      let registros = chatData[dbKey] || [];

      const usuarioId = msg.sender.split('@')[0];

      // ✅ Buscamos primero por ID de usuario
      let usuarioRegistrado = registros.find(r => r.id === usuarioId);

      // ✅ Si no lo encuentra por ID, buscamos por nombre
      if (!usuarioRegistrado && textoUsuario) {
        usuarioRegistrado = registros.find(
          r => r.nombre.toLowerCase().trim() === textoUsuario.toLowerCase().trim()
        );
        // Si lo encuentra por nombre, le actualizamos el ID
        if (usuarioRegistrado) {
          usuarioRegistrado.id = usuarioId;
        }
      }

      // Si no existe, lo registramos
      if (!usuarioRegistrado) {
        if (!textoUsuario) {
          return msg.reply('❌ Debes registrarte primero. Ejemplo: `.parti Tokyo`');
        }

        usuarioRegistrado = {
          id: usuarioId,
          nombre: textoUsuario,
          corazones: [],
          fechaRegistro: ahora.toISOString()
        };
        registros.push(usuarioRegistrado);
      }

      // ✅ Agregamos el corazón (sin límite)
      usuarioRegistrado.corazones.push(emojiDia);

      await db.updateChat(msg.chat, dbKey, registros);

      // ✅ Sumamos al perfil si existe
      const perfilKey = `perfil_${usuarioId}`;
      const chatDataActualizado = await db.getChat(msg.chat);
      if (chatDataActualizado[perfilKey]) {
        chatDataActualizado[perfilKey].versusJugados = (chatDataActualizado[perfilKey].versusJugados || 0) + 1;
        await db.updateChat(msg.chat, perfilKey, chatDataActualizado[perfilKey]);
        console.log(`📊 [PARTI] ${chatDataActualizado[perfilKey].nombre} ahora tiene ${chatDataActualizado[perfilKey].versusJugados} versus jugados`);
      }

      // Construimos la lista
      let listaParticipantes = '';
      for (const reg of registros) {
        const nombreLimpio = limpiarNombre(reg.nombre);
        
        const corazones = reg.corazones.length > 0 
          ? reg.corazones.join(' ') 
          : '';
        
        listaParticipantes += `┈ꕤ // ${nombreLimpio} ║${corazones ? ' ' + corazones : ''}\n`;
      }

      const participacionMsg = `‧₊ ᵎᵎ 𖤓 𝗣𝗮𝗿𝘁𝗶𝗰𝗶𝗽𝗮𝗰𝗶𝗼𝗻 𝘀𝗲𝗺𝗮𝗻𝗮𝗹
ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ ╴╴╴╴╴ꕤ

─⋆ Mvρ 🍯
─⋆ Pᥲrtιᥴιρᥲᥴιoᥒ
ㅤ.₊‧ʚɞ‧₊SᥱmᲐᥒᥲ
𝗟💙/𝗠🩷/𝗠💜/𝗝💛/𝗩💚/𝗦❤️

⌢.⌢.⌢.꒰⌢୨୧⌢꒱.⌢.⌢.⌢

─˖Ი𐑼⋆˚𝑷𝒓𝒊𝒏𝒄𝒆𝒔𝒊𝒕𝒂𝒔
${listaParticipantes}
*Total de participantes:* ${registros.length}`;

      await sock.sendMessage(msg.chat, { text: participacionMsg.trim() }, { quoted: msg });

    } catch (e) {
      console.error("❌ [PARTI ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al procesar la participación.');
    }
  },
};
