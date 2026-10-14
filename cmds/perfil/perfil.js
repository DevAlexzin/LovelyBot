import db from "#db"

export default {
  command: ['perfil', 'profile', 'jugadora'],
  category: 'perfil',
  botAdmin: false,
  run: async ({ msg, sock }) => {
    try {
      if (!msg.isGroup) {
        return msg.reply('《✤》 Este comando solo funciona en grupos.');
      }

      // 1. Extraemos el texto después del comando
      let textoCompleto = msg.text || msg.body || '';
      const texto = textoCompleto
        .replace(/^[.\/!#]?(perfil|profile|jugadora)\s*/i, '')
        .trim();

      // 2. Detectamos menciones
      const menciones = msg.mentionedJid || msg.mentions || [];

      const chatData = await db.getChat(msg.chat);

      let perfil = null;
      let usuarioId = null;

      // ✅ CASO 1: Si mencionó a alguien
      if (menciones.length > 0) {
        usuarioId = menciones[0].split('@')[0];
        perfil = chatData[`perfil_${usuarioId}`];
      }
      // ✅ CASO 2: Si escribió un nombre (ej: .perfil sofia)
      else if (texto) {
        const nombreBuscado = texto.toLowerCase().trim();
        
        // Buscamos en todos los perfiles
        for (const [key, value] of Object.entries(chatData)) {
          if (key.startsWith('perfil_') && value && typeof value === 'object') {
            const nombreP = (value.nombre || '').toLowerCase().trim();
            const nickP = (value.nickFf || '').toLowerCase().trim();
            
            if (nombreP === nombreBuscado || nickP === nombreBuscado) {
              perfil = value;
              usuarioId = value.id;
              break;
            }
          }
        }
      }
      // ✅ CASO 3: Sin mención ni nombre → usar el propio usuario
      else {
        usuarioId = msg.sender.split('@')[0];
        perfil = chatData[`perfil_${usuarioId}`];
      }

      // Si no se encontró el perfil
      if (!perfil) {
        if (menciones.length > 0) {
          return msg.reply(`❌ @${usuarioId} no está registrada.\n\n> Usa \`.reg @${usuarioId} nick/tag/modo/nombre/edad/país/cumple\``);
        }
        if (texto) {
          return msg.reply(`❌ No se encontró un perfil con el nombre *${texto}*.\n\n> Verifica que esté registrada o usa su mención.`);
        }
        return msg.reply(`❌ No estás registrada.\n\n> Usa \`.reg\` para registrarte.`);
      }

      const mvpTotales = perfil.mvpTotales || 0;
      const versusJugados = perfil.versusJugados || 0;

      const perfilMsg = `┈─˖Ი𐑼⋆ 𝗣𝗲𝗿𝗳𝗶𝗹 𝗷𝘂𝗴𝗮𝗱𝗼𝗿𝗮

ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ

 ᰭ ꔛㅤׅ 𝐓𝐞𝐚𝐦 𝐏𝐬𝐲𝐜𝐡𝐨 𝐋𝐚𝐧𝐝

˖.𖥔 ݁ ˖. 𝗖𝗼𝗺𝗽𝗲𝘁𝗶𝘁𝗶𝘃𝗼 ! ⊹ ࣪ ˖ ᨐฅ  
᭝ 🌈 ՟ 𝓝𝓲𝓬𝓴 𝓯𝓯 ⸝⸝ ${perfil.nickFf}
᭝ 🌼 ՟ 𝓣𝓪𝓰 ⸝⸝ ${perfil.tag}
᭝ 🌈 ՟ 𝓜𝓸𝓭𝓸 𝓯𝓪𝓿 ⸝⸝ ${perfil.modoFav}

˖.𖥔 ݁ ˖. 𝗣𝗲𝗿𝘀𝗼𝗻𝗮𝗹 ! ⊹ ࣪ ˖ ᨐฅ 
᭝ 🏹 ՟ 𝓝𝓸𝓶𝓫𝓻𝓮 ⸝⸝ ${perfil.nombre}
᭝ 🎠 ՟ 𝓔𝓭𝓪𝓭 ⸝⸝ ${perfil.edad}
᭝ 🏹 ՟ 𝓟𝓪𝜾́𝓼 ⸝⸝ ${perfil.pais}
᭝ 🎠 ՟ 𝓕𝓮𝓬𝓱𝓪 𝓭𝓮 𝓬𝓾𝓶𝓹𝓵𝓮 ⸝⸝ ${perfil.cumple}

˖.𖥔 ݁ ˖. 𝗩𝗲𝗿𝘀𝘂𝘀 ! ⊹ ࣪ ˖ ᨐฅ 
᭝ 🌻 ՟ 𝓜𝓿𝓹 𝓽𝓸𝓽𝓪𝓵𝓮𝓼 ⸝⸝ ${mvpTotales}
᭝ 🍒 ՟ 𝓥𝓮𝓻𝓼𝓾𝓼 𝓳𝓾𝓰𝓪𝓭𝓸𝓼 ⸝⸝ ${versusJugados}

𝓕𝓻𝓪𝓼𝓮 𝓶𝓸𝓽𝓲𝓿𝓪𝓬𝓲𝓸𝓷𝓪𝓵 

꒰ঌ ◜⁺⋆⋎⋆⁺◝ ໒꒱ 
.     ⋱˛  ˛⋰`;

      // Mencionamos al usuario del perfil
      const mentionsFinal = usuarioId ? [usuarioId + '@s.whatsapp.net'] : [msg.sender];

      await sock.sendMessage(msg.chat, {
        text: perfilMsg.trim(),
        mentions: mentionsFinal
      }, { quoted: msg });

    } catch (e) {
      console.error("❌ [PERFIL ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al procesar el perfil.');
    }
  },
};
