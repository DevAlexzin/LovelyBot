import db from "#db"

export default {
  command: ['todos', 'everyone', 'all', 'tagall'],
  category: 'grupo',
  isAdmin: true,
  botAdmin: true,
  run: async ({ msg, sock }) => {
    try {
      if (!msg.isGroup) {
        return msg.reply('《✤》 Este comando solo funciona en grupos.');
      }

      // Obtenemos los metadatos del grupo
      const groupMetadata = await sock.groupMetadata(msg.chat).catch(() => null);
      const groupParticipants = groupMetadata?.participants || [];

      // Extraemos los IDs de los participantes
      const mentions = groupParticipants
        .map(p => p.jid || p.id || p.lid || p.phoneNumber)
        .filter(Boolean)
        .map(id => sock.decodeJid(id));

      const totalMembers = mentions.length;

      // ✅ Texto exacto que proporcionaste
      let tagText = `𖥻 ׁ ׅ 𝑰𝒏𝒗𝒐𝒄𝒂𝒏𝒅𝒐 𝒍𝒖𝒄𝒆𝒄𝒊𝒕𝒂𝒔 🫐 ! ﹒ ◡◡

‧˚꒰🐾୭ ˚. ᵎᵎ𝘓𝘰𝘴 𝘪𝘯𝘷𝘪𝘵𝘰 𝘢 𝘱𝘳𝘦𝘴𝘵𝘢𝘳 𝘢𝘵𝘦𝘯𝘤𝘪ó𝘯 𝘢 𝘴𝘶𝘴 𝘈𝘥𝘮𝘪𝘯𝘴 𝘤𝘥𝘵𝘮

⊹₊˚‧︵‿₊  𝐵𝑜𝑟𝑛 𝑡𝑜 𝑑𝑖𝑒. ₊‿︵‧˚₊⊹

𝙄𝙉𝙏𝙀𝙂𝙍𝘼𝙉𝙏𝙀𝙎 : \n\n`;

      // Agregamos cada mención
      for (const user of mentions) {
        tagText += `﹒⌗ 💙 @${user.split('@')[0]}\n`;
      }

      await sock.sendMessage(
        msg.chat,
        {
          text: tagText,
          mentions
        },
        {
          quoted: msg
        }
      );

    } catch (e) {
      console.error("❌ [TODOS ERROR]:", e.message);
      msg.reply(msgglobal || '❌ Ocurrió un error al etiquetar.');
    }
  }
};
