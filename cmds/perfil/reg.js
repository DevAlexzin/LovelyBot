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

> 💡 *Para registrar a otra persona:*
> \`.reg @jugadora nick_ff/tag/modo/nombre/edad/país/cumple\``;

        return msg.reply(formato);
      }

      const menciones = msg.mentionedJid || msg.mentions || [];
      
      // ✅ CLAVE: Determinamos a QUIÉN estamos registrando
      // Si hay mención → registramos al mencionado
      // Si NO hay mención → registramos al que escribe
      const hayMencion = menciones.length > 0;
      const usuarioId = hayMencion
        ? menciones[0].split('@')[0]
        : msg.sender.split('@')[0];

      const esOtro = hayMencion && usuarioId !== msg.sender.split('@')[0];

      console.log(`📝 [REG] Registrando a: ${usuarioId} (${esOtro ? 'admin registra a otra' : 'auto-registro'})`);

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

      // ✅ Usamos la clave del PERFIL DEL USUARIO OBJETIVO (no del admin)
      const dbKey = `perfil_${usuarioId}`;
      const chatData = await db.getChat(msg.chat);
      const perfilExistente = chatData[dbKey];

      console.log(`🔍 [REG] Buscando perfil existente en: ${dbKey} → ${perfilExistente ? 'ENCONTRADO' : 'NO EXISTE'}`);

      // ✅ VALIDACIÓN: Si YA está registrado (solo validamos al usuario objetivo)
      if (perfilExistente) {
        const mentionsFinal = hayMencion ? menciones : [msg.sender];
        
        return sock.sendMessage(msg.chat, {
          text: `⚠️ *${esOtro ? `@${usuarioId}` : 'Ya estás'} ${esOtro ? 'ya está registrada' : 'registrada'}.*

> 👤 Nick: ${perfilExistente.nickFf}
> 🏷️ Tag: ${perfilExistente.tag}
> 🎮 Modo fav: ${perfilExistente.modoFav}
> 👸 Nombre: ${perfilExistente.nombre}
> 📅 Edad: ${perfilExistente.edad}
> 🌎 País: ${perfilExistente.pais}
> 🎂 Cumple: ${perfilExistente.cumple}

> 💡 Usa \`.perfil${esOtro ? ` @${usuarioId}` : ''}\` para ver el perfil completo.
> ⚠️ Si quieres actualizar los datos, avisa a un administrador.`,
          mentions: mentionsFinal
        }, { quoted: msg });
      }

      // ✅ Si NO está registrado, lo registramos
      const perfil = {
        id: usuarioId,
        nickFf,
        tag,
        modoFav,
        nombre,
        edad,
        pais,
        cumple,
        mvpTotales: 0,
        versusJugados: 0,
        fechaRegistro: new Date().toISOString()
      };

      await db.updateChat(msg.chat, dbKey, perfil);

      console.log(`✅ [REG] Perfil guardado en: ${dbKey}`);

      const mentionsFinal = hayMencion ? menciones : [msg.sender];

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
      console.error("   Stack:", e.stack);
      msg.reply('❌ Ocurrió un error al procesar el registro.');
    }
  },
};
