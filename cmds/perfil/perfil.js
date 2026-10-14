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

      // 2. Detectamos menciones de forma robusta
      let menciones = [];
      if (msg.mentionedJid?.length > 0) menciones = msg.mentionedJid;
      else if (msg.mentions?.length > 0) menciones = msg.mentions;
      else if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
        menciones = msg.message.extendedTextMessage.contextInfo.mentionedJid;
      }
      else if (msg.message?.contextInfo?.mentionedJid) {
        menciones = msg.message.contextInfo.mentionedJid;
      }

      // ✅ Si no hay menciones detectadas, las extraemos del texto
      if (menciones.length === 0) {
        const textoOriginal = msg.text || msg.body || '';
        const regexMencion = /@(\d{8,15})/g;
        let match;
        while ((match = regexMencion.exec(textoOriginal)) !== null) {
          menciones.push(match[1] + '@s.whatsapp.net');
        }
      }

      const chatData = await db.getChat(msg.chat);

      let perfil = null;
      let usuarioId = null;

      // CASO 1: Si mencionó a alguien
      if (menciones.length > 0) {
        usuarioId = menciones[0].split('@')[0];
        perfil = chatData[`perfil_${usuarioId}`];
        console.log(`🔍 [PERFIL] Buscando por mención: ${usuarioId}`);
      }
      // CASO 2: Si escribió un nombre
      else if (texto) {
        const nombreBuscado = texto.toLowerCase().trim();
        console.log(`🔍 [PERFIL] Buscando por nombre: "${nombreBuscado}"`);

        for (const [key, value] of Object.entries(chatData)) {
          if (key.startsWith('perfil_') && value && typeof value === 'object') {
            const nombreP = (value.nombre || '').toLowerCase().trim();
            const nickP = (value.nickFf || '').toLowerCase().trim();

            if (nombreP === nombreBuscado || nickP === nombreBuscado) {
              perfil = value;
              usuarioId = value.id;
              console.log(`✅ [PERFIL] Perfil encontrado: ${key}`);
              break;
            }
          }
        }
      }
      // CASO 3: Sin mención ni nombre → usar el propio usuario
      else {
        usuarioId = msg.sender.split('@')[0];
        perfil = chatData[`perfil_${usuarioId}`];
        console.log(`🔍 [PERFIL] Usando perfil propio: ${usuarioId}`);
      }

      if (!perfil) {
        if (menciones.length > 0) {
          return msg.reply(`❌ @${usuarioId} no está registrada.`);
        }
        if (texto) {
          return msg.reply(`❌ No se encontró un perfil con el nombre *${texto}*.`);
        }
        return msg.reply(`❌ No estás registrada.`);
      }

      const mvpTotales = perfil.mvpTotales || 0;
      const versusJugados = perfil.versusJugados || 0;

      // ✅ Mención del usuario (aparece en el campo "Nombre")
      const mencionUsuario = `@${usuarioId}`;

      const perfilMsg = `┈─˖Ი𐑼⋆ 𝗣𝗲𝗿𝗳𝗶𝗹 𝗷𝘂𝗴𝗮𝗱𝗼𝗿𝗮  

ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ

 ᰭ ꔛㅤׅ 𝐓𝐞𝐚𝐦 𝐏𝐬𝐲𝐜𝐡𝐨 𝐋𝐚𝐧𝐝

˖.𖥔 ݁ ˖. 𝗣𝗲𝗿𝘀𝗼𝗻𝗮𝗹 ! ⊹ ࣪ ˖ ᨐฅ 
᭝ 🏹 ՟ 𝓝𝓸𝓶𝓫𝓻𝓮 ⸝⸝ ${mencionUsuario}
᭝ 🎠 ՟ 𝓔𝓭𝓪𝓭 ⸝⸝ ${perfil.edad}
᭝ 🏹 ՟ 𝓟𝓪𝜾́𝓼 ⸝⸝ ${perfil.pais}
᭝ 🎠 ՟ 𝓕𝓮𝓬𝓱𝓪 𝓭𝓮 𝓬𝓾𝓶𝓹𝓵𝓮 ⸝⸝ ${perfil.cumple}

˖.𖥔 ݁ ˖. 𝗖𝗼𝗺𝗽𝗲𝘁𝗶𝘁𝗶𝘃𝗼 ! ⊹ ࣪ ˖ ᨐฅ  
᭝ 🌈 ՟ 𝓝𝓲𝓬𝓴 𝓯𝓯 ⸝⸝ ${perfil.nickFf}
᭝ 🌼 ՟ 𝓣𝓪g ⸝⸝ ${perfil.tag}
᭝ 🌈 ՟ 𝓜𝓸𝓭𝓸 𝓯𝓪𝓿 ⸝⸝ ${perfil.modoFav}

˖.𖥔 ݁ ˖. 𝗩𝗲𝗿𝘀𝘂𝘀 ! ⊹ ࣪ ˖ ᨐฅ 
᭝ 🌻 ՟ 𝓜𝓿𝓹 𝓽𝓸𝓽𝓪𝓵𝓮𝓼 ⸝⸝ ${mvpTotales}
᭝ 🍒 ՟ 𝓥𝓮𝓻𝓼𝓾𝓼 𝓳𝓾𝓰𝓪𝓭𝓸𝓼 ⸝⸝ ${versusJugados}

𝓕𝓻𝓪𝓼𝓮 𝓶𝓸𝓽𝓲𝓿𝓪𝓬𝓲𝓸𝓷𝓪𝓵 

꒰ঌ ◜⁺⋆⋎⋆⁺◝ ໒꒱ 
.     ⋱˛  ˛⋰`;

      // ✅ Mención al usuario
      const mentionsFinal = [usuarioId + '@s.whatsapp.net'];

      await sock.sendMessage(msg.chat, {
        text: perfilMsg.trim(),
        mentions: mentionsFinal
      }, { quoted: msg });

      console.log(`✅ [PERFIL] Enviado con mención: ${mentionsFinal[0]}`);

    } catch (e) {
      console.error("❌ [PERFIL ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al procesar el perfil.');
    }
  },
};
