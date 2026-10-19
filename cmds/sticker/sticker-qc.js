import db from "#db"
import axios from 'axios'
import sharp from 'sharp'

export default {
  command: ['qc', 'quotly'],
  category: 'sticker',
  botAdmin: false,
  run: async ({ msg, sock }) => {
    try {
      // ✅ 1. Extraer texto y menciones
      let textoCompleto = msg.text || msg.body || '';
      const textoLimpio = textoCompleto.replace(/^[.\/!#]?(qc|quotly)\s*/i, '').trim();
      
      const menciones = msg.mentionedJid || msg.mentions || [];
      const tieneMencion = menciones.length > 0;
      const mencionadoId = tieneMencion ? menciones[0] : null;

      // Detectar si está respondiendo a un mensaje
      const citado = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const textoCitado = citado?.conversation || citado?.extendedTextMessage?.text || '';

      let authorName = 'Anónimo';
      let text = '';
      let pp = 'https://telegra.ph/file/320b066dc81928b782c7b.png'; // Foto por defecto

      // ✅ 2. Analizar el formato del texto
      if (!textoLimpio && !textoCitado) {
        return msg.reply(`✨ *Crea un sticker estilo Quote*

*Formatos disponibles:*
> \`.qc Este sticker es genial\`
> \`.qc @user Anónimo / Texto del mensaje\`
> \`.qc Secreto / No revelaré mi identidad\`
> Responde a un mensaje con \`.qc\`

*📌 Nota:* El texto no debe superar los 30 caracteres.`);
      }

      if (tieneMencion && textoLimpio.includes('/')) {
        // Formato: .qc @user Anónimo / Texto
        const partes = textoLimpio.split('/');
        authorName = partes[0].replace(/@\d+/g, '').trim() || 'Anónimo';
        text = partes.slice(1).join('/').trim();
        
        try {
          pp = await sock.profilePictureUrl(mencionadoId, 'image');
        } catch { /* Usa la default */ }

      } else if (!tieneMencion && textoLimpio.includes('/')) {
        // Formato: .qc Anónimo / Texto
        const partes = textoLimpio.split('/');
        authorName = partes[0].trim() || 'Anónimo';
        text = partes.slice(1).join('/').trim();
        pp = "https://files.catbox.moe/dpeqsr.jpg"; // Foto fija para este caso

      } else if (!tieneMencion && textoLimpio) {
        // Formato: .qc Texto
        text = textoLimpio;
        authorName = msg.pushName || 'Anónimo';
        
        try {
          pp = await sock.profilePictureUrl(msg.sender, 'image');
        } catch { /* Usa la default */ }

      } else if (textoCitado) {
        // Formato: .qc (respondiendo a un mensaje)
        text = textoCitado;
        authorName = msg.pushName || 'Anónimo';
        
        try {
          pp = await sock.profilePictureUrl(msg.sender, 'image');
        } catch { /* Usa la default */ }

      } else {
        return msg.reply("❌ *Formato no reconocido.*\n\n> Usa: `.qc Texto creativo`\n> Usa: `.qc @user Secreto / Mensaje`\n> Usa: `.qc Misterio / Algo oculto`");
      }

      // ✅ 3. Validaciones
      if (!text) {
        return msg.reply('❌ *No se encontró texto para el sticker.*');
      }

      if (text.length > 30) {
        return msg.reply('⚠️ *El texto es demasiado largo.*\n\n> Máximo 30 caracteres.');
      }

      // ✅ 4. Reacción de "cargando"
      await sock.sendMessage(msg.chat, { react: { text: "⏳", key: msg.key } });

      // ✅ 5. Crear el objeto para la API Quotly
      const obj = {
        "type": "quote",
        "format": "png",
        "backgroundColor": "#000000",
        "width": 512,
        "height": 768,
        "scale": 2,
        "messages": [{
          "entities": [],
          "avatar": true,
          "from": {
            "id": 1,
            "name": authorName,
            "photo": { "url": pp }
          },
          "text": text,
          "replyMessage": {}
        }]
      };

      // ✅ 6. Llamar a la API
      const json = await axios.post('https://btzqc.betabotz.eu.org/generate', obj, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (!json.data || !json.data.result || !json.data.result.image) {
        throw new Error('La API no devolvió una imagen válida.');
      }

      // ✅ 7. Convertir base64 a Buffer
      let buffer = Buffer.from(json.data.result.image, 'base64');

      // ✅ 8. Convertir a WEBP (formato sticker)
      // Nota: Ya no le agregamos texto abajo en la imagen, el nombre se pone en el paquete.
      buffer = await sharp(buffer)
        .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .webp({ quality: 85, effort: 4 })
        .toBuffer();

      // ✅ 9. Enviar el sticker con el nombre en el paquete
      await sock.sendMessage(msg.chat, { 
        sticker: buffer,
        // 📌 Aquí se define el nombre que aparecerá al guardar el sticker
        packname: 'Developer oculto por privacidad',
        author: 'Princess Bot'
      }, { quoted: msg });

      // ✅ 10. Reacción de éxito
      await sock.sendMessage(msg.chat, { react: { text: "✅", key: msg.key } });

    } catch (e) {
      console.error("❌ [QC ERROR]:", e.message);
      
      await msg.reply(`❌ Error al generar el sticker.\n\n> ${e.message}`);
      await sock.sendMessage(msg.chat, { react: { text: "❌", key: msg.key } });
    }
  },
};
