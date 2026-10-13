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

      let textoCompleto = msg.text || msg.body || '';
      let textoUsuario = textoCompleto
        .replace(/^[.\/!#]?(compe|competencia)\s*/i, '')
        .trim();

      const menciones = msg.mentionedJid || msg.mentions || [];

      // Si no hay datos, mostramos instrucciones
      if (!textoUsuario || menciones.length === 0) {
        const instrucciones = `˖ ݁⋆.˚🏹 𝘾𝙤𝙢𝙥𝙚𝙩𝙚𝙣𝙘𝙞𝙖 𝙥𝙧𝙤𝙜𝙧𝙖𝙢𝙖𝙙𝙖

ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ

*📋 Formato para programar:*
\`.compe hora zona @jugadoras\`

*📌 Ejemplos:*
\`.compe 18:00 arg @danizin @yaz @maia @rosee\`
\`.compe 22:30 peru @danizin @yaz\`

*🌎 Zonas válidas:*
\`arg\` (Argentina) · \`peru\` (Perú) · \`col\` (Colombia)
\`mex\` (México) · \`chile\` (Chile) · \`esp\` (España)

> ⏰ El bot avisará *20 minutos antes*.`;

        return msg.reply(instrucciones);
      }

      // Detectamos la hora
      const horaMatch = textoUsuario.match(/(\d{1,2}):(\d{2})/);

      if (!horaMatch) {
        return msg.reply('❌ No se detectó una hora válida.\n\n*Formato:* `HH:MM zona`\n*Ejemplo:* `.compe 18:00 arg @jugadora1 @jugadora2`');
      }

      const hora = parseInt(horaMatch[1]);
      const minutos = parseInt(horaMatch[2]);

      if (hora < 0 || hora > 23 || minutos < 0 || minutos > 59) {
        return msg.reply('❌ Hora no válida. Debe estar entre 00:00 y 23:59.');
      }

      // Detectamos la zona horaria
      const zonas = {
        arg: { nombre: 'Argentina', tz: 'America/Argentina/Buenos_Aires', emoji: '🇦🇷' },
        peru: { nombre: 'Perú', tz: 'America/Lima', emoji: '🇵🇪' },
        col: { nombre: 'Colombia', tz: 'America/Bogota', emoji: '🇨🇴' },
        mex: { nombre: 'México', tz: 'America/Mexico_City', emoji: '🇲🇽' },
        chile: { nombre: 'Chile', tz: 'America/Santiago', emoji: '🇨🇱' },
        esp: { nombre: 'España', tz: 'Europe/Madrid', emoji: '🇪🇸' },
        ven: { nombre: 'Venezuela', tz: 'America/Caracas', emoji: '🇻🇪' },
        ecu: { nombre: 'Ecuador', tz: 'America/Guayaquil', emoji: '🇪🇨' },
        bol: { nombre: 'Bolivia', tz: 'America/La_Paz', emoji: '🇧🇴' },
        par: { nombre: 'Paraguay', tz: 'America/Asuncion', emoji: '🇵🇾' },
        uru: { nombre: 'Uruguay', tz: 'America/Montevideo', emoji: '🇺🇾' }
      };

      let zonaDetectada = null;
      const palabras = textoUsuario.toLowerCase().split(/\s+/);
      
      for (const palabra of palabras) {
        const zonaLimpia = palabra.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (zonas[zonaLimpia]) {
          zonaDetectada = zonas[zonaLimpia];
          break;
        }
      }

      if (!zonaDetectada) {
        return msg.reply(`❌ No se detectó una zona horaria válida.\n\n*Zonas disponibles:*\n${Object.keys(zonas).map(z => `\`${z}\` (${zonas[z].nombre})`).join('\n')}\n\n*Ejemplo:* \`.compe 18:00 arg @jugadora1 @jugadora2\``);
      }

      if (menciones.length < 2) {
        return msg.reply('❌ Debes mencionar al menos a 2 jugadoras.');
      }

      // Calculamos la fecha/hora en la zona horaria
      const ahora = new Date();
      const fechaActualZona = new Date(
        ahora.toLocaleString('en-US', { timeZone: zonaDetectada.tz })
      );
      
      const compeFechaLocal = new Date(fechaActualZona);
      compeFechaLocal.setHours(hora, minutos, 0, 0);

      if (compeFechaLocal <= fechaActualZona) {
        compeFechaLocal.setDate(compeFechaLocal.getDate() + 1);
      }

      // Convertimos a UTC
      const fechaUTC = new Date(
        compeFechaLocal.toLocaleString('en-US', { timeZone: 'UTC' })
      );
      const fechaZona = new Date(
        compeFechaLocal.toLocaleString('en-US', { timeZone: zonaDetectada.tz })
      );
      const offset = fechaZona.getTime() - fechaUTC.getTime();
      const compeUTC = new Date(compeFechaLocal.getTime() - offset);

      // ✅ AVISO 20 MINUTOS ANTES (antes era 10)
      const avisoUTC = new Date(compeUTC.getTime() - 20 * 60 * 1000);

      // Guardamos en la base de datos
      const chatData = await db.getChat(msg.chat);
      const dbKey = 'compes_programadas';
      let compesProgramadas = chatData[dbKey] || [];

      compesProgramadas = compesProgramadas.filter(c => new Date(c.horaAviso) > ahora);

      compesProgramadas.push({
        id: Date.now().toString(),
        horaCompe: compeUTC.toISOString(),
        horaAviso: avisoUTC.toISOString(),
        horaLocal: `${hora.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`,
        zona: zonaDetectada.tz,
        zonaNombre: zonaDetectada.nombre,
        zonaEmoji: zonaDetectada.emoji,
        jugadoras: menciones.map(j => j.split('@')[0]),
        creadoPor: msg.sender.split('@')[0],
        chatId: msg.chat,
        fechaCreacion: ahora.toISOString()
      });

      await db.updateChat(msg.chat, dbKey, compesProgramadas);

      // Formateamos para mostrar
      const horaFormateada = `${hora.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
      
      const fechaFormateada = compeFechaLocal.toLocaleString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });

      // ✅ Hora de aviso 20 min antes
      const avisoLocalDate = new Date(compeFechaLocal.getTime() - 20 * 60 * 1000);
      const avisoLocal = `${avisoLocalDate.getHours().toString().padStart(2, '0')}:${avisoLocalDate.getMinutes().toString().padStart(2, '0')}`;

      const mentionsFinal = menciones;
      const listaJugadoras = menciones.map(j => `@${j.split('@')[0]}`).join('\n');

      // Mensaje de confirmación
      const compeMsg = `✅ *Competencia programada correctamente*

> 📅 *Fecha:* ${fechaFormateada}
> ⏰ *Hora:* ${horaFormateada} ${zonaDetectada.emoji} (${zonaDetectada.nombre})
> 🔔 *Aviso:* ${avisoLocal} ${zonaDetectada.emoji} (20 min antes)
> 👥 *Jugadoras (${menciones.length}):*
${listaJugadoras}

> 💡 El bot las etiquetará 20 minutos antes.`;

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
