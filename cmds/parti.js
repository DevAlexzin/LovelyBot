import db from "#db"

// Emojis por día de la semana (Domingo=0, Lunes=1, ... Sábado=6)
const EMOJIS_DIAS = {
  1: '💙', // Lunes
  2: '🩷', // Martes
  3: '💜', // Miércoles
  4: '💛', // Jueves
  5: '💚', // Viernes
  6: '❤️'  // Sábado
}

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

      // 2. Extraemos el nombre del usuario
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
      
      // Día de la semana actual (0=Domingo, 1=Lunes, ... 6=Sábado)
      const diaSemana = ahora.getDay();
      const emojiDia = EMOJIS_DIAS[diaSemana];

      // 4. Si es Domingo, no hay participación
      if (!emojiDia) {
        return msg.reply('⚠️ Hoy es Domingo, no hay participación. Vuelve el Lunes 💙');
      }

      // 5. Leemos la configuración del chat
      const chatData = await db.getChat(msg.chat);
      const dbKey = `participacion_semana_${año}_${semana}`;
      let registros = chatData[dbKey] || [];

      // 6. Buscamos si el usuario ya está registrado
      const usuarioId = msg.sender.split('@')[0];
      let usuarioRegistrado = registros.find(r => r.id === usuarioId);

      // 7. Si no está registrado, lo registramos
      if (!usuarioRegistrado) {
        if (!textoUsuario) {
          return msg.reply('❌ Debes registrarte primero. Ejemplo: `.parti Tokyo 💜`');
        }

        usuarioRegistrado = {
          id: usuarioId,
          nombre: textoUsuario,
          corazones: [],
          fechaRegistro: ahora.toISOString()
        };
        registros.push(usuarioRegistrado);
      }

      // 8. ✅ Agregamos el corazón SIN LÍMITE (siempre se agrega uno nuevo)
      usuarioRegistrado.corazones.push(emojiDia);

      // 9. Guardamos en la base de datos
      await db.updateChat(msg.chat, dbKey, registros);

      // 10. Construimos la lista
      let listaParticipantes = '';
      for (const reg of registros) {
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

      // 11. Enviamos el mensaje
      await sock.sendMessage(msg.chat, { text: participacionMsg.trim() }, { quoted: msg });

    } catch (e) {
      console.error("❌ [ERROR CRÍTICO] Fallo en el comando parti:");
      console.error("   - Mensaje de error:", e.message);
      console.error("   - Stack trace:", e.stack);
      
      msg.reply('❌ Ocurrió un error al procesar la participación.');
    }
  },
};
