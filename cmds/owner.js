import db from "#db"

export default {
  command: ['owner', 'creador', 'dueño'],
  category: 'info',
  botAdmin: false,
  run: async ({ msg, sock }) => {
    try {
      const idBot = sock.user.id.split(':')[0] + '@s.whatsapp.net'
      const config = await db.getSettings(idBot)

      const ownerMsg = `👑 *𝑶𝑾𝑵𝑬𝑹*

> 🔒 El owner de este bot está *oculto por privacidad*.

> 💡 Si necesitas contactarlo, usa el comando de soporte o espera a que se anuncie.`

      await sock.sendMessage(msg.chat, {
        text: ownerMsg.trim()
      }, { quoted: msg })

    } catch (e) {
      console.error('❌ [OWNER ERROR]:', e.message)
      msg.reply('❌ Ocurrió un error al procesar el comando.')
    }
  },
}
