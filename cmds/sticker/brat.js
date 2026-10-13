import db from "#db"
import sharp from 'sharp'

export default {
  command: ['brat', 'bratsticker', 'stickerbrat'],
  category: 'sticker',
  botAdmin: false,
  run: async ({ msg, sock }) => {
    console.log("========================================");
    console.log("🔍 [DEBUG] Comando 'brat' ejecutado.");
    console.log("========================================");

    try {
      // 1. Extraemos el texto
      let textoCompleto = msg.text || msg.body || '';
      const texto = textoCompleto
        .replace(/^[.\/!#]?(brat|bratsticker|stickerbrat)\s*/i, '')
        .trim();

      // 2. Si no hay texto, mostramos instrucciones
      if (!texto) {
        return msg.reply(`《✨》 *¿Cómo usar el comando brat?*

*Ejemplo:*
\`.brat Hola mundo\`
\`.brat Nao es lo maximo\`

*El texto se convertirá en sticker estilo BRAT*`);
      }

      // 3. Avisamos que está generando
      await msg.reply('《🎨》 *Generando sticker brat...*\n⏱️ Por favor espera un momento');

      // 4. Codificamos el texto
      const textoCodificado = encodeURIComponent(texto).replace(/%20/g, '+');
      const apiUrl = `https://api.delirius.store/canvas/brat?text=${textoCodificado}`;

      console.log(`🌐 [DEBUG] Descargando de: ${apiUrl}`);

      // 5. Descargamos la imagen de la API
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      let imagenBuffer = Buffer.from(await response.arrayBuffer());

      console.log(`✅ [DEBUG] Imagen descargada: ${imagenBuffer.length} bytes`);

      // 6. Convertimos a WebP con sharp (formato óptimo para stickers)
      try {
        imagenBuffer = await sharp(imagenBuffer)
          .resize(512, 512, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .webp({
            quality: 85,
            effort: 4
          })
          .toBuffer();

        console.log(`✅ [DEBUG] Convertida a WebP: ${imagenBuffer.length} bytes`);
      } catch (sharpError) {
        console.log('⚠️ [DEBUG] Sharp falló, usando imagen original:', sharpError.message);
      }

      // 7. Enviamos como sticker
      await sock.sendMessage(msg.chat, {
        sticker: imagenBuffer,
        mimetype: 'image/webp'
      }, { quoted: msg });

      console.log(`✅ [DEBUG] Sticker enviado para: ${texto}`);

    } catch (error) {
      console.error('[BRAT ERROR]', error);

      let mensajeError = '《❌》 *Error al generar el sticker brat*\n\n';

      if (error.message.includes('fetch') || error.message.includes('ECONNREFUSED')) {
        mensajeError += '📡 *Error de conexión*\nNo se pudo conectar a la API.\n\n💡 *Intenta:*\n• Usa texto sin caracteres especiales\n• Espera unos segundos y reintenta';
      } else if (error.message.includes('HTTP 404')) {
        mensajeError += '🔌 *API no disponible*\nEl servicio puede estar caído.';
      } else if (error.message.includes('timeout')) {
        mensajeError += '⌛ *Tiempo de espera agotado*\n\n💡 *Intenta con texto más corto*';
      } else {
        mensajeError += `⚠️ Error: ${error.message || 'Desconocido'}`;
      }

      await msg.reply(mensajeError);
    }
  },
};
