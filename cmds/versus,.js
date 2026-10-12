import db from "#db"

export default {
  command: ['versus', 'vs'],  // ✅ Ahora acepta .versus y .vs
  category: 'grupo',
  botAdmin: false,
  run: async ({ msg, sock }) => {
    console.log("========================================");
    console.log("🔍 [DEBUG] Comando 'versus/vs' ejecutado.");
    console.log("📩 [DEBUG] msg.text:", msg.text);
    console.log("📩 [DEBUG] msg.body:", msg.body);
    console.log("========================================");

    try {
      // ✅ Extraemos el texto
      let textoCompleto = msg.text || msg.body || '';
      
      // ✅ Quitamos el comando (versus o vs) con cualquier prefijo
      // El regex detecta: .versus, /versus, !versus, #versus, versus, .vs, /vs, !vs, #vs, vs
      textoCompleto = textoCompleto.replace(/^[.\/!#]?(versus|vs)\s*/i, '').trim();
      
      console.log("📝 [DEBUG] Texto después de quitar el comando:", textoCompleto);

      // ✅ Si no hay datos, pedimos los datos
      if (!textoCompleto || textoCompleto.length === 0) {
        const pedirDatos = `˖ ݁⋆.˚🏹 𝙑𝙚𝙧𝙨𝙪𝙨 𝙘𝙤𝙤𝙧𝙙𝙞𝙣𝙖𝙙𝙤

ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ

> ❌ *Faltan datos para el versus.*
> Por favor, envía el comando con los datos separados por *|* (barras verticales).

*📋 Formato requerido:*
\`.versus @ig_rival | +00 000 000-0000 | reglas | modalidad | hora\`

*📌 Ejemplo:*
\`.versus @nexus_hikari | +54 9 383 492-2367 | nuestras | 500 | 22🇦🇷\`

*💡 También puedes usar:* \`.vs\`

> 💡 *Nota:* El día y la fecha se agregan automáticamente, solo debes enviar la hora del versus.`;

        await sock.sendMessage(msg.chat, { text: pedirDatos.trim() }, { quoted: msg });
        console.log("📤 [DEBUG] Mensaje de 'faltan datos' enviado.");
        return;
      }

      const partes = textoCompleto.split('|').map(item => item.trim());
      console.log("📊 [DEBUG] Partes separadas por '|':", partes);

      const igRival = partes[0] || '@usuario';
      const numRival = partes[1] || '+00 000 000-0000';
      const reglas = partes[2] || 'nuestras';
      const modalidad = partes[3] || '500';
      
      const ahora = new Date();
      const horas = ahora.getHours().toString().padStart(2, '0');
      const minutos = ahora.getMinutes().toString().padStart(2, '0');
      const horaActual = `${horas}:${minutos}`;
      const horaPersonalizada = partes[4] || horaActual;

      const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      
      const diaSemana = diasSemana[ahora.getDay()];
      const diaMes = ahora.getDate();
      const mesActual = meses[ahora.getMonth()];
      
      const horaDia = `${horaPersonalizada} — ${diaSemana}, ${diaMes} de ${mesActual}`;

      console.log("✅ [DEBUG] Datos extraídos:");
      console.log("   - Ig Rival:", igRival);
      console.log("   - Num Rival:", numRival);
      console.log("   - Reglas:", reglas);
      console.log("   - Modalidad:", modalidad);
      console.log("   - Hora/Día:", horaDia);

      const versusMsg = `˖ ݁⋆.˚🏹 𝙑𝙚𝙧𝙨𝙪𝙨 𝙘𝙤𝙤𝙧𝙙𝙞𝙣𝙖𝙙𝙤

ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ

்⋆ ✮👸🏻 Logo

்⋆ ✮🪩 Ig rιvᥲᥣ
ㅤ╰─⋆ ▸ › ${igRival}

்⋆ ✮🌈 Nᥙm rιvᥲᥣ
ㅤ╰─⋆ ▸ › ${numRival}

்⋆ ✮🌷 Rᥱgᥣᥲs
ㅤ╰─⋆ ▸ › ${reglas}

்⋆ ✮🍯 Modᥲᥣιdᥲd
ㅤ╰─⋆ ▸ › ${modalidad}

்⋆ ✮🍒 Horᥲrιo/Dιᥲ
ㅤ╰─⋆ ▸ › ${horaDia}`;

      console.log("📤 [DEBUG] Enviando mensaje...");
      
      await sock.sendMessage(msg.chat, { text: versusMsg.trim() }, { quoted: msg });
      
      console.log("✅ [DEBUG] Mensaje enviado con éxito.");

    } catch (e) {
      console.error("❌ [ERROR CRÍTICO] Fallo en el comando versus:");
      console.error("   - Mensaje de error:", e.message);
      console.error("   - Stack trace:", e.stack);
      
      msg.reply('❌ Ocurrió un error al procesar el versus.');
    }
  },
};
