import db from "#db"

export default {
  command: ['sortemove', 'moverdia', 'cambiardia'],
  category: 'grupo',
  isAdmin: true,
  botAdmin: false,
  run: async ({ msg, sock }) => {
    try {
      if (!msg.isGroup) {
        return msg.reply('《✤》 Este comando solo funciona en grupos.');
      }

      const textoCompleto = msg.text || msg.body || '';
      const textoLimpio = textoCompleto
        .replace(/^[.\/!#]?(sortemove|moverdia|cambiardia)\s*/i, '')
        .trim();

      // Formato esperado: lunes martes @usuario
      // O también: lunes @usuario martes
      
      const menciones = msg.mentionedJid || msg.mentions || [];

      if (menciones.length === 0) {
        return msg.reply(`❌ Debes mencionar a alguien.\n\n*Ejemplo:* \`.sortemove lunes martes @usuario\`\n> (Mueve al usuario del lunes al martes)`);
      }

      // Extraemos las palabras del texto
      const palabras = textoLimpio.split(/\s+/);
      
      // Buscamos los días en el texto
      const diasValidos = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
      const diasEncontrados = palabras
        .map(p => p.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase())
        .filter(p => diasValidos.includes(p));

      if (diasEncontrados.length < 2) {
        return msg.reply(`❌ Debes especificar el día de origen y el día de destino.\n\n*Ejemplo:* \`.sortemove lunes martes @usuario\`\n> (Mueve al usuario del lunes al martes)`);
      }

      const diaOrigen = diasEncontrados[0];
      const diaDestino = diasEncontrados[1];

      if (diaOrigen === diaDestino) {
        return msg.reply('❌ El día de origen y destino no pueden ser el mismo.');
      }

      const usuarioId = menciones[0].split('@')[0];

      const chatData = await db.getChat(msg.chat);
      
      // Verificamos si el usuario está en el día de origen
      const dbKeyOrigen = `sorteos_${diaOrigen}`;
      let usuariosOrigen = chatData[dbKeyOrigen] || [];

      if (!usuariosOrigen.includes(usuarioId)) {
        return msg.reply(`⚠️ El usuario no está en la lista de ${diaOrigen}.`);
      }

      // Lo quitamos del origen
      usuariosOrigen = usuariosOrigen.filter(u => u !== usuarioId);
      await db.updateChat(msg.chat, dbKeyOrigen, usuariosOrigen);

      // Lo agregamos al destino
      const dbKeyDestino = `sorteos_${diaDestino}`;
      let usuariosDestino = chatData[dbKeyDestino] || [];
      
      if (!usuariosDestino.includes(usuarioId)) {
        usuariosDestino.push(usuarioId);
        await db.updateChat(msg.chat, dbKeyDestino, usuariosDestino);
      }

      const emojiDia = {
        lunes: '🍯', martes: '🍒', miercoles: '🪩',
        jueves: '👯‍♀️', viernes: '🏹', sabado: '🌈'
      };

      await sock.sendMessage(msg.chat, {
        text: `✅ *Usuario movido correctamente*

> 👤 @${usuarioId}
> 📅 De: ${emojiDia[diaOrigen]} ${diaOrigen.charAt(0).toUpperCase() + diaOrigen.slice(1)}
> 📅 A: ${emojiDia[diaDestino]} ${diaDestino.charAt(0).toUpperCase() + diaDestino.slice(1)}`,
        mentions: [usuarioId + '@s.whatsapp.net']
      }, { quoted: msg });

    } catch (e) {
      console.error(`❌ Error en sortemove:`, e.message);
      msg.reply('❌ Ocurrió un error al procesar el comando.');
    }
  },
};
