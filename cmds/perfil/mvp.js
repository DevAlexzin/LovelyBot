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

      const menciones = msg.mentionedJid || msg.mentions || [];

      if (!textoUsuario || menciones.length < 2) {
        const instrucciones = `⋆ 𖤓🏹 𝗠𝘃𝗽 𝗣𝘀𝘆𝗰𝗵𝗼 𝗟𝗮𝗻𝗱

*📋 Formato:*
\`.mvp @jugadora1/kills1 @jugadora2/kills2\`

*📌 Ejemplo:*
\`.mvp @Sofia/15 @Rocio/12\`

> 💡 El ganador se elige automáticamente (el que tenga más kills).
> ✅ Se le sumará 1 MVP a su perfil.`;

        return msg.reply(instrucciones);
      }

      const numerosEncontrados = textoUsuario.match(/\/\s*(\d+)/g) || [];
      const killsArray = numerosEncontrados.map(n => parseInt(n.replace(/\/\s*/, '')) || 0);

      if (menciones.length < 2 || killsArray.length < 2) {
        return msg.reply('❌ *Faltan datos.*\n\n*Formato:* `.mvp @jugadora1/kills1 @jugadora2/kills2`\n\n*Ejemplo:* `.mvp @Sofia/15 @Rocio/12`');
      }

      const jugadora1Id = menciones[0].split('@')[0];
      const jugadora2Id = menciones[1].split('@')[0];
      const kills1 = killsArray[0];
      const kills2 = killsArray[1];

      const chatData = await db.getChat(msg.chat);
      const perfil1 = chatData[`perfil_${jugadora1Id}`];
      const perfil2 = chatData[`perfil_${jugadora2Id}`];

      const nombre1 = perfil1?.nombre || `@${jugadora1Id}`;
      const nombre2 = perfil2?.nombre || `@${jugadora2Id}`;

      let ganadorId, ganadorNombre, ganadorKills;
      if (kills1 >= kills2) {
        ganadorId = jugadora1Id;
        ganadorNombre = nombre1;
        ganadorKills = kills1;
      } else {
        ganadorId = jugadora2Id;
        ganadorNombre = nombre2;
        ganadorKills = kills2;
      }

      const dbKey = `perfil_${ganadorId}`;
      const perfilGanador = chatData[dbKey];

      let mvpNuevo = null;
      if (perfilGanador) {
        mvpNuevo = (perfilGanador.mvpTotales || 0) + 1;
        perfilGanador.mvpTotales = mvpNuevo;
        await db.updateChat(msg.chat, dbKey, perfilGanador);
        console.log(`📊 [MVP] ${ganadorNombre} ahora tiene ${mvpNuevo} MVPs`);
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

      await sock.sendMessage(msg.chat, {
        text: mvpMsg.trim(),
        mentions: menciones
      }, { quoted: msg });

    } catch (e) {
      console.error("❌ [MVP ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al procesar el MVP.');
    }
  },
};
