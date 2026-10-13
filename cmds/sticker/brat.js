import db from "#db"

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

      if (!texto) {
        return msg.reply(`📝 *Uso correcto:*
\`.brat Tu texto aquí\`

*Ejemplo:*
\`.brat Hola mundo\``);
      }

      // 2. Codificamos el texto
      const textoCodificado = encodeURIComponent(texto);
      const apiUrl = `https://api.delirius.online/canvas/brat?text=${textoCodificado}`;

      console.log(`🌐 [DEBUG] Descargando de: ${apiUrl}`);

      // 3. Descargamos con headers para simular un navegador
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/*,*/*;q=0.8',
          'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
        }
      });

      if (!response.ok) {
        throw new Error(`API respondió con estado ${response.status}`);
      }

      // 4. Verificamos el tipo de contenido
      const contentType = response.headers.get('content-type') || '';
      console.log(`📄 [DEBUG] Content-Type: ${contentType}`);

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      console.log(`✅ [DEBUG] Tamaño descargado: ${buffer.length} bytes`);

      if (!buffer || buffer.length < 100) {
        throw new Error('La API devolvió una imagen vacía o muy pequeña.');
      }

      // 5. Verificamos si es una imagen real (PNG, JPG, WebP)
      const headerHex = buffer.slice(0, 4).toString('hex');
      console.log(`🔍 [DEBUG] Header de la imagen: ${headerHex}`);

      // Si no es una imagen válida, mostramos el contenido para depurar
      const esImagenValida = 
        headerHex.startsWith('89504e47') || // PNG
        headerHex.startsWith('ffd8ff') ||   // JPG
        headerHex.startsWith('52494646');   // WebP (RIFF)

      if (!esImagenValida) {
        // Puede ser HTML o JSON, mostramos una parte
        const preview = buffer.slice(0, 200).toString('utf-8');
        console.log(`⚠️ [DEBUG] Contenido no es imagen: ${preview}`);
        throw new Error('La API no devolvió una imagen válida.');
      }

      // 6. Enviamos como sticker
      await sock.sendMessage(msg.chat, {
        sticker: buffer
      }, { quoted: msg });

      console.log("✅ [DEBUG] Sticker enviado con éxito.");

    } catch (e) {
      console.error("❌ [ERROR] Fallo en el comando brat:");
      console.error("   - Mensaje:", e.message);
      
      msg.reply(`❌ Ocurrió un error al generar el sticker.\n\n> ${e.message}`);
    }
  },
};
