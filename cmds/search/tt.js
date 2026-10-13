import db from "#db"
import fetch from 'node-fetch';

export default {
  command: ['tiktoksearch', 'ttsearch', 'tts'],
  category: 'search',
  run: async ({ msg, sock }) => {
    try {
      // Extraemos el texto del mensaje (después del comando)
      let textoCompleto = msg.text || msg.body || '';
      const query = textoCompleto
        .replace(/^[.\/!#]?(tiktoksearch|ttsearch|tts)\s*/i, '')
        .trim();

      if (!query) {
        return msg.reply(`✿ Ingresa un término de búsqueda.\n\n*Ejemplo:* \`.tts gatitos\``);
      }

      const url = `${api.url}/search/tiktok?query=${query}&key=${api.key}`;

      console.log(`🔍 [TTS] Buscando: ${query}`);

      const res = await fetch(url);
      const json = await res.json();

      if (!json || !json.data || !json.data.length) {
        return msg.reply(`✿ No se encontraron resultados para "${query}".`);
      }

      let message = `🔍 *Resultados de TikTok para:* _${query}_\n\n`;

      json.data.forEach((result, index) => {
        message += `➩ *Título ›* ${result.title}

𖹭  ׄ  ְ ✿ *Autor ›* ${result.author.nickname} (@${result.author.unique_id})
𖹭  ׄ  ְ ✤ *Reproducciones ›* ${result.stats.views}
𖹭  ׄ  ְ ✰ *Comentarios ›* ${result.stats.comments}
𖹭  ׄ  ְ ❖ *Compartidos ›* ${result.stats.shares}
𖹭  ׄ  ְ ꕥ *Me gusta ›* ${result.stats.likes}
𖹭  ׄ  ְ ☄︎ *Descargas ›* ${result.stats.downloads}
𖹭  ׄ  ְ ⚡︎ *Duración ›* ${result.duration}
𖹭  ׄ  ְ ❑ *URL ›* https://www.tiktok.com/@${result.author.unique_id}/video/${result.id}

${index < json.data.length - 1 ? '╾۪〬─ ┄۫╌ ׄ┄┈۪ ─〬 ׅ┄╌ ۫┈ ─ׄ─۪〬 ┈ ┄۫╌ ┈┄۪ ─ׄ〬╼' : ''}
        `;
      });

      // ✅ Enviamos como texto simple
      await msg.reply(message);

    } catch (e) {
      console.error("❌ [TTS ERROR]:", e.message);
      msg.reply(msgglobal || '❌ Ocurrió un error en la búsqueda.');
    }
  },
};
