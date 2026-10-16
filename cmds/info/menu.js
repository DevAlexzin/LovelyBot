import db from "#db";
import fs from 'fs';
import path from 'path';
import { linksPreview } from '#serialize';

const menuImagePath = path.join(process.cwd(), 'menu.jpeg');

export default {
  command: ['allmenu', 'help', 'menu'],
  category: 'info',
  run: async ({ msg, sock }) => {
    try {
      const botId = sock?.user?.id?.split(':')[0] + '@s.whatsapp.net' || '';
      if (!botId) return msg.reply('❌ Error: No se pudo obtener el ID del bot.');

      const botSettings = await db.getSettings(botId);
      const botname = botSettings.namebot || 'Lovely Bot';
      const botname2 = botSettings.namebot2 || 'Lovely';
      const banner = botSettings.banner || '';
      const link = 'https://wa.me/+5491172630652';

      // ✅ MENÚ COMPLETO (texto exacto que proporcionaste)
      const menu = `𓈒 𐔌 𝔅𝔬𝔪 𝔡𝔦𝔞, 𝔢𝔰𝔱𝔯𝔢𝔩𝔦𝔫𝔥𝔞𝔰! 𝔄 𝔗𝔢𝔯𝔯𝔞 𝔪𝔞𝔫𝔡𝔞 𝔲𝔪 𝔬𝔦 𝔭𝔞𝔯𝔞 𝔳𝔬𝔠ê𝔰. ✨  ͡꒱ ۫

‎ ˙¡𝘼𝙥𝙧𝙚𝙨𝙚𝙣𝙩𝙤-𝙢𝙚: 𝙨𝙤𝙪 𝙤 𝙇𝙤𝙫𝙚𝙡𝙮 𝘽𝙤𝙩.🫐 

⊹₊˚‧︵‿₊୨ᰔ୧₊‿︵‧˚₊⊹

𖥻 ׁ ׅ 𝙇𝙞𝙣𝙠  ! ﹒ ◡◡
𑣲　${link}
𖥻 ׁ ׅ 𝘿𝙚𝙫𝙚𝙡𝙤𝙥𝙚𝙧  ! ﹒ ◡◡
𑣲　Oculto por privacidad

. ݁₊ ⊹ . ݁ ⟡ ݁ . ⊹ ₊ ݁.

ִֶָ🪽་༘ 𝙏𝙚 𝙥𝙧𝙚𝙨𝙚𝙣𝙩𝙤 𝙢𝙞 𝙡𝙞𝙨𝙩𝙖 𝙙𝙚 𝙘𝙤𝙢𝙖𝙣𝙙𝙤𝙨

- ꪆ  ❬ ୭ ᵎᵎ 🌊, ݁ ˖Ი𐑼⋆, ˚˖𓍢ִ໋🫐˚, ❭  

⤷ ゛ 𝘼𝙣𝙞𝙢𝙚  ˎˊ˗

𑣲⋆࣪ ִֶָ🧺 ❭ .comfort + < @ >
𑣲⋆࣪ ִֶָ🧺 ❭ .thinkhard + < @ >
𑣲⋆࣪ ִֶָ🧺 ❭ .sniff + < @ >
𑣲⋆࣪ ִֶָ🧺 ❭ .blowkiss + < @ > 
𑣲⋆࣪ ִֶָ🧺 ❭ .snuggle < @ > 
𑣲⋆࣪ ִֶָ🧺 ❭ .bleh < @ >
𑣲⋆࣪ ִֶָ🧺 ❭ .clap < @ > 
𑣲⋆࣪ ִֶָ🧺 ❭ .coffee < @ > 
𑣲⋆࣪ ִֶָ🧺 ❭ .jump < @ > 
𑣲⋆࣪ ִֶָ🧺 ❭ .draw < @ >  
𑣲⋆࣪ ִֶָ🧺 ❭ .dramatic < @ >  
𑣲⋆࣪ ִֶָ🧺 ❭ .drunk < @ > 
𑣲⋆࣪ ִֶָ🧺 ❭ .impregnate < @ > 
𑣲⋆࣪ ִֶָ🧺 ❭ .kiss < @ >  
𑣲⋆࣪ ִֶָ🧺 ❭ .love  < @ > 
𑣲⋆࣪ ִֶָ🧺 ❭ .pout < @ >  
𑣲⋆࣪ ִֶָ🧺 ❭ .punch < @ >  
𑣲⋆࣪ ִֶָ🧺 ❭ .seduce  < @ > 
𑣲⋆࣪ ִֶָ🧺 ❭ .hug < @ > 
𑣲⋆࣪ ִֶָ🧺 ❭ .kill < @ > 
𑣲⋆࣪ ִֶָ🧺 ❭ .handhold < @ > 
𑣲⋆࣪ ִֶָ🧺 ❭ .bonk < @ >

⤷ ゛𝙂𝙧𝙪𝙥𝙤   ˎˊ˗

𑣲⋆࣪ ִֶָ🧺 ❭ .bot + < on/off >
𑣲⋆࣪ ִֶָ🧺 ❭ .promote + < @ >
𑣲⋆࣪ ִֶָ🧺 ❭ .demote + < @ >
𑣲⋆࣪ ִֶָ🧺 ❭ .setprimary + < @ >
𑣲⋆࣪ ִֶָ🧺 ❭ .warn + < @ > + razón 
𑣲⋆࣪ ִֶָ🧺 ❭ .mute + < @ > + razón 
𑣲⋆࣪ ִֶָ🧺 ❭ .unmute + < @ >
𑣲⋆࣪ ִֶָ🧺 ❭ .mutelist
𑣲⋆࣪ ִֶָ🧺 ❭ .topcount
𑣲⋆࣪ ִֶָ🧺 ❭ .topmessages
𑣲⋆࣪ ִֶָ🧺 ❭ .topmensajes
𑣲⋆࣪ ִֶָ🧺 ❭ .topmsgcount
𑣲⋆࣪ ִֶָ🧺 ❭ .setwelcome
𑣲⋆࣪ ִֶָ🧺 ❭ .setbye
𑣲⋆࣪ ִֶָ🧺 ❭ .gstatus
𑣲⋆࣪ ִֶָ🧺 ❭ .warns + < @ >
𑣲⋆࣪ ִֶָ🧺 ❭ .delwarns + < @ > + < número/all >
𑣲⋆࣪ ִֶָ🧺 ❭ .setwarnlimit + < número >
𑣲⋆࣪ ִֶָ🧺 ❭ .clear + < delete|views >
𑣲⋆࣪ ִֶָ🧺 ❭ .setgpbanner
𑣲⋆࣪ ִֶָ🧺 ❭ .setgpname + < text >
𑣲⋆࣪ ִֶָ🧺 ❭ .setgpdesc + < text >
𑣲⋆࣪ ִֶָ🧺 ❭ .closet › .open + < tiempo >
𑣲⋆࣪ ִֶָ🧺 ❭ .welcome
𑣲⋆࣪ ִֶָ🧺 ❭ .bienvenidas
𑣲⋆࣪ ִֶָ🧺 ❭ .antistatus
𑣲⋆࣪ ִֶָ🧺 ❭ .antiestados
𑣲⋆࣪ ִֶָ🧺 ❭ .alerts
𑣲⋆࣪ ִֶָ🧺 ❭ .alertas
𑣲⋆࣪ ִֶָ🧺 ❭ .gacha
𑣲⋆࣪ ִֶָ🧺 ❭ .rpg
𑣲⋆࣪ ִֶָ🧺 ❭ .economy
𑣲⋆࣪ ִֶָ🧺 ❭ .economia
𑣲⋆࣪ ִֶָ🧺 ❭ .adminonly
𑣲⋆࣪ ִֶָ🧺 ❭ .onlyadmin
𑣲⋆࣪ ִֶָ🧺 ❭ .antilinks
𑣲⋆࣪ ִֶָ🧺 ❭ .antilink
𑣲⋆࣪ ִֶָ🧺 ❭ .antienlaces
𑣲⋆࣪ ִֶָ🧺 ❭ .goodbye
𑣲⋆࣪ ִֶָ🧺 ❭ .despedidas
𑣲⋆࣪ ִֶָ🧺 ❭ .bye + < on|off >
𑣲⋆࣪ ִֶָ🧺 ❭ .groupinfo › .gp 
𑣲⋆࣪ ִֶָ🧺 ❭ .tag › .hidetag + < text >
𑣲⋆࣪ ִֶָ🧺 ❭ .kick + < @ >

⤷ ゛ 𝙄𝙖  ˎˊ˗

𑣲⋆࣪ ִֶָ🧺 ❭ .ia + <query>
𑣲⋆࣪ ִֶָ🧺 ❭ .chatgpt + <query>
𑣲⋆࣪ ִֶָ🧺 ❭ .nano + <prompt>
𑣲⋆࣪ ִֶָ🧺 ❭ .nanobanana + <prompt>

⤷ ゛ 𝙄𝙣𝙛𝙤  ˎˊ˗

𑣲⋆࣪ ִֶָ🧺 ❭ .allmenu + <category>
𑣲⋆࣪ ִֶָ🧺 ❭ .menu + <category>
𑣲⋆࣪ ִֶָ🧺 ❭ .help + <category>
𑣲⋆࣪ ִֶָ🧺 ❭ .infobot
𑣲⋆࣪ ִֶָ🧺 ❭ .infosocket
𑣲⋆࣪ ִֶָ🧺 ❭ .info
𑣲⋆࣪ ִֶָ🧺 ❭ .ping
𑣲⋆࣪ ִֶָ🧺 ❭ .p
𑣲⋆࣪ ִֶָ🧺 ❭ .report + <error>
𑣲⋆࣪ ִֶָ🧺 ❭ .reporte + <error>
𑣲⋆࣪ ִֶָ🧺 ❭ .status
𑣲⋆࣪ ִֶָ🧺 ❭ .sug + <suggest>
𑣲⋆࣪ ִֶָ🧺 ❭ .suggest + <suggest>
𑣲⋆࣪ ִֶָ🧺 ❭ .invitar + <link>
𑣲⋆࣪ ִֶָ🧺 ❭ .invite + <link>

⊹₊˚‧︵‿₊୨ᰔ୧₊‿︵‧˚₊⊹`;

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
