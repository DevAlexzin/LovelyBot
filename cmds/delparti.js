import db from "#db"

export default {
  command: ['partidel', 'quitarcorazon', 'partiquitar'],
  category: 'grupo',
  isAdmin: true,
  botAdmin: false,
  run: async ({ msg, sock }) => {
    console.log("========================================");
    console.log("🔍 [DEBUG] Comando 'partidel' ejecutado.");
    console.log("========================================");

    try {
      // 1. Verificamos que sea un grupo
      if (!msg.isGroup) {
        return msg.reply('《✤》 Este comando solo funciona en grupos.');
      }

      // 2. Extraemos el texto que escribió el admin
      let textoCompleto = msg.text || msg.body || '';
      let textoUsuario = textoCompleto
        .replace(/^[.\/!#]?(partidel|quitarcorazon|partiquitar)\s*/i, '')
        .trim();

      if (!textoUsuario) {
        return msg.reply('❌ Debes mencionar a alguien o escribir su nombre.\n\n*Ejemplo:* `.partidel @usuario`\n\n> Si no especificas un corazón, se eliminará el último que tenga.');
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

      if (registros.length === 0) {
        return msg.reply('⚠️ La lista de participación está vacía.');
      }

      // 5. Detectamos el corazón que quieren quitar (si especificaron uno)
      const corazonesValidos = ['💙', '🩷', '💜', '💛', '💚', '❤️', '🍯'];
      const corazonEspecificado = corazonesValidos.find(c => textoUsuario.includes(c));

      // 6. Detectamos a quién está mencionando (o el nombre que escribió)
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
        nombreObjetivo = textoUsuario
          .replace(corazonEspecificado || '', '')
          .trim();

        if (!nombreObjetivo) {
          return msg.reply('❌ Debes mencionar a alguien o escribir su nombre.\n\n*Ejemplo:* `.partidel @usuario 💙`');
        }
      }

      // 7. Buscamos a la persona en los registros
      let personaRegistrada = null;

      if (usuarioObjetivoId) {
        personaRegistrada = registros.find(r => r.id === usuarioObjetivoId);
      }

      if (!personaRegistrada && nombreObjetivo) {
        personaRegistrada = registros.find(
          r => r.nombre.toLowerCase().includes(nombreObjetivo.toLowerCase())
        );
      }

      if (!personaRegistrada) {
        return msg.reply(`❌ No se encontró a *${nombreObjetivo || 'esa persona'}* en la lista de participación.`);
      }

      // 8. Verificamos que tenga corazones
      if (personaRegistrada.corazones.length === 0) {
        return msg.reply(`⚠️ *${personaRegistrada.nombre}* no tiene corazones para eliminar.`);
      }

      // 9. Quitamos el corazón
      let corazonQuitado = null;

      if (corazonEspecificado) {
        const index = personaRegistrada.corazones.lastIndexOf(corazonEspecificado);
        
        if (index === -1) {
          return msg.reply(`⚠️ *${personaRegistrada.nombre}* no tiene ningún corazón ${corazonEspecificado} para eliminar.`);
        }

        corazonQuitado = personaRegistrada.corazones.splice(index, 1)[0];
      } else {
        corazonQuitado = personaRegistrada.corazones.pop();
      }

      // 10. Guardamos en la base de datos
      await db.updateChat(msg.chat, dbKey, registros);

      // 11. Construimos la lista actualizada
      let listaParticipantes = '';
      for (const reg of registros) {
        const nombreLimpio = reg.nombre
          .replace(/^[.\/!#]?(parti|participacion)\s*/i, '')
          .trim();
        
        // ✅ CAMBIO: Si no hay corazones, solo dejamos el nombre sin emoji
        const corazones = reg.corazones.length > 0 
          ? reg.corazones.join(' ') 
          : '';
        
        // Si no hay corazones, mostramos solo el nombre con la barra, sin nada al lado
        listaParticipantes += `┈ꕤ // ${nombreLimpio} ║${corazones ? ' ' + corazones : ''}\n`;
      }

      const participacionMsg = `✅ *Corazón eliminado*

> Se le quitó el corazón *${corazonQuitado}* a *${personaRegistrada.nombre}*.

‧₊ ‧₊ ᵎᵎ 𖤓🏹 𝗣𝗮𝗿𝘁𝗶𝗰𝗶𝗽𝗮𝗰𝗶𝗼𝗻 𝘀𝗲𝗺𝗮𝗻𝗮𝗹
ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ ╴╴╴╴╴ꕤ

᭝ ᨳଓ ՟  Mvρ 🍒
᭝ ᨳଓ ՟  Pᥲrtιᥴιρᥲᥴιoᥒ
𝗟💙/𝗠🩷/𝗠💜/𝗝💛/𝗩💚/𝗦❤️

⌢.⌢.⌢.꒰⌢୨୧⌢꒱.⌢.⌢.⌢

─˖Ი𐑼⋆˚𝑷𝒓𝒊𝒏𝒄𝒆𝒔𝒊𝒕𝒂𝒔
${listaParticipantes}
*Total de participantes:* ${registros.length}`;

      // 12. Enviamos el mensaje
      await sock.sendMessage(msg.chat, { text: participacionMsg.trim() }, { quoted: msg });

    } catch (e) {
      console.error("❌ [ERROR CRÍTICO] Fallo en el comando partidel:");
      console.error("   - Mensaje de error:", e.message);
      console.error("   - Stack trace:", e.stack);
      
      msg.reply('❌ Ocurrió un error al procesar la eliminación.');
    }
  },
};
