import db from "#db"

export default {
  command: ['parti', 'participacion'],
  category: 'grupo',
  botAdmin: false,
  run: async ({ msg, sock }) => {
    console.log("========================================");
    console.log("🔍 [DEBUG] Comando 'parti' ejecutado.");
    console.log("========================================");

    try {
      // 1. Verificamos que sea un grupo
      if (!msg.isGroup) {
        return msg.reply('《✤》 Este comando solo funciona en grupos.');
      }

      // 2. Extraemos el texto que escribió el usuario (SIN el comando)
      let textoCompleto = msg.text || msg.body || '';
      let textoUsuario = textoCompleto
        .replace(/^[.\/!#]?(parti|participacion)\s*/i, '')
        .trim();

      // 3. Obtenemos la fecha actual
      const ahora = new Date();
      const año = ahora.getFullYear();
      const inicioAño = new Date(año, 0, 1);
      const diasTranscurridos = Math.floor((ahora - inicioAño) / 86400000);
      const semana = Math.ceil((diasTranscurridos + inicioAño.getDay() + 1) / 7);

      // 4. Leemos la configuración del chat
      const chatData = await db.getChat(msg.chat);
      const dbKey = `participacion_semana_${año}_${semana}`;
      let registros = chatData[dbKey] || [];

      // 5. Buscamos si el usuario ya está registrado
      const usuarioId = msg.sender.split('@')[0];
      let usuarioRegistrado = registros.find(r => r.id === usuarioId);

      // 6. Buscamos si hay un corazón en el mensaje
      const corazonesValidos = ['💙', '🩷', '💜', '💛', '💚', '❤️', '🍯'];
      const corazonEncontrado = corazonesValidos.find(c => textoUsuario.includes(c));

      // ============================================================
      // CASO 1: NO ESTÁ REGISTRADA
      // ============================================================
      if (!usuarioRegistrado) {
        // Si puso un corazón pero no está registrada, le pedimos que se registre primero
        if (corazonEncontrado) {
          return msg.reply('❌ Primero debes registrarte. Escribe `.parti TuNombre` (sin corazón).');
        }

        // Si no escribió nombre, le pedimos que se registre
        if (!textoUsuario) {
          return msg.reply('❌ Debes registrarte primero. Ejemplo: `.parti Tokyo`');
        }

        // Limpiamos el nombre de cualquier comando que se haya colado
        const nombreLimpio = textoUsuario
          .replace(/^[.\/!#]?(parti|participacion)\s*/i, '')
          .trim();

        // Registramos al usuario SIN corazones
        usuarioRegistrado = {
          id: usuarioId,
          nombre: nombreLimpio,
          corazones: [],
          fechaRegistro: ahora.toISOString()
        };
        registros.push(usuarioRegistrado);

        await db.updateChat(msg.chat, dbKey, registros);

        return msg.reply(`✅ *${nombreLimpio}* ha sido registrada.\n\nAhora cada vez que asistas, escribe \`.parti 💙\` (con el corazón del día) para sumar tu asistencia.`);
      }

      // ============================================================
      // CASO 2: YA ESTÁ REGISTRADA
      // ============================================================

      // 2A. Si puso un corazón → Es una ASISTENCIA
      if (corazonEncontrado) {
        usuarioRegistrado.corazones.push(corazonEncontrado);
        await db.updateChat(msg.chat, dbKey, registros);
      }
      // 2B. Si NO puso corazón pero escribió algo → Quiere cambiar su nombre
      else if (textoUsuario) {
        const nombreLimpio = textoUsuario
          .replace(/^[.\/!#]?(parti|participacion)\s*/i, '')
          .trim();
        
        usuarioRegistrado.nombre = nombreLimpio;
        await db.updateChat(msg.chat, dbKey, registros);
      }
      // 2C. Si NO puso corazón ni texto → Le pedimos el corazón
      else {
        return msg.reply(`❌ *${usuarioRegistrado.nombre}*, debes poner el corazón del día que asististe.\n\n*Ejemplo:* \`.parti 💙\` (Lunes), \`.parti 🩷\` (Martes), etc.`);
      }

      // 7. Construimos la lista
      let listaParticipantes = '';
      for (const reg of registros) {
        // ✅ Limpiamos cualquier comando que se haya guardado por error
        const nombreLimpio = reg.nombre
          .replace(/^[.\/!#]?(parti|participacion)\s*/i, '')
          .trim();
        
        const corazones = reg.corazones.length > 0 
          ? reg.corazones.join(' ') 
          : '⏳';
        
        listaParticipantes += `┈ꕤ // ${nombreLimpio} ║ ${corazones}\n`;
      }

      const participacionMsg = `‧₊ ᵎᵎ 𖤓 𝗣𝗮𝗿𝘁𝗶𝗰𝗶𝗽𝗮𝗰𝗶𝗼𝗻 𝘀𝗲𝗺𝗮𝗻𝗮𝗹
ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ ╴╴╴╴╴ꕤ

─⋆ Mvρ 🍯
─⋆ Pᥲrtιᥴιρᥲᥴιoᥒ
ㅤ.₊‧ʚɞ‧₊Sᥱmᥲᥒᥲ
𝗟💙/𝗠🩷/𝗠💜/𝗝💛/𝗩💚/𝗦❤️

⌢.⌢.⌢.꒰⌢୨୧⌢꒱.⌢.⌢.⌢

─˖Ი𐑼⋆˚𝑷𝒓𝒊𝒏𝒄𝒆𝒔𝒊𝒕𝒂𝒔
${listaParticipantes}
*Total de participantes:* ${registros.length}`;

      // 8. Enviamos el mensaje
      await sock.sendMessage(msg.chat, { text: participacionMsg.trim() }, { quoted: msg });

    } catch (e) {
      console.error("❌ [ERROR CRÍTICO] Fallo en el comando parti:");
      console.error("   - Mensaje de error:", e.message);
      console.error("   - Stack trace:", e.stack);
      
      msg.reply('❌ Ocurrió un error al procesar la participación.');
    }
  },
};
