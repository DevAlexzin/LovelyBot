import db from "#db";
import fs from 'fs';
import path from 'path';
import { commands } from '../../lib/system/comandos.js';
import { linksPreview } from '#serialize';

const menuImagePath = path.join(process.cwd(), 'menu.jpeg');

export default {
  command: ['allmenu', 'help', 'menu'],
  category: 'info',
  run: async ({ msg, sock, args, usedPrefix: prefix }) => {
    try {
      const botId = sock?.user?.id?.split(':')[0] + '@s.whatsapp.net' || '';
      if (!botId) return msg.reply('❌ Error: No se pudo obtener el ID del bot.');

      const botSettings = await db.getSettings(botId);
      const botname = botSettings.namebot || 'Lovely Bot';
      const botname2 = botSettings.namebot2 || 'Lovely';
      const banner = botSettings.banner || '';
      const owner = botSettings.owner || '';
      const link = 'https://wa.me/+5491172630652';

      // ✅ Encabezado exacto del nuevo menú
      let menu = `𓈒 𐔌 𝔅𝔬𝔪 𝔡𝔦𝔞, 𝔢𝔰𝔱𝔯𝔢𝔩𝔦𝔫𝔥𝔞𝔰! 𝔄 𝔗𝔢𝔯𝔯𝔞 𝔪𝔞𝔫𝔡𝔞 𝔲𝔪 𝔬𝔦 𝔭𝔞𝔯𝔞 𝔳𝔬𝔠ê𝔰. ✨  ͡꒱ ۫

‎ ˙¡𝘼𝙥𝙧𝙚𝙨𝙚𝙣𝙩𝙤-𝙢𝙚: 𝙨𝙤𝙪 𝙤 𝙇𝙤𝙫𝙚𝙡𝙮 𝘽𝙤𝙩.🫐 

⊹₊˚‧︵‿₊୨ᰔ୧₊‿︵‧˚₊⊹

𖥻 ׁ ׅ 𝙇𝙞𝙣𝙠  ! ﹒ ◡◡
𑣲　${link}
𖥻 ׁ ׅ 𝘿𝙚𝙫𝙚𝙡𝙤𝙥𝙚𝙧  ! ﹒ ◡◡
𑣲　Oculto por privacidad

. ݁₊ ⊹ . ݁ ⟡ ݁ . ⊹ ₊ ݁.

ִֶָ🪽་༘ 𝙏𝙚 𝙥𝙧𝙚𝙨𝙚𝙣𝙩𝙤 𝙢𝙞 𝙡𝙞𝙨𝙩𝙖 𝙙𝙚 𝙘𝙤𝙢𝙖𝙣𝙙𝙤𝙨

- ꪆ  ❬ ୭ ᵎᵎ 🌊, ݁ ˖Ი𐑼⋆, ˚˖𓍢ִ໋🫐˚, ❭  
`;

      // ✅ Categorías y emojis organizados
      const categoriaEmojis = {
        'anime': '🌊',
        'grupo': '🧺',
        'gacha': '🎴',
        'ia': '🤖',
        'info': 'ℹ️',
        'nsfw': '🔞',
        'profile': '👤',
        'download': '📥',
        'search': '🔍',
        'stickers': '🎨',
        'economia': '💰',
        'utils': '🛠️',
        'sockets': '🔌',
        'otros': '📦'
      };

      const categoriaNombres = {
        'anime': '𝘼𝙣𝙞𝙢𝙚',
        'grupo': '𝙂𝙧𝙪𝙥𝙤',
        'gacha': '𝙂𝙖𝙘𝙝𝙖',
        'ia': '𝙄𝙖',
        'info': '𝙄𝙣𝙛𝙤',
        'nsfw': '𝙉𝙨𝙬',
        'profile': '𝙋𝙧𝙤𝙛𝙞𝙡𝙚',
        'download': '𝘿𝙤𝙬𝙣𝙡𝙤𝙖𝙙',
        'search': '𝙎𝙚𝙖𝙧𝙘𝙝',
        'stickers': '𝙎𝙩𝙞𝙘𝙠𝙚𝙧𝙨',
        'economia': '𝙀𝙘𝙤𝙣𝙤𝙢𝙞𝙖',
        'utils': '𝙐𝙩𝙞𝙡𝙨',
        'sockets': '𝙎𝙤𝙘𝙠𝙚𝙩𝙨',
        'otros': '𝙊𝙩𝙧𝙤𝙨'
      };

      // ✅ Agrupamos los comandos por categoría
      const categorias = {};
      for (const cmd of commands) {
        const cat = (cmd.category || 'otros').toLowerCase();
        if (!categorias[cat]) categorias[cat] = [];
        // ✅ Usamos el primer comando del array como principal
        const nombreCmd = Array.isArray(cmd.command) ? cmd.command[0] : cmd.command;
        categorias[cat].push({
          comando: nombreCmd,
          uso: cmd.uso || cmd.usage || '',
          desc: cmd.desc || cmd.description || 'Sin descripción'
        });
      }

      // ✅ Orden personalizado de categorías (como en el menú)
      const ordenCategorias = ['anime', 'grupo', 'gacha', 'ia', 'info', 'nsfw', 'profile', 'download', 'search', 'stickers', 'economia', 'utils', 'sockets', 'otros'];

      // ✅ Construimos el menú por categoría
      for (const cat of ordenCategorias) {
        if (!categorias[cat]) continue;

        const emoji = categoriaEmojis[cat] || '📦';
        const nombre = categoriaNombres[cat] || cat.toUpperCase();

        menu += `\n⤷ ゛ ${emoji} ${nombre}  ˎˊ˗\n\n`;

        // Ordenamos alfabéticamente
        categorias[cat].sort((a, b) => a.comando.localeCompare(b.comando));

        for (const cmd of categorias[cat]) {
          const uso = cmd.uso ? ` + < ${cmd.uso} >` : '';
          menu += `𑣲⋆࣪ ִֶָ🧺 ❭ .${cmd.comando}${uso}\n`;
        }
      }

      // ✅ Pie del menú
      menu += `\n⊹₊˚‧︵‿₊୨ᰔ୧₊‿︵‧˚₊⊹`;

      const contextBase = {
        mentionedJid: null,
        isForwarded: false,
      };

      // ✅ Si existe menu.jpeg, se envía como imagen con caption
      if (fs.existsSync(menuImagePath)) {
        return sock.sendMessage(
          msg.chat,
          {
            image: fs.readFileSync(menuImagePath),
            caption: menu.trim(),
            contextInfo: contextBase,
          },
          { quoted: msg }
        );
      }

      // Fallback: banner o texto
      const isVideo =
        banner.includes('.mp4') ||
        banner.includes('.gif') ||
        banner.includes('.webm');

      if (isVideo) {
        return sock.sendMessage(
          msg.chat,
          {
            video: { url: banner },
            caption: menu.trim(),
            contextInfo: contextBase,
          },
          { quoted: msg }
        );
      }

      const preview = link && banner
        ? await linksPreview(sock, banner).then((imageMessage) => ({
            'canonical-url': link,
            'matched-text': link,
            title: botname,
            description: `${botname2}, ʙᴜɪʟᴛ ʙʏ ᴀʟᴇxᴀɴᴅᴇʀ`,
            jpegThumbnail: imageMessage?.jpegThumbnail
              ? Buffer.from(imageMessage.jpegThumbnail)
              : undefined,
            highQualityThumbnail: imageMessage || undefined,
          }))
        : undefined;

      return sock.sendMessage(
        msg.chat,
        { text: menu, linkPreview: preview, contextInfo: contextBase },
        { quoted: msg }
      );

    } catch (e) {
      console.error('❌ [MENU ERROR]:', e.message);
      await msg.reply(msgglobal || '❌ Ocurrió un error al cargar el menú.');
    }
  },
};
