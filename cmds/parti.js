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

      // 2. Detectamos el corazón
      const corazonesValidos = ['💙', '🩷', '💜', '💛', '💚', '❤️', '🍯'];
      const corazonEncontrado = corazonesValidos.find(c => textoUsuario.includes(c));

      if (!corazonEncontrado) {
        return msg.reply(`❌ Debes especificar un corazón válido.\n\n*Corazones válidos:* 💙 🩷 💜 💛 💚 ❤️ 🍯\n\n*Ejemplo:* \`.parti @usuario 💙\``);
      }

      // 3. Detección robusta de menciones
      let menciones = [];
      if (msg.mentionedJid?.length > 0) menciones = msg.mentionedJid;
      else if (msg.mentions?.length > 0) menciones = msg.mentions;
      else if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
        menciones = msg.message.extendedTextMessage.contextInfo.mentionedJid;
      }
      else if (msg.message?.contextInfo?.mentionedJid) {
        menciones = msg.message.contextInfo.mentionedJid;
      }

      if (menciones.length === 0) {
        const textoOriginal = msg.text || msg.body || '';
        const regexMencion = /@(\d{8,15})/g;
        let match;
        while ((match = regexMencion.exec(textoOriginal)) !== null) {
          menciones.push(match[1] + '@s.whatsapp.net');
        }
      }

      // ✅ ÚNICA LÓGICA: Si hay mención, usamos al mencionado. Si no, usamos al que escribe.
      let usuarioObjetivoId = null;
      let nombreObjetivo = null;

      if (menciones.length > 0) {
        // ✅ Caso 1: Hay mención → anotamos al mencionado
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
        // ✅ Caso 2: Sin mención → anotamos al que escribe (auto-registro)
        usuarioObjetivoId = msg.sender.split('@')[0];
        nombreObjetivo = msg.pushName || usuarioObjetivoId;
      }

      console.log(`📝 [PARTI] Anotando: ${nombreObjetivo} (ID: ${usuarioObjetivoId})`);

      // 4. Fecha actual
      const ahora = new Date();
      const año = ahora.getFullYear();
      const inicioAño = new Date(año, 0, 1);
      const diasTranscurridos = Math.floor((ahora - inicioAño) / 86400000);
      const semana = Math.ceil((diasTranscurridos + inicioAño.getDay() + 1) / 7);

      const chatData = await db.getChat(msg.chat);
      const dbKey = `participacion_semana_${año}_${semana}`;
      let registros = chatData[dbKey] || [];

      // 5. Buscamos SOLO por ID (nunca por nombre)
      let personaRegistrada = registros.find(r => r.id === usuarioObjetivoId);

      if (!personaRegistrada) {
        personaRegistrada = {
          id: usuarioObjetivoId,
          nombre: nombreObjetivo,
          corazones: [],
          fechaRegistro: ahora.toISOString()
        };
        registros.push(personaRegistrada);
        console.log(`✅ [PARTI] Nueva participante registrada: ${nombreObjetivo}`);
      }

      // 6. Agregamos el corazón
      personaRegistrada.corazones.push(corazonEncontrado);

      // 7. Guardamos
      await db.updateChat(msg.chat, dbKey, registros);

      // ✅ 8. CONEXIÓN CON EL PERFIL (busca por ID directamente)
      const perfilKey = `perfil_${usuarioObjetivoId}`;
      const chatDataActualizado = await db.getChat(msg.chat);

      if (chatDataActualizado[perfilKey]) {
        chatDataActualizado[perfilKey].versusJugados = (chatDataActualizado[perfilKey].versusJugados || 0) + 1;
        await db.updateChat(msg.chat, perfilKey, chatDataActualizado[perfilKey]);
        console.log(`📊 [PARTI → PERFIL] ${chatDataActualizado[perfilKey].nombre} ahora tiene ${chatDataActualizado[perfilKey].versusJugados} versus jugados`);
      } else {
        console.log(`⚠️ [PARTI] No hay perfil para ${nombreObjetivo} (${perfilKey})`);
      }

      // 9. Construimos la lista (LIMPIANDO nombres)
      let listaParticipantes = '';
      for (const reg of registros) {
        // ✅ Limpiamos el nombre de comandos y emojis
        const nombreLimpio = (reg.nombre || '')
          .replace(/^[.\/!#]?(parti|participacion)\s*/i, '')
          .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
          .replace(/\s+/g, ' ')
          .trim() || 'Sin nombre';

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
        mentions: menciones.length > 0 ? menciones : []
      }, { quoted: msg });

    } catch (e) {
      console.error("❌ [PARTI ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al procesar la participación.');
    }
  },
};
