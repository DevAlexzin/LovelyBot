import db from "#db"

export default {
  command: ['registrar', 'reg', 'registro'],
  category: 'perfil',
  botAdmin: false,
  run: async ({ msg, sock }) => {
    try {
      if (!msg.isGroup) {
        return msg.reply('《✤》 Este comando solo funciona en grupos.');
      }

      let textoCompleto = msg.text || msg.body || '';
      const texto = textoCompleto
        .replace(/^[.\/!#]?(registrar|reg|registro)\s*/i, '')
        .trim();

      if (!texto) {
        const formato = `┈─˖Ი𐑼⋆ 𝗥𝗲𝗴𝗶𝘀𝘁𝗿𝗼 𝗱𝗲 𝗷𝘂𝗴𝗮𝗱𝗼𝗿𝗮

ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ

*📋 Formato:*
\`.reg nick_ff/tag/modo_fav/nombre/edad/país/cumple\`

*📌 Ejemplo:*
\`.reg PsychoKing/1234/Rank/Sofia/18/Perú/15-03\`

*📝 Campos:*
1️⃣ Nick FF
2️⃣ Tag
3️⃣ Modo favorito
4️⃣ Nombre
5️⃣ Edad
6️⃣ País
7️⃣ Fecha de cumpleaños

> 💡 También puedes registrar a alguien más mencionándola:
> \`.reg @jugadora nick_ff/tag/...\``;

        return msg.reply(formato);
      }

      const menciones = msg.mentionedJid || msg.mentions || [];
      const usuarioId = menciones.length > 0
        ? menciones[0].split('@')[0]
        : msg.sender.split('@')[0];

      const esOtro = menciones.length > 0 && usuarioId !== msg.sender.split('@')[0];

      const partes = texto.split('/').map(p => p.trim());

      if (partes.length < 7) {
        return msg.reply('❌ *Faltan datos.* Necesitas 7 valores separados por `/`.\nUsa `.reg` para ver el formato.');
      }

      const nickFf = partes[0];
      const tag = partes[1];
      const modoFav = partes[2];
      const nombre = partes[3];
      const edad = partes[4];
      const pais = partes[5];
      const cumple = partes[6];

      const dbKey = `perfil_${usuarioId}`;
      const chatData = await db.getChat(msg.chat);
      const perfilExistente = chatData[dbKey];

      const perfil = {
        id: usuarioId,
        nickFf,
        tag,
        modoFav,
        nombre,
        edad,
        pais,
        cumple,
        mvpTotales: perfilExistente?.mvpTotales || 0,
        versusJugados: perfilExistente?.versusJugados || 0,
        fechaRegistro: perfilExistente?.fechaRegistro || new Date().toISOString()
      };

      await db.updateChat(msg.chat, dbKey, perfil);

      const mentionsFinal = menciones.length > 0 ? menciones : [msg.sender];

      await sock.sendMessage(msg.chat, {
        text: `✅ *¡Registro exitoso${esOtro ? ` de @${usuarioId}` : ''}!*

> 👤 Nick: ${nickFf}
> 🏷️ Tag: ${tag}
> 🎮 Modo fav: ${modoFav}
> 👸 Nombre: ${nombre}
> 📅 Edad: ${edad}
> 🌎 País: ${pais}
> 🎂 Cumple: ${cumple}

> 💡 Usa \`.perfil${esOtro ? ` @${usuarioId}` : ''}\` para ver el perfil completo.`,
        mentions: mentionsFinal
      }, { quoted: msg });

    } catch (e) {
      console.error("❌ [REG ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al procesar el registro.');
    }
  },
};
