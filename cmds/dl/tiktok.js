import db from "#db"
import fetch from 'node-fetch';

export default {
  command: ['tiktok', 'tt', 'ttdl'],
  category: 'downloader',
  botAdmin: false,
  run: async ({ msg, sock }) => {
    console.log("========================================");
    console.log("🔍 [DEBUG] Comando 'tiktok' ejecutado.");
    console.log("========================================");

    try {
      // 1. Extraemos el enlace
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

      // 2. Llamamos a la API de Delirius
      const apiUrl = `https://api.delirius.online/download/tiktok?url=${encodeURIComponent(url)}`;
      
      const res = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const texto = await res.text();

      // Verificamos que sea JSON
      if (texto.startsWith('<!DOCTYPE') || texto.startsWith('<html')) {
        console.log('⚠️ [TIKTOK] La API devolvió HTML en lugar de JSON');
        return msg.reply('❌ La API no está disponible. Intenta más tarde.');
      }

      let json;
      try {
        json = JSON.parse(texto);
      } catch (e) {
        console.error('⚠️ [TIKTOK] Error parseando JSON:', texto.slice(0, 200));
        return msg.reply('❌ La API devolvió una respuesta inválida.');
      }

      // 3. Verificamos que la respuesta sea exitosa
      if (!json.status || !json.data) {
        return msg.reply('❌ No se pudo obtener el video. Puede ser privado o eliminado.');
      }

      const data = json.data;

      // 4. Extraemos los datos del video
      const media = data.meta?.media?.[0];
      
      if (!media || !media.org) {
        return msg.reply('❌ No se encontró el enlace del video.');
      }

      // Usamos el video sin marca de agua (org) o el HD si está disponible
      const videoUrl = media.org || media.hd || media.wm;

      const titulo = data.title || 'TikTok Video';
      const autor = data.author?.nickname || data.author?.username || 'Desconocido';
      const duracion = data.duration ? `${data.duration}s` : 'N/A';
      const reproducciones = data.repro || '0';
      const likes = data.like || '0';
      const comentarios = data.comment || '0';
      const compartidos = data.share || '0';

      console.log(`✅ [TIKTOK] Video encontrado: ${titulo}`);

      // 5. Enviamos el video
      await sock.sendMessage(msg.chat, {
        video: { url: videoUrl },
        caption: `🎵 *${titulo}*

> 👤 *Autor:* ${autor}
> ⏱️ *Duración:* ${duracion}
> 👁️ *Reproducciones:* ${reproducciones}
> ❤️ *Likes:* ${likes}
> 💬 *Comentarios:* ${comentarios}
> 🔄 *Compartidos:* ${compartidos}`,
        mimetype: 'video/mp4'
      }, { quoted: msg });

      console.log('✅ [TIKTOK] Video enviado correctamente.');

    } catch (e) {
      console.error('❌ [TIKTOK ERROR]:', e.message);
      msg.reply(msgglobal || '❌ Ocurrió un error al descargar el video.');
    }
  },
};
