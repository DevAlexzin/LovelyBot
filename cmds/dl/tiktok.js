import db from "#db"
import fetch from 'node-fetch';

export default {
  command: ['tiktok', 'tt', 'ttdl'],
  category: 'downloader',
  run: async ({ msg, sock }) => {
    try {
      let textoCompleto = msg.text || msg.body || '';
      const url = textoCompleto
        .replace(/^[.\/!#]?(tiktok|tt|ttdl)\s*/i, '')
        .trim();

      if (!url) {
        return msg.reply(`✿ Ingresa un enlace de TikTok.\n\n*Ejemplo:* \`.tiktok https://vt.tiktok.com/xxxxx\``);
      }

      if (!url.includes('tiktok.com')) {
        return msg.reply('❌ El enlace no es válido. Debe ser de TikTok.');
      }

      console.log(`📥 [TIKTOK] Descargando: ${url}`);

      // ✅ API alternativa que funciona desde cualquier servidor
      const apiUrl = `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`;
      
      const res = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const texto = await res.text();
      
      // Verificamos si es JSON
      let json;
      try {
        json = JSON.parse(texto);
      } catch (e) {
        console.log('⚠️ [TIKTOK] La API no devolvió JSON:', texto.slice(0, 200));
        return msg.reply('❌ La API no está disponible. Intenta más tarde.');
      }

      if (!json || !json.video) {
        return msg.reply('❌ No se pudo obtener el video. Puede ser privado o eliminado.');
      }

      const videoUrl = json.video.noWatermark || json.video.watermark;
      const titulo = json.title || 'TikTok Video';
      const autor = json.author?.name || 'Desconocido';

      if (!videoUrl) {
        return msg.reply('❌ No se encontró el enlace del video.');
      }

      await sock.sendMessage(msg.chat, {
        video: { url: videoUrl },
        caption: `🎵 *${titulo}*\n\n> 👤 Autor: ${autor}`,
        mimetype: 'video/mp4'
      }, { quoted: msg });

      console.log('✅ [TIKTOK] Video enviado correctamente.');

    } catch (e) {
      console.error('❌ [TIKTOK ERROR]:', e.message);
      msg.reply(msgglobal || '❌ Ocurrió un error al descargar el video.');
    }
  },
};
