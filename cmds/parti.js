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

      // 2. Extraemos el nombre del usuario
      let textoCompleto = msg.text || msg.body || '';
      const textoUsuario = textoCompleto
        .replace(/^[.\/!#]?(parti|participacion)\s*/i, '')
        .trim();

      if (!textoUsuario) {
        return msg.reply('❌ Debes escribir tu nombre. Ejemplo: `.parti Tokyo 💜`');
      }

      // 3. Obtenemos la fecha de hoy para saber en qué semana estamos
      const ahora = new Date();
      const año = ahora.getFullYear();
      // Cálculo de la semana del año
      const inicioAño = new Date(año, 0, 1);
      const diasTranscurridos = Math.floor((ahora - inicioAño) / 86400000);
      const semana = Math.ceil((diasTranscurridos + inicioAño.getDay() + 1) / 7);

      // 4. Leemos la configuración del chat (aquí guardaremos la participación)
      const chatData = await db.getChat(msg.chat);
      
      // La clave donde guardaremos los datos de esta semana
      const dbKey = `participacion_semana_${año}_${semana}`;
      
      // Si no existe la lista, la creamos vacía
      let registros = chatData[dbKey] || [];

      // 5. Verificamos si el usuario ya está anotado
      const usuarioId = msg.sender.split('@')[0];
      const yaAnotado = registros.find(r => r.id === usuarioId);

      if (yaAnotado) {
        return msg.reply(`⚠️ Ya estás anotado en la participación de esta semana, *${yaAnotado.nombre}*.`);
      }

      // 6. Agregamos el nuevo registro
      registros.push({
        id: usuarioId,
        nombre: textoUsuario,
        fecha: ahora.toISOString()
      });

      // 7. Guardamos en la base de datos del chat
      await db.updateChat(msg.chat, dbKey, registros);

      // 8. Construimos el mensaje con todos los registros
      let listaParticipantes = '';
      for (const reg of registros) {
        listaParticipantes += `┈ꕤ // ${reg.nombre}\n`;
      }

      const participacionMsg = `‧₊ ᵎᵎ 𖤓🏹 𝗣𝗮𝗿𝘁𝗶𝗰𝗶𝗽𝗮𝗰𝗶𝗼𝗻 𝘀𝗲𝗺𝗮𝗻𝗮𝗹

ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ ╴╴╴╴╴ꕤ

᭝ ᨳଓ ՟  Mvρ 🍒
᭝ ᨳଓ ՟  Pᥲrtιᥴιρᥲᥴιoᥒ
𝗟💙/𝗠🩷/𝗠💜/𝗝💛/𝗩💚/𝗦❤️

˙ . ꒷  ᨳ𐔌՞֊ ˕ ֊՞𐦯ᜊ  . 𖦹˙—

─˖Ი𐑼⋆🌈 𝑷𝒓𝒊𝒏𝒄𝒆𝒔𝒊𝒕𝒂𝒔
${listaParticipantes}
*Total de participantes:* ${registros.length}`;

      // 9. Enviamos el mensaje
      await sock.sendMessage(msg.chat, { text: participacionMsg.trim() }, { quoted: msg });

    } catch (e) {
      console.error("❌ [ERROR CRÍTICO] Fallo en el comando parti:");
      console.error("   - Mensaje de error:", e.message);
      console.error("   - Stack trace:", e.stack);
      
      msg.reply('❌ Ocurrió un error al procesar la participación.');
    }
  },
};
