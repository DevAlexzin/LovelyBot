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
        return msg.reply(`┈─˖Ი𐑼⋆ 𝗥𝗲𝗴𝗶𝘀𝘁𝗿𝗼 𝗱𝗲 𝗷𝘂𝗴𝗮𝗱𝗼𝗿𝗮

*📋 Formato:*
\`.reg nick_ff/tag/modo/nombre/edad/país/cumple\`

*📌 Ejemplo:*
\`.reg PsychoKing/23/Rank/Sofia/18/Perú/12-03\`

*📝 Campos (en orden):*
1️⃣ Nick FF
2️⃣ Tag
3️⃣ Modo favorito
4️⃣ Nombre ⭐ (se usa para identificarla)
5️⃣ Edad
6️⃣ País
7️⃣ Cumple`);
      }

      // Quitamos menciones del texto si las hay
      let textoLimpio = texto.replace(/@\d{8,15}/g, '').replace(/@~\w+/g, '').trim();
      textoLimpio = textoLimpio.replace(/^[\/\s]+/, '').trim();

      const partes = textoLimpio.split('/').map(p => p.trim()).filter(p => p !== '');

      if (partes.length < 7) {
        return msg.reply(`❌ *Faltan datos.* Necesitas 7 valores.\n\n*Recibí:* ${partes.length}\n\nUsa \`.reg\` para ver el formato.`);
      }

      const nickFf = partes[0];
      const tag = partes[1];
      const modoFav = partes[2];
      const nombre = partes[3];
      const edad = partes[4];
      const pais = partes[5];
      const cumple = partes[6];

      // ✅ El NOMBRE es el identificador único
      const nombreKey = nombre.toLowerCase().trim();
      const dbKey = `perfil_${nombreKey}`;

      const chatData = await db.getChat(msg.chat);
      const perfilExistente = chatData[dbKey];

      if (perfilExistente) {
        return msg.reply(`⚠️ *Ya existe un perfil con el nombre "${nombre}".*

> 👤 Nick: ${perfilExistente.nickFf}
> 🏷️ Tag: ${perfilExistente.tag}
> 🎮 Modo: ${perfilExistente.modoFav}
> 👸 Nombre: ${perfilExistente.nombre}
> 📅 Edad: ${perfilExistente.edad}
> 🌎 País: ${perfilExistente.pais}
> 🎂 Cumple: ${perfilExistente.cumple}

> 💡 Usa \`.perfil ${nombre}\` para verlo.`);
      }

      const perfil = {
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

      console.log(`✅ [REG] Perfil guardado: ${nombre} → ${dbKey}`);

      await msg.reply(`✅ *¡Registro exitoso!*

> 👤 Nick FF: ${nickFf}
> 🏷️ Tag: ${tag}
> 🎮 Modo fav: ${modoFav}
> 👸 Nombre: ${nombre}
> 📅 Edad: ${edad}
> 🌎 País: ${pais}
> 🎂 Cumple: ${cumple}

> 💡 Usa \`.perfil ${nombre}\` para ver el perfil completo.`);

    } catch (e) {
      console.error("❌ [REG ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al procesar el registro.');
    }
  },
};
