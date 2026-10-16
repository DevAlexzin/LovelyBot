import db from "#db"

export default {
  command: ['autoadmin', 'admin'],
  category: 'socket',
  isOwner: true,
  botAdmin: true,
  run: async ({ msg, sock }) => {
    try {
      if (!msg.isGroup) {
        return msg.reply('《✤》 Este comando solo funciona en grupos.');
      }

      // ✅ Verificamos que el bot sea admin
      const groupMetadata = await sock.groupMetadata(msg.chat).catch(() => null);
      if (!groupMetadata) {
        return msg.reply('❌ No se pudo obtener la información del grupo.');
      }

      const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
      const botNum = botId.split('@')[0];

      const botParticipant = groupMetadata.participants.find(p => {
        const pid = p.jid || p.id || p.lid || '';
        return pid.split('@')[0].split(':')[0] === botNum;
      });

      const botEsAdmin = botParticipant?.admin === 'admin' || botParticipant?.admin === 'superadmin';

      if (!botEsAdmin) {
        return msg.reply('❌ El bot necesita ser administrador para poder darte admin.');
      }

      // ✅ Verificamos si el usuario ya es admin
      const senderNum = msg.sender.split('@')[0].split(':')[0];
      const senderParticipant = groupMetadata.participants.find(p => {
        const pid = p.jid || p.id || p.lid || '';
        return pid.split('@')[0].split(':')[0] === senderNum;
      });

      const yaEsAdmin = senderParticipant?.admin === 'admin' || senderParticipant?.admin === 'superadmin';

      if (yaEsAdmin) {
        return msg.reply('⚠️ Ya eres administrador de este grupo.');
      }

      // ✅ Promocionamos al owner como admin
      await sock.groupParticipantsUpdate(msg.chat, [msg.sender], 'promote');

      console.log(`✅ [AUTOADMIN] ${senderNum} promocionado a admin en ${msg.chat}`);

      await msg.reply(`✅ *¡Ahora eres administrador!*

> 👑 Has sido promocionado como admin del grupo.
> 💡 Usa el comando de nuevo si quieres volver a intentarlo.`);

    } catch (e) {
      console.error("❌ [AUTOADMIN ERROR]:", e.message);
      msg.reply(`❌ Ocurrió un error: ${e.message}`);
    }
  },
};
