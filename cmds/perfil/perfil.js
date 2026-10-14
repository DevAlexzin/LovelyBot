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
        // Si no mencionó, buscamos por nombre
        nombreObjetivo = textoUsuario
          .replace(corazonEncontrado, '')
          .trim();

        if (!nombreObjetivo) {
          return msg.reply('❌ Debes mencionar a alguien o escribir su nombre.\n\n*Ejemplo:* `.parti @usuario 💙`');
        }

        usuarioObjetivoId = nombreObjetivo.toLowerCase();
      }

      // ✅ 6. BUSCAMOS EL PERFIL POR NOMBRE (esto es la clave)
      let perfilKeyReal = null;
      const nombreBuscado = (nombreObjetivo || '').toLowerCase().trim();

      console.log(`🔍 [PARTI] Buscando perfil para: "${nombreBuscado}"`);

      for (const [key, value] of Object.entries(chatData)) {
        if (key.startsWith('perfil_') && value && typeof value === 'object') {
          const nombreP = (value.nombre || '').toLowerCase().trim();
          const nickP = (value.nickFf || '').toLowerCase().trim();
          
          console.log(`   → Comparando con: "${nombreP}" / "${nickP}" (${key})`);

          if (nombreP === nombreBuscado || nickP === nombreBuscado) {
            perfilKeyReal = key;
            usuarioObjetivoId = value.id; // ✅ Usamos el ID real
            console.log(`✅ [PARTI] Perfil encontrado: ${key} → ID: ${usuarioObjetivoId}`);
            break;
          }
        }
      }

      if (!perfilKeyReal) {
        console.log(`⚠️ [PARTI] No se encontró perfil para "${nombreBuscado}"`);
      }

      // 7. Buscamos si ya está en la lista de participaciones
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

      // 8. Agregamos el corazón
      personaRegistrada.corazones.push(corazonEncontrado);

      // 9. Guardamos la participación
      await db.updateChat(msg.chat, dbKey, registros);

      // ✅ 10. CONEXIÓN CON EL PERFIL (usando la key real encontrada)
      if (perfilKeyReal) {
        const chatDataActualizado = await db.getChat(msg.chat);
        const perfil = chatDataActualizado[perfilKeyReal];
        
        if (perfil) {
          perfil.versusJugados = (perfil.versusJugados || 0) + 1;
          await db.updateChat(msg.chat, perfilKeyReal, perfil);
          console.log(`📊 [PARTI → PERFIL] ${perfil.nombre} ahora tiene ${perfil.versusJugados} versus jugados`);
        }
      } else {
        console.log(`⚠️ [PARTI] No se pudo sumar al perfil (no se encontró)`);
      }

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
      console.error("❌ [ERROR CRÍTICO] Fallo en el comando parti:");
      console.error("   - Mensaje de error:", e.message);
      console.error("   - Stack trace:", e.stack);

      msg.reply('❌ Ocurrió un error al procesar la participación.');
    }
  },
};
