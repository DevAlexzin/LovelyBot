import db from "#db"
import { downloadContentFromMessage } from 'baileys'

export default {
  command: ['brat', 'stickerbrat'],
  category: 'grupo',
  botAdmin: false,
  run: async ({ msg, sock }) => {
    console.log("========================================");
    console.log("🔍 [DEBUG] Comando 'brat' ejecutado.");
    console.log("========================================");

    try {
      // 1. Extraemos el texto
      let textoCompleto = msg.text || msg.body || '';
      const texto = textoCompleto
        .replace(/^[.\/!#]?(brat|stickerbrat)\s*/i, '')
        .trim();

      // 2. Si no hay texto, mostramos instrucciones
      if (!texto) {
        return msg.reply(`📝 *Uso correcto:*
\`.brat Tu texto aquí\`

*Ejemplo:*
\`.brat Hola mundo\``);
      }

      // 3. Codificamos el texto para la URL
      const textoCodificado = encodeURIComponent(texto);
      const apiUrl = `https://api.delirius.online/canvas/brat?text=${textoCodificado}`;

      console.log(`🌐 [DEBUG] Descargando de: ${apiUrl}`);

      // 4. Descargamos la imagen de la API
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`API respondió con estado ${response.status}`);
      }

      // 5. Convertimos la respuesta a buffer
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (!buffer || buffer.length === 0) {
        throw new Error('La API devolvió una imagen vacía.');
      }

      console.log(`✅ [DEBUG] Imagen descargada: ${buffer.length} bytes`);

      // 6. Enviamos como sticker
      await sock.sendMessage(msg.chat, {
        sticker: buffer
      }, { quoted: msg });

      console.log("✅ [DEBUG] Sticker enviado con éxito.");

    } catch (e) {
      console.error("❌ [ERROR] Fallo en el comando brat:");
      console.error("   - Mensaje:", e.message);
      console.error("   - Stack:", e.stack);
      
      msg.reply('❌ Ocurrió un error al generar el sticker. Intenta de nuevo más tarde.');
    }
  },
};
