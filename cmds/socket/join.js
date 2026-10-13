import db from "#db"

export default {
  command: ['join', 'unir'],
  isModeration: true,
  run: async ({ msg, sock }) => {
    try {
      const idBot = sock.user.id.split(':')[0] + '@s.whatsapp.net'
      const config = await db.getSettings(idBot)

      // ✅ Validamos que global.mods exista antes de hacer .map()
      const mods = Array.isArray(global.mods) ? global.mods : []
      
      const isOwner2 = [
        idBot,
        ...(config.owner ? [config.owner] : []),
        ...mods.map(num => num + '@s.whatsapp.net')
      ].includes(msg.sender)

      if (!isOwner2) return msg.reply(mess?.socket || '❌ No tienes permiso para usar este comando.')

      // ✅ Extraemos el enlace de forma más robusta
      let textoCompleto = msg.text || msg.body || ''
      const textoLimpio = textoCompleto
        .replace(/^[.\/!#]?(join|unir)\s*/i, '')
        .trim()

      if (!textoLimpio) {
        return msg.reply('《✧》 Ingresa el enlace del grupo para unir el bot.\n\n*Ejemplo:* `.join https://chat.whatsapp.com/xxxxx`')
      }

      const linkRegex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i
      const match = textoLimpio.match(linkRegex)

      if (!match || !match[1]) {
        return msg.reply('《✧》 El enlace ingresado no es válido o está incompleto.')
      }

      const inviteCode = match[1]
      
      await sock.groupAcceptInvite(inviteCode)
      
      await sock.reply(
        msg.chat, 
        `❀ ${config.namebot || 'El bot'} se ha unido exitosamente al grupo.`, 
        msg
      )

    } catch (e) {
      const errMsg = String(e.message || e)
      console.error('❌ [JOIN ERROR]:', errMsg)

      if (errMsg.includes('not-authorized') || errMsg.includes('requires-admin')) {
        await msg.reply('《✧》 La unión requiere aprobación de administrador. Espera a que acepten tu solicitud.')
      } else if (errMsg.includes('not-in-group') || errMsg.includes('removed')) {
        await msg.reply('《✧》 No se pudo unir al grupo porque el bot fue eliminado recientemente.')
      } else {
        await msg.reply('《✧》 No se pudo unir al grupo, verifica el enlace o los permisos.')
      }
    }
  },
}
