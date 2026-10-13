import db from "#db"

export default {
  command: ['compe', 'competencia'],
  category: 'grupo',
  botAdmin: false,
  run: async ({ msg, sock }) => {
    console.log("========================================");
    console.log("🔍 [DEBUG] Comando 'compe' ejecutado.");
    console.log("========================================");

    try {
      if (!msg.isGroup) {
        return msg.reply('《✤》 Este comando solo funciona en grupos.');
      }

      // 1. Extraemos el texto del mensaje
      let textoCompleto = msg.text || msg.body || '';
      let textoUsuario = textoCompleto
        .replace(/^[.\/!#]?(compe|competencia)\s*/i, '')
        .trim();

      // 2. Obtenemos las menciones
      const menciones = msg.mentionedJid || msg.mentions || [];

      // ============================================================
      // CASO 1: NO HAY DATOS → MOSTRAR INSTRUCCIONES
      // ============================================================
      if (!textoUsuario || menciones.length === 0) {
        const instrucciones = `˖ ݁⋆.˚🏹 𝘾𝙤𝙢𝙥𝙚𝙩𝙚𝙣𝙘𝙞𝙖 𝙥𝙧𝙤𝙜𝙧𝙖𝙢𝙖𝙙𝙖

ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ

*📋 Formato para programar una competencia:*
\`.compe hora @jugadora1 @jugadora2 @jugadora3 @jugadora4\`

*📌 Ejemplo:*
\`.compe 22:30 @danizin @yaz @maia @rosee\`

> ⏰ El bot etiquetará a todas las jugadoras *10 minutos antes* de la hora programada.`;

        return msg.reply(instrucciones);
      }

      // ============================================================
      // CASO 2: HAY DATOS → PROCESAR Y GUARDAR
      // ============================================================

      // 3. Detectamos la hora en el texto (formato HH:MM)
      const horaMatch = textoUsuario.match(/(\d{1,2}):(\d{2})/);

      if (!horaMatch) {
        return msg.reply('❌ No se detectó una hora válida.\n\n*Formato:* `HH:MM`\n*Ejemplo:* `.compe 22:30 @jugadora1 @jugadora2`');
      }

      const hora = parseInt(horaMatch[1]);
      const minutos = parseInt(horaMatch[2]);

      if (hora < 0 || hora > 23 || minutos < 0 || minutos > 59) {
        return msg.reply('❌ Hora no válida. Debe estar entre 00:00 y 23:59.');
      }

      // 4. Verificamos que haya al menos 2 menciones
      if (menciones.length < 2) {
        return msg.reply('❌ Debes mencionar al menos a 2 jugadoras.\n\n*Ejemplo:* `.compe 22:30 @jugadora1 @jugadora2`');
      }

      // 5. Calculamos la fecha y hora de la competencia
      const ahora = new Date();
      const compeHora = new Date();
      compeHora.setHours(hora, minutos, 0, 0);

      // Si la hora ya pasó hoy, programamos para mañana
      if (compeHora <= ahora) {
        compeHora.setDate(compeHora.getDate() + 1);
      }

      // 6. Calculamos la hora de aviso (10 minutos antes)
      const avisoHora = new Date(compeHora.getTime() - 10 * 60 * 1000);

      // 7. Guardamos en la base de datos
      const chatData = await db.getChat(msg.chat);
      const dbKey = 'compes_programadas';
      let compesProgramadas = chatData[dbKey] || [];

      // Filtramos los que ya pasaron
      compesProgramadas = compesProgramadas.filter(c => new Date(c.horaAviso) > ahora);

      // Agregamos la nueva competencia
      compesProgramadas.push({
        id: Date.now().toString(),
        horaCompe: compeHora.toISOString(),
        horaAviso: avisoHora.toISOString(),
        jugadoras: menciones.map(j => j.split('@')[0]),
        creadoPor: msg.sender.split('@')[0],
        chatId: msg.chat,
        fechaCreacion: ahora.toISOString()
      });

      await db.updateChat(msg.chat, dbKey, compesProgramadas);

      // 8. Construimos las menciones para el mensaje
      const mentionsFinal = menciones;
      const listaJugadoras = menciones.map(j => `@${j.split('@')[0]}`).join('\n');

      // 9. Formateamos la hora para mostrar
      const horaFormateada = compeHora.toLocaleString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
      });

      const horaAvisoFormateada = avisoHora.toLocaleString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });

      // 10. Enviamos confirmación
      const compeMsg = `✅ *Competencia programada correctamente*

> 📅 *Fecha:* ${horaFormateada}
> ⏰ *Aviso:* ${horaAvisoFormateada} (10 min antes)
> 👥 *Jugadoras (${menciones.length}):*
${listaJugadoras}

> 🔔 El bot las etiquetará 10 minutos antes de la competencia.`;

      await sock.sendMessage(msg.chat, {
        text: compeMsg,
        mentions: mentionsFinal
      }, { quoted: msg });

    } catch (e) {
      console.error("❌ [ERROR CRÍTICO] Fallo en el comando compe:");
      console.error("   - Mensaje de error:", e.message);
      console.error("   - Stack trace:", e.stack);
      
      msg.reply('❌ Ocurrió un error al procesar la competencia.');
    }
  },
};
