import db from "#db"

export default {
  command: ['parti', 'participacion'],
  category: 'grupo',
  isAdmin: true,
  botAdmin: false,
  run: async ({ msg, sock }) => {
    try {
      if (!msg.isGroup) {
        return msg.reply('《✤》 Este comando solo funciona en grupos.');
      }

      let textoCompleto = msg.text || msg.body || '';
      let textoUsuario = textoCompleto
        .replace(/^[.\/!#]?(parti|participacion)\s*/i, '')
        .trim();

      if (!textoUsuario) {
        return msg.reply('❌ Debes mencionar a alguien y ponerle el corazón.\n\n*Ejemplo:* `.parti @usuario 💙`\n\n*Corazones por día:*\nLunes 💙 | Martes 🩷 | Miércoles 💜 | Jueves 💛 | Viernes 💚 | Sábado ❤️');
      }

      const ahora = new Date();
      const año = ahora.getFullYear();
      const inicioAño = new Date(año, 0, 1);
      const diasTranscurridos = Math.floor((ahora - inicioAño) / 86400000);
      const semana = Math.ceil((diasTranscurridos + inicioAño.getDay() + 1) / 7);

      const chatData = await db.getChat(msg.chat);
      const dbKey = `participacion_semana_${año}_${semana}`;
      let registros = chatData[dbKey] || [];

      const corazonesValidos = ['💙', '🩷', '💜', '💛', '💚', '❤️', '🍯'];
      const corazonEncontrado = corazonesValidos.find(c => textoUsuario.includes(c));

      if (!corazonEncontrado) {
        return msg.reply('❌ Debes especificar un corazón válido.\n\n*Corazones válidos:* 💙 🩷 💜 💛 💚 ❤️ 🍯');
      }

      let usuarioObjetivoId = null;
      let nombreObjetivo = null;

      const menciones = msg.mentionedJid || msg.mentions || [];

      if (menciones.length > 0) {
        usuarioObjetivoId = menciones[0].split('@')[0];
        try {
          const groupMetadata = await sock.groupMetadata(msg.chat);
          const participante = groupMetadata.participants.find(
            p => (p.jid || p.id || p.lid)?.split('@')[0] === usuarioObjetivoId
          );
          nombreObjetivo = participante?.notify || participante?.name || usuarioObjetivoId;
        } catch {
          nombreObjetivo = usuarioObjetivoId;
        }
      } else {
        nombreObjetivo = textoUsuario.replace(corazonEncontrado, '').trim();
        if (!nombreObjetivo) {
          return msg.reply('❌ Debes mencionar a alguien o escribir su nombre.');
        }
        usuarioObjetivoId = nombreObjetivo.toLowerCase();
      }

      if (!usuarioObjetivoId) {
        return msg.reply('❌ No se pudo identificar a la persona.');
      }

      let personaRegistrada = registros.find(r => r.id === usuarioObjetivoId);

      if (!personaRegistrada && nombreObjetivo) {
        personaRegistrada = registros.find(
          r => r.nombre.toLowerCase().trim() === nombreObjetivo.toLowerCase().trim()
        );
        if (personaRegistrada) {
          personaRegistrada.id = usuarioObjetivoId;
        }
      }

      if (!personaRegistrada) {
        personaRegistrada = {
          id: usuarioObjetivoId,
          nombre: nombreObjetivo,
          corazones: [],
          fechaRegistro: ahora.toISOString()
        };
        registros.push(personaRegistrada);
      }

      personaRegistrada.corazones.push(corazonEncontrado);

      await db.updateChat(msg.chat, dbKey, registros);

      // ✅ CONEXIÓN CON EL PERFIL
      let perfilKeyReal = null;
      const nombreBuscado = (nombreObjetivo || '').toLowerCase().trim();

      for (const [key, value] of Object.entries(chatData)) {
        if (key.startsWith('perfil_') && value && typeof value === 'object') {
          const nombreP = (value.nombre || '').toLowerCase().trim();
          const nickP = (value.nickFf || '').toLowerCase().trim();
          if (nombreP === nombreBuscado || nickP === nombreBuscado) {
            perfilKeyReal = key;
            usuarioObjetivoId = value.id;
            break;
          }
        }
      }

      if (perfilKeyReal) {
        const chatDataActualizado = await db.getChat(msg.chat);
        const perfil = chatDataActualizado[perfilKeyReal];
        if (perfil) {
          perfil.versusJugados = (perfil.versusJugados || 0) + 1;
          await db.updateChat(msg.chat, perfilKeyReal, perfil);
          console.log(`📊 [PARTI → PERFIL] ${perfil.nombre} ahora tiene ${perfil.versusJugados} versus jugados`);
        }
      }

      let listaParticipantes = '';
      for (const reg of registros) {
        const nombreLimpio = reg.nombre
          .replace(/^[.\/!#]?(parti|participacion)\s*/i, '')
          .trim();

        const corazones = reg.corazones.length > 0
          ? reg.corazones.join(' ')
          : '⏳';

        listaParticipantes += `┈ꕤ // ${nombreLimpio} ║ ${corazones}\n`;
      }

      const participacionMsg = `‧₊ ᵎᵎ 𖤓🏹 𝗣𝗮𝗿𝘁𝗶𝗰𝗶𝗽𝗮𝗰𝗶𝗼𝗻 𝘀𝗲𝗺𝗮𝗻𝗮𝗹
ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ ╴╴╴╴╴ꕤ

᭝ ᨳଓ ՟  Mvρ 🍒
᭝ ᨳଓ ՟  Pᥲrtιᥴιρᥲᥴιoᥒ
𝗟💙/𝗠🩷/𝗠💜/𝗝💛/𝗩💚/𝗦❤️

⌢.⌢.⌢.꒰⌢୨୧⌢꒱.⌢.⌢.⌢

─˖Ი𐑼⋆˚𝑷𝒓𝒊𝒏𝒄𝒆𝒔𝒊𝒕𝒂𝒔
${listaParticipantes}
*Total de participantes:* ${registros.length}`;

      await sock.sendMessage(msg.chat, {
        text: participacionMsg.trim(),
        mentions: usuarioObjetivoId.includes('@') ? [usuarioObjetivoId] : []
      }, { quoted: msg });

    } catch (e) {
      console.error("❌ [ERROR CRÍTICO] Fallo en el comando parti:", e.message);
      msg.reply('❌ Ocurrió un error al procesar la participación.');
    }
  },
};
