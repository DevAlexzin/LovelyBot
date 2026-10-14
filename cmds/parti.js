import db from "#db"

export default {
  command: ['parti', 'participacion'],
  category: 'grupo',
  isAdmin: true,
  botAdmin: false,
  run: async ({ msg, sock }) => {
    console.log("========================================");
    console.log("🔍 [DEBUG] Comando 'parti' ejecutado.");
    console.log("========================================");

    try {
      if (!msg.isGroup) {
        return msg.reply('《✤》 Este comando solo funciona en grupos.');
      }

      // 1. Extraemos el texto
      let textoCompleto = msg.text || msg.body || '';
      let textoUsuario = textoCompleto
        .replace(/^[.\/!#]?(parti|participacion)\s*/i, '')
        .trim();

      if (!textoUsuario) {
        return msg.reply('❌ Debes mencionar a alguien y ponerle el corazón.\n\n*Ejemplo:* `.parti @usuario 💙`\n\n*Corazones por día:*\nLunes 💙 | Martes 🩷 | Miércoles 💜 | Jueves 💛 | Viernes 💚 | Sábado ❤️');
      }

      // 2. Fecha actual
      const ahora = new Date();
      const año = ahora.getFullYear();
      const inicioAño = new Date(año, 0, 1);
      const diasTranscurridos = Math.floor((ahora - inicioAño) / 86400000);
      const semana = Math.ceil((diasTranscurridos + inicioAño.getDay() + 1) / 7);

      // 3. Leemos el chat
      const chatData = await db.getChat(msg.chat);
      const dbKey = `participacion_semana_${año}_${semana}`;
      let registros = chatData[dbKey] || [];

      // 4. Detectamos el corazón
      const corazonesValidos = ['💙', '🩷', '💜', '💛', '💚', '❤️', '🍯'];
      const corazonEncontrado = corazonesValidos.find(c => textoUsuario.includes(c));

      if (!corazonEncontrado) {
        return msg.reply('❌ Debes especificar un corazón válido.\n\n*Corazones válidos:* 💙 🩷 💜 💛 💚 ❤️ 🍯');
      }

      // 5. Detectamos a quién está mencionando (o el nombre)
      let usuarioObjetivoId = null;
      let nombreObjetivo = null;

      const menciones = msg.mentionedJid || msg.mentions || [];

      if (menciones.length > 0) {
        // Si mencionó a alguien
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
        // Si no mencionó, buscamos por nombre en el texto
        nombreObjetivo = textoUsuario
          .replace(corazonEncontrado, '')
          .trim();

        if (!nombreObjetivo) {
          return msg.reply('❌ Debes mencionar a alguien o escribir su nombre.\n\n*Ejemplo:* `.parti @usuario 💙`');
        }

        // Buscamos si ese nombre ya existe
        const registroExistente = registros.find(
          r => r.nombre.toLowerCase() === nombreObjetivo.toLowerCase()
        );

        if (registroExistente) {
          usuarioObjetivoId = registroExistente.id;
        } else {
          usuarioObjetivoId = nombreObjetivo.toLowerCase();
        }
      }

      if (!usuarioObjetivoId) {
        return msg.reply('❌ No se pudo identificar a la persona.');
      }

      // 6. Buscamos si ya está registrada
      let personaRegistrada = registros.find(r => r.id === usuarioObjetivoId);

      if (!personaRegistrada) {
        personaRegistrada = {
          id: usuarioObjetivoId,
          nombre: nombreObjetivo,
          corazones: [],
          fechaRegistro: ahora.toISOString()
        };
        registros.push(personaRegistrada);
      }

      // 7. Agregamos el corazón
      personaRegistrada.corazones.push(corazonEncontrado);

      // 8. Guardamos la participación
      await db.updateChat(msg.chat, dbKey, registros);

      // ✅ 9. CONEXIÓN CON EL PERFIL
      // Si el usuario objetivo tiene perfil, sumamos +1 versus jugado
      const perfilKey = `perfil_${usuarioObjetivoId}`;
      const chatDataActualizado = await db.getChat(msg.chat);

      if (chatDataActualizado[perfilKey]) {
        chatDataActualizado[perfilKey].versusJugados = (chatDataActualizado[perfilKey].versusJugados || 0) + 1;
        await db.updateChat(msg.chat, perfilKey, chatDataActualizado[perfilKey]);
        console.log(`📊 [PARTI → PERFIL] ${chatDataActualizado[perfilKey].nombre} ahora tiene ${chatDataActualizado[perfilKey].versusJugados} versus jugados`);
      } else {
        console.log(`⚠️ [PARTI] No se encontró perfil para @${usuarioObjetivoId}`);
      }

      // 10. Construimos la lista
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

      // 11. Enviamos
      await sock.sendMessage(msg.chat, {
        text: participacionMsg.trim(),
        mentions: usuarioObjetivoId.includes('@') ? [usuarioObjetivoId] : []
      }, { quoted: msg });

    } catch (e) {
      console.error("❌ [ERROR CRÍTICO] Fallo en el comando parti:");
      console.error("   - Mensaje de error:", e.message);
      console.error("   - Stack trace:", e.stack);

      msg.reply('❌ Ocurrió un error al procesar la participación.');
    }
  },
};
