import db from "#db"

export default {
  command: ['parti', 'participacion'],
  category: 'grupo',
  isAdmin: true,
  botAdmin: false,
  run: async ({ msg, sock }) => {
    try {
      if (!msg.isGroup) {
        return msg.reply('《✤》 Este comando solo funciona en grupos.');
      }

      let textoCompleto = msg.text || msg.body || '';
      let textoUsuario = textoCompleto
        .replace(/^[.\/!#]?(parti|participacion)\s*/i, '')
        .trim();

      // Corazones válidos
      const corazonesValidos = ['💙', '🩷', '💜', '💛', '💚', '❤️', '🍯', '🌊', '🫐', '🪽', '🌀', '✨'];
      const corazonEncontrado = corazonesValidos.find(c => textoUsuario.includes(c));

      if (!corazonEncontrado) {
        return msg.reply(`❌ Debes especificar un corazón válido.\n\n*Corazones:* 💙 🩷 💜 💛 💚 ❤️ 🍯 🌊 🫐 🪽 🌀 ✨\n\n*Ejemplo:* \`.parti Sofia 💙\``);
      }

      // ✅ Ahora SOLO por NOMBRE (no por mención)
      const nombreObjetivo = textoUsuario
        .replace(corazonEncontrado, '')
        .replace(/@\d{8,15}/g, '')
        .replace(/@~\w+/g, '')
        .trim();

      if (!nombreObjetivo) {
        return msg.reply('❌ Debes escribir el nombre de la jugadora.\n\n*Ejemplo:* `.parti Sofia 💙`');
      }

      const nombreKey = nombreObjetivo.toLowerCase().trim();

      console.log(`📝 [PARTI] Anotando a: "${nombreObjetivo}" (key: ${nombreKey})`);

      // Fecha
      const ahora = new Date();
      const año = ahora.getFullYear();
      const inicioAño = new Date(año, 0, 1);
      const diasTranscurridos = Math.floor((ahora - inicioAño) / 86400000);
      const semana = Math.ceil((diasTranscurridos + inicioAño.getDay() + 1) / 7);

      const chatData = await db.getChat(msg.chat);
      const dbKey = `participacion_semana_${año}_${semana}`;
      let registros = chatData[dbKey] || [];

      // ✅ Buscamos por nombre (case-insensitive)
      let personaRegistrada = registros.find(
        r => r.nombre.toLowerCase().trim() === nombreKey
      );

      if (!personaRegistrada) {
        personaRegistrada = {
          nombre: nombreObjetivo,
          corazones: [],
          fechaRegistro: ahora.toISOString()
        };
        registros.push(personaRegistrada);
        console.log(`✅ [PARTI] Nueva: ${nombreObjetivo}`);
      }

      // Agregamos el corazón
      personaRegistrada.corazones.push(corazonEncontrado);

      await db.updateChat(msg.chat, dbKey, registros);

      // ✅ CONEXIÓN CON EL PERFIL (por nombre)
      const perfilKey = `perfil_${nombreKey}`;
      const chatDataActualizado = await db.getChat(msg.chat);

      if (chatDataActualizado[perfilKey]) {
        chatDataActualizado[perfilKey].versusJugados = (chatDataActualizado[perfilKey].versusJugados || 0) + 1;
        await db.updateChat(msg.chat, perfilKey, chatDataActualizado[perfilKey]);
        console.log(`📊 [PARTI → PERFIL] ${nombreObjetivo} ahora tiene ${chatDataActualizado[perfilKey].versusJugados} versus`);
      } else {
        console.log(`⚠️ [PARTI] No hay perfil para "${nombreObjetivo}"`);
      }

      // Lista
      let listaParticipantes = '';
      for (const reg of registros) {
        const corazones = reg.corazones.length > 0
          ? reg.corazones.join(' ')
          : '⏳';

        listaParticipantes += `ᯓ★ .ᐟ ${reg.nombre} ║ ${corazones}\n`;
      }

      // ✅ NUEVO DISEÑO
      const participacionMsg = `ˑ 𓈒 𐔌 🫐𝗣𝗮𝗿𝘁𝗶𝗰𝗶𝗽𝗮𝗰𝗶𝗼𝗻 𝘀𝗲𝗺𝗮𝗻𝗮𝗹  ͡꒱ ۫

⊹₊˚‧︵‿₊୨ 𝐵𝑜𝑟𝑛 𝑡𝑜 𝑑𝑖𝑒. ୧₊‿︵‧˚₊⊹

 Mvρ: 👑
 Pᥲrtιᥴιρᥲᥴιoᥒ :
𝗟💙/𝗠🌊/𝗠🫐/𝗝🪽/𝗩🌀/𝗦✨

⌢.⌢.⌢.꒰⌢୨୧⌢꒱.⌢.⌢.⌢

𑣲⋆࣪ ִֶָ 𝙄𝙉𝙏𝙀𝙂𝙍𝘼𝙉𝙏𝙀𝙎 
${listaParticipantes}
> *Total:* ${registros.length}`;

      await sock.sendMessage(msg.chat, {
        text: participacionMsg.trim()
      }, { quoted: msg });

    } catch (e) {
      console.error("❌ [PARTI ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al procesar la participación.');
    }
  },
};
