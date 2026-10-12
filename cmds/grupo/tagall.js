import db from "#db"

export default {
  command: ['todos', 'all', 'tagall'],
  category: 'grupo',
  isAdmin: true,
  botAdmin: true,

  run: async ({ msg, sock }) => {
    console.log("========================================");
    console.log("🔍 [DEBUG] Comando 'everyone' ejecutado.");
    console.log("========================================");

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

      // ✅ Texto opcional que el usuario escriba después del comando
      let textoCompleto = msg.text || msg.body || '';
      // Quitamos el comando para obtener solo el texto del usuario
      const textoUsuario = textoCompleto.replace(/^[.\/!#]?(everyone|all|tagall)\s*/i, '').trim();

      // Construimos el mensaje con la estructura de plantillas correcta
      let tagText = `╭─〔 👥 ETIQUETANDO A TODOS 〕─⬣\n`;
      tagText += `│ 👤 Integrantes: ${totalMembers}\n`;
      tagText += `╰────────────────⬣\n\n`;

      for (let user of mentions) {
        tagText += `➤ @${user.split('@')[0]}\n`;
      }

      // Si el usuario escribió un mensaje, lo ponemos arriba
      const finalText = textoUsuario
        ? `${textoUsuario}\n\n${tagText}`
        : tagText;

      console.log("📤 [DEBUG] Enviando mensaje con menciones...");
      
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

      console.log("✅ [DEBUG] Mensaje enviado con éxito.");

    } catch (e) {
      console.error("❌ [ERROR CRÍTICO] Fallo en el comando everyone:");
      console.error("   - Mensaje de error:", e.message);
      console.error("   - Stack trace:", e.stack);
      
      msg.reply(msgglobal);
    }
  }
};
