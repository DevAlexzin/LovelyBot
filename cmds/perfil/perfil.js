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

      let textoCompleto = msg.text || msg.body || '';
      let texto = textoCompleto
        .replace(/^[.\/!#]?(perfil|profile|jugadora)\s*/i, '')
        .trim();

      // Si mencionó a alguien, extraemos el nombre del texto o usamos el pushName
      let menciones = [];
      if (msg.mentionedJid?.length > 0) menciones = msg.mentionedJid;
      else if (msg.mentions?.length > 0) menciones = msg.mentions;
      else if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
        menciones = msg.message.extendedTextMessage.contextInfo.mentionedJid;
      }

      const chatData = await db.getChat(msg.chat);

      let perfil = null;
      let nombreBuscado = null;

      // ✅ CASO 1: Mención → buscamos su nombre real
      if (menciones.length > 0) {
        const usuarioId = menciones[0].split('@')[0];
        try {
          const groupMetadata = await sock.groupMetadata(msg.chat);
          const participante = groupMetadata.participants.find(
            p => (p.jid || p.id || p.lid)?.split('@')[0] === usuarioId
          );
          const nombreReal = participante?.notify || participante?.name;
          
          if (nombreReal) {
            // Buscamos el perfil por ese nombre
            const key = `perfil_${nombreReal.toLowerCase().trim()}`;
            perfil = chatData[key];
            nombreBuscado = nombreReal;
          }
        } catch (err) {
          console.log('Error buscando participante:', err.message);
        }
      }
      // ✅ CASO 2: Escribió un nombre
      else if (texto) {
        const key = `perfil_${texto.toLowerCase().trim()}`;
        perfil = chatData[key];
        nombreBuscado = texto;
      }
      // ✅ CASO 3: Sin nada → usamos el pushName del que escribe
      else {
        const pushName = msg.pushName || '';
        if (pushName) {
          const key = `perfil_${pushName.toLowerCase().trim()}`;
          perfil = chatData[key];
          nombreBuscado = pushName;
        }
      }

      if (!perfil) {
        return msg.reply(`❌ No se encontró un perfil con el nombre *${nombreBuscado || 'desconocido'}*.\n\n> Usa \`.reg\` para registrarse.`);
      }

      const mvpTotales = perfil.mvpTotales || 0;
      const versusJugados = perfil.versusJugados || 0;

      const perfilMsg = `┈─˖Ი𐑼⋆ 𝗣𝗲𝗿𝗳𝗶𝗹 𝗷𝘂𝗴𝗮𝗱𝗼𝗿𝗮  

ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ

 ᰭ ꔛㅤׅ 𝐓𝐞𝐚𝐦 𝐏𝐬𝐲𝐜𝐡𝐨 𝐋𝐚𝐧𝐝

˖.𖥔 ݁ ˖. 𝗣𝗲𝗿𝘀𝗼𝗻𝗮𝗹 ! ⊹ ࣪ ˖ ᨐฅ 
᭝ 🏹 ՟ 𝓝𝓸𝓶𝓫𝓻𝓮 ⸝⸝ ${perfil.nombre}
᭝ 🎠 ՟ 𝓔𝓭𝓪𝓭 ⸝⸝ ${perfil.edad}
᭝ 🏹 ՟ 𝓟𝓪𝜾́𝓼 ⸝⸝ ${perfil.pais}
᭝ 🎠 ՟ 𝓕𝓮𝓬𝓱𝓪 𝓭𝓮 𝓬𝓾𝓶𝓹𝓵𝓮 ⸝⸝ ${perfil.cumple}

˖.𖥔 ݁ ˖. 𝗖𝗼𝗺𝗽𝗲𝘁𝗶𝘁𝗶𝘃𝗼 ! ⊹ ࣪ ˖ ᨐฅ  
᭝ 🌈 ՟ 𝓝𝓲𝓬𝓴 𝓯𝓯 ⸝⸝ ${perfil.nickFf}
᭝ 🌼 ՟ 𝓣𝓪𝓰 ⸝⸝ ${perfil.tag}
᭝ 🌈 ՟ 𝓜𝓸𝓭𝓸 𝓯𝓪𝓿 ⸝⸝ ${perfil.modoFav}

˖.𖥔 ݁ ˖. 𝗩𝗲𝗿𝘀𝘂𝘀 ! ⊹ ࣪ ˖ ᨐฅ 
᭝ 🌻 ՟ 𝓜𝓿𝓹 𝓽𝓸𝓽𝓪𝓵𝓮𝓼 ⸝⸝ ${mvpTotales}
᭝ 🍒 ՟ 𝓥𝓮𝓻𝓼𝓾𝓼 𝓳𝓾𝓰𝓪𝓭𝓸𝓼 ⸝⸝ ${versusJugados}

𝓕𝓻𝓪𝓼𝓮 𝓶𝓸𝓽𝓲𝓿𝓪𝓬𝓲𝓸𝓷𝓪𝓵 

꒰ঌ ◜⁺⋆⋎⋆⁺◝ ໒꒱ 
.     ⋱˛  ˛⋰`;

      await sock.sendMessage(msg.chat, {
        text: perfilMsg.trim(),
        mentions: menciones.length > 0 ? menciones : []
      }, { quoted: msg });

    } catch (e) {
      console.error("❌ [PERFIL ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al procesar el perfil.');
    }
  },
};
