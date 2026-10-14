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
\`.reg PsychoKing/23/Rank/Daniel/25/Perú/12-03\`

*📝 Campos (en este orden):*
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

      const hayMencion = menciones.length > 0;
      const usuarioId = hayMencion
        ? menciones[0].split('@')[0]
        : msg.sender.split('@')[0];

      const esOtro = hayMencion && usuarioId !== msg.sender.split('@')[0];

      // ✅ Quitamos la mención del texto para que no interfiera
      let textoLimpio = texto;
      if (hayMencion) {
        textoLimpio = textoLimpio.replace(/@\d{8,15}/g, '').trim();
        textoLimpio = textoLimpio.replace(/@~\w+/g, '').trim();
        textoLimpio = textoLimpio.replace(/^[\s\/]+/, '').trim();
      }

      const partes = textoLimpio.split('/').map(p => p.trim());

      // ✅ Filtramos elementos vacíos (por si hay espacios o barras extra)
      const partesFiltradas = partes.filter(p => p !== '');

      if (partesFiltradas.length < 7) {
        return msg.reply(`❌ *Faltan datos.* Necesitas 7 valores separados por \`/\`.\n\n*Recibí:* ${partesFiltradas.length} valores\n\nUsa \`.reg\` para ver el formato.`);
      }

      const nickFf = partesFiltradas[0];
      const tag = partesFiltradas[1];
      const modoFav = partesFiltradas[2];
      const nombre = partesFiltradas[3];
      const edad = partesFiltradas[4];
      const pais = partesFiltradas[5];
      const cumple = partesFiltradas[6];

      console.log(`📝 [REG] Datos: nick=${nickFf}, tag=${tag}, modo=${modoFav}, nombre=${nombre}, edad=${edad}, pais=${pais}, cumple=${cumple}`);

      const dbKey = `perfil_${usuarioId}`;
      const chatData = await db.getChat(msg.chat);
      const perfilExistente = chatData[dbKey];

      if (perfilExistente) {
        const mentionsFinal = hayMencion ? menciones : [msg.sender];

        return sock.sendMessage(msg.chat, {
          text: `⚠️ *${esOtro ? `@${usuarioId}` : 'Ya estás'} ${esOtro ? 'ya está registrada' : 'registrada'}.*

> 👤 Nick FF: ${perfilExistente.nickFf}
> 🏷️ Tag: ${perfilExistente.tag}
> 🎮 Modo fav: ${perfilExistente.modoFav}
> 👸 Nombre: ${perfilExistente.nombre}
> 📅 Edad: ${perfilExistente.edad}
> 🌎 País: ${perfilExistente.pais}
> 🎂 Cumple: ${perfilExistente.cumple}

> 💡 Usa \`.perfil${esOtro ? ` @${usuarioId}` : ''}\` para ver el perfil completo.`,
          mentions: mentionsFinal
        }, { quoted: msg });
      }

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

      const mentionsFinal = hayMencion ? menciones : [msg.sender];

      await sock.sendMessage(msg.chat, {
        text: `✅ *¡Registro exitoso${esOtro ? ` de @${usuarioId}` : ''}!*

> 👤 Nick FF: ${nickFf}
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
