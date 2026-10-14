import db from "#db"

export default {
  command: ['mvp', 'mvppsycho'],
  category: 'grupo',
  botAdmin: false,
  run: async ({ msg, sock }) => {
    console.log("========================================");
    console.log("🔍 [DEBUG] Comando 'mvp' ejecutado.");
    console.log("========================================");

    try {
      if (!msg.isGroup) {
        return msg.reply('《✤》 Este comando solo funciona en grupos.');
      }

      // 1. Extraemos el texto del mensaje
      let textoCompleto = msg.text || msg.body || '';
      let textoUsuario = textoCompleto
        .replace(/^[.\/!#]?(mvp|mvppsycho)\s*/i, '')
        .trim();

      // 2. Si no hay datos, mostramos instrucciones
      if (!textoUsuario) {
        const instrucciones = `⋆ 𖤓🏹 𝗠𝘃𝗽 𝗣𝘀𝘆𝗰𝗵𝗼 𝗟𝗮𝗻𝗱

*📋 Formato para anotar:*
\`.mvp nombre1/kills1/nombre2/kills2\`

*📌 Ejemplo:*
\`.mvp Daniel/15/Rocio/12\`

> 💡 El orden es:
> 1️⃣ Sala 1 (Nombre/Kills)
> 2️⃣ Sala 2 (Nombre/Kills)
> 🏆 La final se elige automáticamente (quien tenga más kills)`;

        return msg.reply(instrucciones);
      }

      // 3. Separamos los datos por "/"
      const partes = textoUsuario.split('/').map(p => p.trim());

      if (partes.length < 4) {
        return msg.reply('❌ *Faltan datos.*\n\nDebes poner 4 valores separados por `/`:\n\`nombre1/kills1/nombre2/kills2\`\n\n*Ejemplo:*\n\`.mvp Daniel/15/Rocio/12\`');
      }

      // 4. Asignamos los datos
      const sala1 = { nombre: partes[0], kills: parseInt(partes[1]) || 0 };
      const sala2 = { nombre: partes[2], kills: parseInt(partes[3]) || 0 };

      // 5. Determinamos el ganador (el que más kills tiene)
      let ganadorFinal;
      if (sala1.kills >= sala2.kills) {
        ganadorFinal = sala1;
      } else {
        ganadorFinal = sala2;
      }

      // 6. Construimos el mensaje
      const mvpMsg = `⋆ 𖤓🏹 𝗠𝘃𝗽 𝗣𝘀𝘆𝗰𝗵𝗼 𝗟𝗮𝗻𝗱

⭒˚ ᵎᵎ✮🍒 𝓟𝓼𝔂𝓬𝓱𝓸𝓼𝓲𝓽𝓪 𝓼𝓪𝓵𝓪 𝟏 
╴ᨳ Nombrᥱ ▸ › ${sala1.nombre}
╴ᨳ Kιᥣᥣs ▸ › ${sala1.kills}

⭒˚ ᵎᵎ✮🌻 𝓟𝓼𝔂𝓬𝓱𝓸𝓼𝓲𝓽𝓪 𝓼𝓪𝓵𝓪 𝟐 
╴ᨳ Nombrᥱ ▸ › ${sala2.nombre}
╴ᨳ Kιᥣᥣs ▸ › ${sala2.kills}

⭒˚ ᵎᵎ✮🎠 𝓟𝓼𝔂𝓬𝓱𝓸𝓼𝓲𝓽𝓪 𝓯𝓲𝓷𝓪𝓵
╴ᨳ Nombrᥱ ▸ › ${ganadorFinal.nombre}
╴ᨳ Kιᥣᥣs ▸ › ${ganadorFinal.kills}`;

      // 7. Enviamos el mensaje
      await sock.sendMessage(msg.chat, { text: mvpMsg.trim() }, { quoted: msg });

      console.log(`✅ [MVP] Resultado enviado: Ganador = ${ganadorFinal.nombre}`);

    } catch (e) {
      console.error("❌ [MVP ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al procesar el MVP.');
    }
  },
};
