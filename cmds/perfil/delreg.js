import db from "#db"

export default {
  command: ['delreg', 'delperfil', 'eliminarreg'],
  category: 'perfil',
  isAdmin: true,
  botAdmin: false,
  run: async ({ msg, sock }) => {
    try {
      if (!msg.isGroup) {
        return msg.reply('《✤》 Este comando solo funciona en grupos.');
      }

      let textoCompleto = msg.text || msg.body || '';
      const nombreObjetivo = textoCompleto
        .replace(/^[.\/!#]?(delreg|delperfil|eliminarreg)\s*/i, '')
        .replace(/@\d{8,15}/g, '')
        .replace(/@~\w+/g, '')
        .trim();

      if (!nombreObjetivo) {
        return msg.reply(`🗑️ *Eliminar registro*

*📋 Uso:*
\`.delreg nombre\`

*📌 Ejemplo:*
\`.delreg Sofia\``);
      }

      const nombreKey = nombreObjetivo.toLowerCase().trim();
      const perfilKey = `perfil_${nombreKey}`;

      const chatData = await db.getChat(msg.chat);
      const perfil = chatData[perfilKey];

      if (!perfil) {
        return msg.reply(`❌ No se encontró un perfil con el nombre *${nombreObjetivo}*.`);
      }

      // Eliminamos el perfil
      await db.updateChat(msg.chat, perfilKey, null);

      // Eliminamos también de participaciones
      const año = new Date().getFullYear();
      const inicioAño = new Date(año, 0, 1);
      const diasTranscurridos = Math.floor((new Date() - inicioAño) / 86400000);
      const semana = Math.ceil((diasTranscurridos + inicioAño.getDay() + 1) / 7);
      const partiKey = `participacion_semana_${año}_${semana}`;

      const chatDataActualizado = await db.getChat(msg.chat);
      if (chatDataActualizado[partiKey] && Array.isArray(chatDataActualizado[partiKey])) {
        const filtrados = chatDataActualizado[partiKey].filter(
          r => r.nombre.toLowerCase().trim() !== nombreKey
        );
        await db.updateChat(msg.chat, partiKey, filtrados);
      }

      await msg.reply(`🗑️ *Registro eliminado*

> 👸 Nombre: ${perfil.nombre}
> 🎮 Nick: ${perfil.nickFf}

> ⚠️ Puede volver a registrarse con \`.reg\``);

    } catch (e) {
      console.error("❌ [DELREG ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al eliminar el registro.');
    }
  },
};
