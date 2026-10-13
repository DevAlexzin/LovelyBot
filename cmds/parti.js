import db from "#db"

export default {
  command: ['parti', 'participacion'],
  category: 'grupo',
  isAdmin: true, // ✅ Solo administradores pueden usarlo
  botAdmin: false,
  run: async ({ msg, sock }) => {
    console.log("========================================");
    console.log("🔍 [DEBUG] Comando 'parti' ejecutado.");
    console.log("========================================");

    try {
      // 1. Verificamos que sea un grupo
      if (!msg.isGroup) {
        return msg.reply('《✤》 Este comando solo funciona en grupos.');
      }

      // 2. Extraemos el texto que escribió el admin
      let textoCompleto = msg.text || msg.body || '';
      let textoUsuario = textoCompleto
        .replace(/^[.\/!#]?(parti|participacion)\s*/i, '')
        .trim();

      if (!textoUsuario) {
        return msg.reply('❌ Debes mencionar a alguien y ponerle el corazón.\n\n*Ejemplo:* `.parti @usuario 💙`\n\n*Corazones por día:*\nLunes 💙 | Martes 🩷 | Miércoles 💜 | Jueves 💛 | Viernes 💚 | Sábado ❤️');
      }

      // 3. Obtenemos la fecha actual
      const ahora = new Date();
      const año = ahora.getFullYear();
      const inicioAño = new Date(año, 0, 1);
      const diasTranscurridos = Math.floor((ahora - inicioAño) / 86400000);
      const semana = Math.ceil((diasTranscurridos + inicioAño.getDay() + 1) / 7);

      // 4. Leemos la configuración del chat
      const chatData = await db.getChat(msg.chat);
      const dbKey = `participacion_semana_${año}_${semana}`;
      let registros = chatData[dbKey] || [];

      // 5. Detectamos el corazón en el mensaje
      const corazonesValidos = ['💙', '🩷', '💜', '💛', '💚', '❤️', '🍯'];
      const corazonEncontrado = corazonesValidos.find(c => textoUsuario.includes(c));

      if (!corazonEncontrado) {
        return msg.reply('❌ Debes especificar un corazón válido.\n\n*Corazones válidos:* 💙 🩷 💜 💛 💚 ❤️ 🍯');
      }

      // 6. Detectamos a quién está mencionando (o el nombre que escribió)
      let usuarioObjetivoId = null;
      let nombreObjetivo = null;

      // Buscamos menciones en el mensaje
      const menciones = msg.mentionedJid || msg.mentions || [];
      
      if (menciones.length > 0) {
        // Si mencionó a alguien, tomamos el primer mencionado
        usuarioObjetivoId = menciones[0].split('@')[0];
        
        // Buscamos su nombre en el grupo
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
        // Quitamos el corazón del texto para obtener el nombre
        nombreObjetivo = textoUsuario
          .replace(corazonEncontrado, '')
          .trim();

        if (!nombreObjetivo) {
          return msg.reply('❌ Debes mencionar a alguien o escribir su nombre.\n\n*Ejemplo:* `.parti @usuario 💙`');
        }

        // Buscamos si ese nombre ya existe en los registros
        const registroExistente = registros.find(
          r => r.nombre.toLowerCase() === nombreObjetivo.toLowerCase()
        );

        if (registroExistente) {
          usuarioObjetivoId = registroExistente.id;
        } else {
          // Si no existe, usamos el nombre como ID temporal
          usuarioObjetivoId = nombreObjetivo.toLowerCase();
        }
      }

      if (!usuarioObjetivoId) {
        return msg.reply('❌ No se pudo identificar a la persona. Menciónala o escribe su nombre.');
      }

      // 7. Buscamos si esa persona ya está registrada
      let personaRegistrada = registros.find(r => r.id === usuarioObjetivoId);

      // 8. Si no está registrada, la registramos con su nombre
      if (!personaRegistrada) {
        personaRegistrada = {
          id: usuarioObjetivoId,
          nombre: nombreObjetivo,
          corazones: [],
          fechaRegistro: ahora.toISOString()
        };
        registros.push(personaRegistrada);
      }

      // 9. Le agregamos el corazón
      personaRegistrada.corazones.push(corazonEncontrado);

      // 10. Guardamos en la base de datos
      await db.updateChat(msg.chat, dbKey, registros);

      // 11. Construimos la lista
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

      const participacionMsg = `‧₊ ᵎᵎ 𖤓 𝗣𝗮𝗿𝘁𝗶𝗰𝗶𝗽𝗮𝗰𝗶𝗼𝗻 𝘀𝗲𝗺𝗮𝗻𝗮𝗹
ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ ╴╴╴╴╴ꕤ

─⋆ Mvρ  🍒
─⋆ Pᥲrtιᥴιρᥲᥴιoᥒ
ㅤ.₊‧ʚɞ‧₊Pᥲrtιᥴιρᥲᥴιoᥒ
𝗟💙/𝗠🩷/𝗠💜/𝗝💛/𝗩💚/𝗦❤️

⌢.⌢.⌢.꒰⌢୨୧⌢꒱.⌢.⌢.⌢

─˖Ი𐑼⋆˚𝑷𝒓𝒊𝒏𝒄𝒆𝒔𝒊𝒕𝒂𝒔
${listaParticipantes}
*Total de participantes:* ${registros.length}`;

      // 12. Enviamos el mensaje
      await sock.sendMessage(msg.chat, { text: participacionMsg.trim(), mentions: usuarioObjetivoId.includes('@') ? [usuarioObjetivoId] : [] }, { quoted: msg });

    } catch (e) {
      console.error("❌ [ERROR CRÍTICO] Fallo en el comando parti:");
      console.error("   - Mensaje de error:", e.message);
      console.error("   - Stack trace:", e.stack);
      
      msg.reply('❌ Ocurrió un error al procesar la participación.');
    }
  },
};
