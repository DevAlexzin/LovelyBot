import db from "#db"

export default {
  command: ['delreg', 'delperfil', 'eliminarreg', 'borrarreg'],
  category: 'perfil',
  isAdmin: true,
  botAdmin: false,
  run: async ({ msg, sock }) => {
    try {
      if (!msg.isGroup) {
        return msg.reply('《✤》 Este comando solo funciona en grupos.');
      }

      // Detección robusta de menciones
      let menciones = [];
      if (msg.mentionedJid?.length > 0) menciones = msg.mentionedJid;
      else if (msg.mentions?.length > 0) menciones = msg.mentions;
      else if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
        menciones = msg.message.extendedTextMessage.contextInfo.mentionedJid;
      }
      else if (msg.message?.contextInfo?.mentionedJid) {
        menciones = msg.message.contextInfo.mentionedJid;
      }

      if (menciones.length === 0) {
        const textoOriginal = msg.text || msg.body || '';
        const regexMencion = /@(\d{8,15})/g;
        let match;
        while ((match = regexMencion.exec(textoOriginal)) !== null) {
          menciones.push(match[1] + '@s.whatsapp.net');
        }
      }

      // Texto después del comando (por si buscan por nombre)
      let textoCompleto = msg.text || msg.body || '';
      const texto = textoCompleto
        .replace(/^[.\/!#]?(delreg|delperfil|eliminarreg|borrarreg)\s*/i, '')
        .trim();

      // Si no hay mención ni nombre, mostramos instrucciones
      if (menciones.length === 0 && !texto) {
        return msg.reply(`🗑️ *Eliminar registro de jugadora*

*📋 Formas de uso:*
\`.delreg @jugadora\` → Elimina por mención
\`.delreg nombre\` → Elimina por nombre

*📌 Ejemplos:*
\`.delreg @Sofia\`
\`.delreg Daniel\`

> ⚠️ *Esta acción es permanente.*`);
      }

      const chatData = await db.getChat(msg.chat);

      let perfilKey = null;
      let perfil = null;
      let usuarioId = null;

      // CASO 1: Si mencionó a alguien
      if (menciones.length > 0) {
        usuarioId = menciones[0].split('@')[0];
        perfilKey = `perfil_${usuarioId}`;
        perfil = chatData[perfilKey];
        console.log(`🔍 [DELREG] Buscando por mención: ${usuarioId}`);
      }
      // CASO 2: Si escribió un nombre
      else if (texto) {
        const nombreBuscado = texto.toLowerCase().trim();
        console.log(`🔍 [DELREG] Buscando por nombre: "${nombreBuscado}"`);

        for (const [key, value] of Object.entries(chatData)) {
          if (key.startsWith('perfil_') && value && typeof value === 'object') {
            const nombreP = (value.nombre || '').toLowerCase().trim();
            const nickP = (value.nickFf || '').toLowerCase().trim();

            if (nombreP === nombreBuscado || nickP === nombreBuscado) {
              perfil = value;
              perfilKey = key;
              usuarioId = value.id;
              console.log(`✅ [DELREG] Perfil encontrado: ${key}`);
              break;
            }
          }
        }
      }

      if (!perfil || !perfilKey) {
        if (menciones.length > 0) {
          return msg.reply(`❌ @${usuarioId} no está registrada.`);
        }
        return msg.reply(`❌ No se encontró un perfil con el nombre *${texto}*.`);
      }

      // Guardamos los datos antes de eliminar para mostrarlos
      const datosEliminados = {
        nickFf: perfil.nickFf,
        tag: perfil.tag,
        modoFav: perfil.modoFav,
        nombre: perfil.nombre,
        edad: perfil.edad,
        pais: perfil.pais,
        cumple: perfil.cumple
      };

      // ✅ Eliminamos el perfil
      delete chatData[perfilKey];
      await db.updateChat(msg.chat, perfilKey, null); // También lo marcamos como null
      
      // ✅ Eliminamos también de las participaciones (por si existe)
      const año = new Date().getFullYear();
      const inicioAño = new Date(año, 0, 1);
      const diasTranscurridos = Math.floor((new Date() - inicioAño) / 86400000);
      const semana = Math.ceil((diasTranscurridos + inicioAño.getDay() + 1) / 7);
      const partiKey = `participacion_semana_${año}_${semana}`;
      
      if (chatData[partiKey] && Array.isArray(chatData[partiKey])) {
        const registrosFiltrados = chatData[partiKey].filter(
          r => r.id !== usuarioId && r.nombre.toLowerCase() !== datosEliminados.nombre.toLowerCase()
        );
        await db.updateChat(msg.chat, partiKey, registrosFiltrados);
        console.log(`🗑️ [DELREG] Eliminado de participaciones también`);
      }

      const mentionsFinal = [usuarioId + '@s.whatsapp.net'];

      await sock.sendMessage(msg.chat, {
        text: `🗑️ *Registro eliminado correctamente*

> 👤 @${usuarioId}
> 🏷️ Nombre: ${datosEliminados.nombre}
> 🎮 Nick: ${datosEliminados.nickFf}
> 📊 Tag: ${datosEliminados.tag}

> ⚠️ La jugadora puede volver a registrarse con \`.reg\``,
        mentions: mentionsFinal
      }, { quoted: msg });

      console.log(`✅ [DELREG] Perfil de ${datosEliminados.nombre} eliminado`);

    } catch (e) {
      console.error("❌ [DELREG ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al eliminar el registro.');
    }
  },
};
