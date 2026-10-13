import db from "#db"
import fetch from 'node-fetch';

export default {
  command: ['tiktok', 'tt', 'ttdl'],
  category: 'downloader',
  run: async ({ msg, sock }) => {
    try {
      // Extraemos el enlace del texto
      let textoCompleto = msg.text || msg.body || '';
      const url = textoCompleto
        .replace(/^[.\/!#]?(tiktok|tt|ttdl)\s*/i, '')
        .trim();

      if (!url) {
        return msg.reply(`✿ Ingresa un enlace de TikTok.\n\n*Ejemplo:* \`.tiktok https://vm.tiktok.com/xxxxx\``);
      }

      if (!url.includes('tiktok.com')) {
        return msg.reply('❌ El enlace no es válido. Debe ser de TikTok.');
      }

      // Llamamos a la API de descarga
      const apiUrl = `${api.url}/download/tiktok?url=${encodeURIComponent(url)}&key=${api.key}`;
      
      console.log(`📥 [TIKTOK] Descargando: ${url}`);

      const res = await fetch(apiUrl);
      const json = await res.json();

      if (!json || !json.data) {
        return msg.reply('❌ No se pudo obtener la información del video.');
      }

      const data = json.data;

      // ✅ Detectamos la URL del video correctamente (varios formatos posibles)
      const videoUrl = 
        data.video?.play_addr?.url_list?.[0] || 
        data.video?.download_addr?.url_list?.[0] ||
        data.play ||
        data.video ||
        data.hdplay ||
        data.wmplay;

      if (!videoUrl) {
        console.log('⚠️ [TIKTOK] Estructura de la API:', JSON.stringify(data, null, 2).slice(0, 500));
        return msg.reply('❌ No se encontró el enlace del video. La API cambió su formato.');
      }

      const titulo = data.title || data.desc || 'TikTok Video';
      const autor = data.author?.nickname || data.author?.unique_id || 'Desconocido';

      // ✅ ENVIAMOS EL VIDEO directamente (NO usamos sendAlbumMessage)
      await sock.sendMessage(msg.chat, {
        video: { url: videoUrl },
        caption: `🎵 *${titulo}*\n\n> 👤 Autor: ${autor}\n> 🔗 ${url}`,
        mimetype: 'video/mp4'
      }, { quoted: msg });

      console.log('✅ [TIKTOK] Video enviado correctamente.');

    } catch (e) {
      console.error('❌ [TIKTOK ERROR]:', e.message);
      msg.reply(msgglobal || '❌ Ocurrió un error al descargar el video.');
    }
  },
};
