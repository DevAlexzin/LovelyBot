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
      // ✅ Verificamos que el bot tenga usuario
      const botId = sock?.user?.id?.split(':')[0] + '@s.whatsapp.net' || '';
      if (!botId) {
        return msg.reply('❌ Error: No se pudo obtener el ID del bot.');
      }

      const botSettings = await db.getSettings(botId);
      const botname = botSettings.namebot || 'Bot';
      const botname2 = botSettings.namebot2 || 'Bot';
      const banner = botSettings.banner || '';
      const owner = botSettings.owner || '';
      const link = 'https://web.stellarwa.xyz/home';

      const oficialId = global?.sock
        ? global.sock.user.id.split(':')[0] + '@s.whatsapp.net'
        : '';
      const isOficialBot = botId === oficialId;
      const botType = isOficialBot ? '𝐎𝐰𝐧𝐞𝐫' : '𝐒𝐮𝐛-𝐁𝐨𝐭';

      // ✅ Obtenemos el nombre del owner (si es un ID válido)
      let ownerName = '𝐎𝐜𝐮𝐥𝐭𝐨 𝐩𝐨𝐫 𝐩𝐫𝐢𝐯𝐚𝐜𝐢𝐝𝐚𝐝';
      if (owner) {
        try {
          if (!isNaN(owner.replace(/@s\.whatsapp\.net$/, ''))) {
            const own = await db.getUser(owner);
            ownerName = own?.name || 'Sin nombre';
          } else {
            ownerName = owner;
          }
        } catch (e) {
          ownerName = '𝐎𝐜𝐮𝐥𝐭𝐨 𝐩𝐨𝐫 𝐩𝐫𝐢𝐯𝐚𝐜𝐢𝐝𝐚𝐝';
        }
      }

      // ✅ Texto del menú (corregido)
      let menu = `‎   ── ˙ ¡𝗛𝗲𝗹𝗹𝗼, 𝗵𝗶, 𝗜'𝗺 🫐 𝙇𝙤𝙫𝙚𝙡𝙮 (*𝕰𝖒𝖞*) .
ִֶָ🪽་༘ 𝙏𝙚 𝙥𝙧𝙚𝙨𝙚𝙣𝙩𝙤 𝙢𝙞 𝙡𝙞𝙨𝙩𝙖 𝙙𝙚 𝙘𝙤𝙢𝙖𝙣𝙙𝙤𝙨 

⊹₊˚‧︵‿₊୨ᰔ୧₊‿︵‧˚₊⊹

𖥻 ׁ ׅ 𝙇𝙞𝙣𝙠  ! ﹒ ◡◡
𑣲　https://wa.me/+5491172630652
𖥻 ׁ ׅ 𝘿𝙚𝙫𝙚𝙡𝙤𝙥𝙚𝙧  ! ﹒ ◡◡
𑣲　${ownerName}

. ݁₊ ⊹ . ݁ ⟡ ݁ . ⊹ ₊ ݁.

${String.fromCharCode(8206).repeat(4000)}`;

      const categoryArg = args[0]?.toLowerCase();
      const categories = {};

      for (const command of commands) {
        const category = command.category || 'otros';
        if (!categories[category]) categories[category] = [];
        categories[category].push(command);
      }

      const categoryEmojisList = [
        "୭ ᵎᵎ 🧁, ݁ ˖Ი𐑼⋆, ˚˖𓍢ִ໋🦢˚,"
      ];

      const categoryNameMap = {
        'anime': '𝘼𝙣𝙞𝙢𝙚',
        'download': '𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱',
        'economia': '𝙀𝙘𝙤𝙣𝙤𝙢𝙞𝙖',
        'gacha': '𝙂𝙖𝙘𝙝𝙖',
        'grupo': '𝙂𝙧𝙪𝙥𝙤',
        'ia': '𝙄𝘼',
        'info': '𝙄𝙣𝙛𝙤',
        'nsfw': '𝙉𝙨𝙛𝙬',
        'profile': '𝐏𝙧𝙤𝙛𝙞𝙡𝙚',
        'search': '𝙎𝙚𝙖𝙧𝙘𝙝',
        'sockets': '𝙎𝙤𝙘𝙠𝙚𝙩',
        'stickers': '𝙎𝙩𝙞𝙘𝙠𝙚𝙧',
        'utils': '𝙐𝙩𝙞𝙡𝙨'
      };

      const categoryDescriptions = {
        'anime': 'Comandos de reacciones de anime.',
        'download': 'Comandos de Descargas para descargar archivos de varias fuentes.',
        'economia': 'Comandos de Economía para ganar dinero y divertirte con tus amigos.',
        'gacha': 'Comandos de Gacha para reclamar y intercambiar personajes.',
        'grupo': 'Comandos para administradores de grupos.',
        'ia': 'Comandos de Inteligencia Artificial.',
        'info': 'Comandos de información general del bot.',
        'nsfw': 'Comandos NSFW (contenido para adultos).',
        'profile': 'Comandos de Perfil para ver y configurar tu perfil.',
        'search': 'Comandos de búsqueda en diferentes plataformas.',
        'sockets': 'Comandos para registrar tu propio bot.',
        'stickers': 'Comandos de *Stickers* para crear y gestionar stickers.',
        'utils': 'Comandos de Utilidades para el día a día del bot.'
      };

      const availableCategories = Object.keys(categories).map(c => c.toLowerCase());

      if (categoryArg && !availableCategories.includes(categoryArg)) {
        return msg.reply(
          `.ᐟ🫐 La categoría *${categoryArg}* no fue encontrada.\n\n> Categorías disponibles:\n${availableCategories.map(c => `› ${prefix}${c}`).join('\n')}`
        );
      }

      let emojiIndex = 0;
      for (const [category, cmds] of Object.entries(categories)) {
        if (categoryArg && category.toLowerCase() !== categoryArg) continue;

        const catName = categoryNameMap[category.toLowerCase()] 
          || category.charAt(0).toUpperCase() + category.slice(1);
        const catEmoji = categoryEmojisList[emojiIndex % categoryEmojisList.length];
        emojiIndex++;
        const description = categoryDescriptions[category.toLowerCase()] 
          || `Comandos de ${catName}.`;

        menu += `\n- ꪆ  ❬ ${catEmoji} ❭  *\`${catName}\`*  .✦ ݁˖    *;*\n`;
        menu += `> 𑣲⋆࣪ ִֶָ ${description}\n\n`;

        cmds.forEach((cmd) => {
          // ✅ Corregido: usamos cmd.command en lugar de cmd.alias
          const aliases = (cmd.command || [])
            .map((a) => {
              const aliasClean = a.split(/[\/#!+.\-]+/).pop().toLowerCase();
              return `${prefix}${aliasClean}`;
            })
            .join(' › ');
          
          menu += `ִֶָ🫐་༘ ${aliases}${cmd.uso ? ` + ${cmd.uso}` : ''}\n`;
          menu += `> ── 𑁪ㅤׅㅤ۫ _${cmd.desc || 'Sin descripción'}_\n`;
        });

        menu += `\n ㅤׅㅤ۫ㅤㅤ      ﹙ .ᐟ﹚ㅤׅㅤㅤ˚ㅤ\n`;
      }

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
