import db from "#db"
import fs from 'fs'

export default {
  command: ['formulario', 'form', 'verform'],
  category: 'grupo',
  botAdmin: false,
  run: async ({ msg, sock }) => {
    try {
      if (!msg.isGroup) {
        return msg.reply('《✤》 Este comando solo funciona en grupos.');
      }

      let textoCompleto = msg.text || msg.body || '';
      const nombreBuscado = textoCompleto
        .replace(/^[.\/!#]?(formulario|form|verform)\s*/i, '')
        .trim();

      if (!nombreBuscado) {
        return msg.reply(`📋 *Enviar Formulario*

*📋 Uso:* \`.formulario Nombre\`

*📌 Ejemplo:* \`.formulario Jhon\``);
      }

      // ✅ Buscamos el formulario en la base de datos
      const chatData = await db.getChat(msg.chat);
      const dbKey = `formularios_${msg.chat}`;
      const formularios = chatData[dbKey] || [];

      const nombreKey = nombreBuscado.toLowerCase().trim();
      const formulario = formularios.find(f => f.nombre.toLowerCase() === nombreKey);

      if (!formulario) {
        return msg.reply(`❌ No se encontró un formulario para *${nombreBuscado}*.\n\n> Un admin debe guardarlo con \`.saveform ${nombreBuscado} | texto\``);
      }

      // ✅ Si tiene imagen, enviamos imagen + texto
      if (formulario.media && formulario.media.path && fs.existsSync(formulario.media.path)) {
        const bufferImagen = fs.readFileSync(formulario.media.path);
        
        await sock.sendMessage(msg.chat, {
          image: bufferImagen,
          caption: formulario.contenido
        }, { quoted: msg });
      } 
      // ✅ Si no tiene imagen, solo texto
      else {
        await sock.sendMessage(msg.chat, {
          text: formulario.contenido
        }, { quoted: msg });
      }

    } catch (e) {
      console.error("❌ [FORMULARIO ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al enviar el formulario.');
    }
  },
};
