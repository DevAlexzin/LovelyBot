import db from "#db"

export default {
  command: ['vg', 'versusganado'],
  category: 'grupo',
  botAdmin: true,
  run: async ({ msg, sock }) => {
    console.log("========================================");
    console.log("🔍 [DEBUG] Comando 'vg' ejecutado.");
    console.log("📩 [DEBUG] msg.text:", msg.text);
    console.log("📩 [DEBUG] msg.body:", msg.body);
    console.log("========================================");

    try {
      // Extraemos el texto del mensaje
      let textoCompleto = msg.text || msg.body || '';
      
      // Quitamos el comando (.vg, /vg, !vg, #vg, vg, .versusganado, etc.)
      textoCompleto = textoCompleto.replace(/^[.\/!#]?(vg|versusganado)\s*/i, '').trim();
      
      console.log("📝 [DEBUG] Texto después de quitar el comando:", textoCompleto);

      // ✅ Si no hay datos, pedimos los datos con el formato correcto
      if (!textoCompleto || textoCompleto.length === 0) {
        const pedirDatos = `˖ ݁⋆.˚𔓐𑇓 𝗩𝗲𝗿𝘀𝘂𝘀 𝗴𝗮𝗻𝗮𝗱𝗼

> ❌ *Faltan datos para el versus ganado.*
> Por favor, envía el comando con los datos separados por */* (barras inclinadas).

*📋 Formato requerido:*
\`.vg resultado / rival / modo / mvp / fecha\`

*📌 Ejemplo:*
\`.vg 1-0 / @lindotas.fem / 500 / kaia / 09-22🇦🇷\`

*💡 También puedes usar:* \`.versusganado\``;

        await sock.sendMessage(msg.chat, { text: pedirDatos.trim() }, { quoted: msg });
        console.log("📤 [DEBUG] Mensaje de 'faltan datos' enviado.");
        return;
      }

      // Separamos por "/" (barras inclinadas)
      const partes = textoCompleto.split('/').map(item => item.trim());
      console.log("📊 [DEBUG] Partes separadas por '/':", partes);

      // Asignamos los valores (con valores por defecto si faltan)
      const resultado = partes[0] || '0-0';
      const rival = partes[1] || '@rival';
      const modo = partes[2] || '500';
      const mvp = partes[3] || 'N/A';
      const fecha = partes[4] || 'Sin fecha';

      console.log("✅ [DEBUG] Datos extraídos:");
      console.log("   - Resultado:", resultado);
      console.log("   - Rival:", rival);
      console.log("   - Modo:", modo);
      console.log("   - MVP:", mvp);
      console.log("   - Fecha:", fecha);

      // Construimos el mensaje con la estructura exacta que pediste
      const versusMsg = `˖ ݁⋆.˚𔓐𑇓 𝗩𝗲𝗿𝘀𝘂𝘀 𝗴𝗮𝗻𝗮𝗱𝗼

⌢ . ⌢ . ꒰ ⌢୨୧⌢ ꒱ . ⌢ . ⌢

─⋆ ▸ ›🎠 𝑹𝒆𝒔𝒖𝒍𝒕𝒂𝒅𝒐 ⸝⸝ ${resultado}
─⋆ ▸ ›🎀 𝑹𝒊𝒗𝒂𝒍 ⸝⸝ ${rival}
─⋆ ▸ ›🌈 𝑴𝒐𝒅𝒐 ⸝⸝ ${modo}
─⋆ ▸ ›👸🏻 𝑴𝒗𝒑 ⸝⸝ ${mvp}
─⋆ ▸ ›🍒 𝑭𝒆𝒄𝒉𝒂 ⸝⸝ ${fecha}`;

      console.log("📤 [DEBUG] Enviando mensaje...");
      
      await sock.sendMessage(msg.chat, { text: versusMsg.trim() }, { quoted: msg });
      
      console.log("✅ [DEBUG] Mensaje enviado con éxito.");

    } catch (e) {
      console.error("❌ [ERROR CRÍTICO] Fallo en el comando vg:");
      console.error("   - Mensaje de error:", e.message);
      console.error("   - Stack trace:", e.stack);
      
      msg.reply('❌ Ocurrió un error al procesar el versus ganado.');
    }
  },
};
