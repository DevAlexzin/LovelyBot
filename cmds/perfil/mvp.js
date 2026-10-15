import db from "#db"

export default {
  command: ['mvp', 'mvppsycho'],
  category: 'perfil',
  botAdmin: false,
  run: async ({ msg, sock }) => {
    try {
      if (!msg.isGroup) {
        return msg.reply('《✤》 Este comando solo funciona en grupos.');
      }

      let textoCompleto = msg.text || msg.body || '';
      let textoUsuario = textoCompleto
        .replace(/^[.\/!#]?(mvp|mvppsycho)\s*/i, '')
        .trim();

      if (!textoUsuario) {
        return msg.reply(`⋆ 𖤓🏹 𝗠𝘃𝗽 𝗣𝘀𝘆𝗰𝗵𝗼 𝗟𝗮𝗻𝗱

*📋 Formato:*
\`.mvp nombre1/kills1/nombre2/kills2\`

*📌 Ejemplo:*
\`.mvp Sofia/15/Rocio/12\`

> 💡 El ganador (más kills) suma +1 MVP.`);
      }

      const partes = textoUsuario.split('/').map(p => p.trim()).filter(p => p !== '');

      if (partes.length < 4) {
        return msg.reply('❌ Faltan datos.\n\n*Formato:* `.mvp nombre1/kills1/nombre2/kills2`\n\n*Ejemplo:* `.mvp Sofia/15/Rocio/12`');
      }

      const nombre1 = partes[0];
      const kills1 = parseInt(partes[1]) || 0;
      const nombre2 = partes[2];
      const kills2 = parseInt(partes[3]) || 0;

      // Determinamos ganador
      const ganadorNombre = kills1 >= kills2 ? nombre1 : nombre2;
      const ganadorKills = Math.max(kills1, kills2);
      const ganadorKey = ganadorNombre.toLowerCase().trim();

      console.log(`🏆 [MVP] Ganador: ${ganadorNombre} con ${ganadorKills} kills`);

      // ✅ Sumamos MVP al perfil por NOMBRE
      const chatData = await db.getChat(msg.chat);
      const perfilKey = `perfil_${ganadorKey}`;

      let mvpNuevo = null;
      if (chatData[perfilKey]) {
        mvpNuevo = (chatData[perfilKey].mvpTotales || 0) + 1;
        chatData[perfilKey].mvpTotales = mvpNuevo;
        await db.updateChat(msg.chat, perfilKey, chatData[perfilKey]);
        console.log(`📊 [MVP → PERFIL] ${ganadorNombre} ahora tiene ${mvpNuevo} MVPs`);
      } else {
        console.log(`⚠️ [MVP] No hay perfil para "${ganadorNombre}"`);
      }

      const mvpMsg = `⋆ 𖤓🏹 𝗠𝘃𝗽 𝗣𝘀𝘆𝗰𝗵𝗼 𝗟𝗮𝗻𝗱

⭒˚ ᵎᵎ✮🍒 𝓟𝓼𝔂𝓬𝓱𝓸𝓼𝓲𝓽𝓪 𝓼𝓪𝓵𝓪 𝟏 
╴ᨳ Nombrᥱ ▸ › ${nombre1}
╴ᨳ Kιᥣᥣs ▸ › ${kills1}

⭒˚ ᵎᵎ✮🌻 𝓟𝓼𝔂𝓬𝓱𝓸𝓼𝓲𝓽𝓪 𝓼𝓪𝓵𝓪 𝟐 
╴ᨳ Nombrᥱ ▸ › ${nombre2}
╴ᨳ Kιᥣᥣs ▸ › ${kills2}

⭒˚ ᵎᵎ✮🎠 𝓟𝓼𝔂𝓬𝓱𝓸𝓼𝓲𝓽𝓪 𝓯𝓲𝓷𝓪𝓵
╴ᨳ Nombrᥱ ▸ › ${ganadorNombre}
╴ᨳ Kιᥣᥣs ▸ › ${ganadorKills}${mvpNuevo !== null ? `\n\n> 🌻 *MVP totales de ${ganadorNombre}:* ${mvpNuevo}` : ''}`;

      await sock.sendMessage(msg.chat, { text: mvpMsg.trim() }, { quoted: msg });

    } catch (e) {
      console.error("❌ [MVP ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al procesar el MVP.');
    }
  },
};
