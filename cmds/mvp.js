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
\`.mvp nombre1/kills1/nombre2/kills2/nombre3/kills3\`

*📌 Ejemplo:*
\`.mvp Daniel/15/Rocio/12/Yaz/8\`

> 💡 El orden es:
> 1️⃣ Sala 1 (Nombre/Kills)
> 2️⃣ Sala 2 (Nombre/Kills)
> 3️⃣ Final (Nombre/Kills)`;

        return msg.reply(instrucciones);
      }

      // 3. Separamos los datos por "/"
      const partes = textoUsuario.split('/').map(p => p.trim());

      if (partes.length < 6) {
        return msg.reply('❌ *Faltan datos.*\n\nDebes poner 6 valores separados por `/`:\n\`nombre1/kills1/nombre2/kills2/nombre3/kills3\`\n\n*Ejemplo:*\n\`.mvp Daniel/15/Rocio/12/Yaz/8\`');
      }

      // 4. Asignamos los datos
      const sala1 = { nombre: partes[0], kills: parseInt(partes[1]) || 0 };
      const sala2 = { nombre: partes[2], kills: parseInt(partes[3]) || 0 };
      const final = { nombre: partes[4], kills: parseInt(partes[5]) || 0 };

      // 5. Determinamos el ganador general (el que más kills tiene en total)
      // Sumamos kills por nombre (por si aparece en varias salas)
      const totalKills = {};
      
      [sala1, sala2, final].forEach(j => {
        if (!totalKills[j.nombre]) totalKills[j.nombre] = 0;
        totalKills[j.nombre] += j.kills;
      });

      // Ordenamos de mayor a menor
      const ranking = Object.entries(totalKills)
        .sort((a, b) => b[1] - a[1]);

      const ganadorGeneral = ranking[0];
      const medalla = ['🥇', '🥈', '🥉'];

      // 6. Construimos el mensaje con el formato que pediste
      const mvpMsg = `⋆ 𖤓🏹 𝗠𝘃𝗽 𝗣𝘀𝘆𝗰𝗵𝗼 𝗟𝗮𝗻𝗱

⭒˚ ᵎᵎ✮🍒 𝓟𝓼𝔂𝓬𝓱𝓸𝓼𝓲𝓽𝓪 𝓼𝓪𝓵𝓪 𝟏 
╴ᨳ Nombrᥱ ▸ › ${sala1.nombre}
╴ᨳ Kιᥣᥣs ▸ › ${sala1.kills}

⭒˚ ᵎᵎ✮🌻 𝓟𝓼𝔂𝓬𝓱𝓸𝓼𝓲𝓽𝓪 𝓼𝓪𝓵𝓪 𝟐 
╴ᨳ Nombrᥱ ▸ › ${sala2.nombre}
╴ᨳ Kιᥣᥣs ▸ › ${sala2.kills}

⭒˚ ᵎᵎ✮🎠 𝓟𝓼𝔂𝓬𝓱𝓸𝓼𝓲𝓽𝓪 𝓯𝓲𝓷𝓪𝓵
╴ᨳ Nombrᥱ ▸ › ${final.nombre}
╴ᨳ Kιᥣᥣs ▸ › ${final.kills}

⌢ .⌢ . ⌢ . ꒰ ⌢୨୧⌢ ꒱ . ⌢ . ⌢. ⌢

🏆 *𝑮𝒂𝒏𝒂𝒅𝒐𝒓 𝒈𝒆𝒏𝒆𝒓𝒂𝒍:*
${medalla.slice(0, ranking.length).map((m, i) => `${m} ${ranking[i][0]} — ${ranking[i][1]} kills`).join('\n')}

> 👑 *MVP:* ${ganadorGeneral[0]} con ${ganadorGeneral[1]} kills`;

      // 7. Enviamos el mensaje
      await sock.sendMessage(msg.chat, { text: mvpMsg.trim() }, { quoted: msg });

      console.log(`✅ [MVP] Resultado enviado: Ganador = ${ganadorGeneral[0]}`);

    } catch (e) {
      console.error("❌ [MVP ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al procesar el MVP.');
    }
  },
};
