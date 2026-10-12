import db from "#db"

export default {
  command: ['everyone', 'all', 'tagall', 'todos'],
  category: 'grupo',
  isAdmin: true,
  botAdmin: true,

  run: async ({ msg, sock }) => {
    try {
      // ✅ Verificamos que sea un grupo
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

      // ✅ Obtenemos el texto del mensaje
      let textoCompleto = msg.text || msg.body || '';
      
      // ✅ Quitamos CUALQUIER comando conocido al inicio (con o sin prefijo)
      // Esto elimina: .todos, /todos, !todos, #todos, .everyone, .all, .tagall, etc.
      const textoUsuario = textoCompleto
        .replace(/^[.\/!#]?(everyone|all|tagall|todos)\s*/i, '')
        .trim();

      // Construimos el mensaje
      let tagText = `╭─〔 👥 ETIQUETANDO A TODOS 〕─⬣\n`;
      tagText += `│ 👤 Integrantes: ${totalMembers}\n`;
      tagText += `╰────────────────⬣\n\n`;

      for (let user of mentions) {
        tagText += `➤ @${user.split('@')[0]}\n`;
      }

      // ✅ Si el usuario escribió algo DESPUÉS del comando, lo ponemos arriba.
      // Si no escribió nada, solo mostramos las etiquetas.
      const finalText = textoUsuario.length > 0
        ? `${textoUsuario}\n\n${tagText}`
        : tagText;

      await sock.sendMessage(
        msg.chat,
        {
          text: finalText,
          mentions
        },
        {
          quoted: msg
        }
      );

    } catch (e) {
      console.error("❌ Error en everyone:", e.message);
      msg.reply(msgglobal);
    }
  }
};
