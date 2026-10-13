import db from "#db"

export default {
  command: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'],
  category: 'grupo',
  botAdmin: true,
  run: async ({ msg, sock, command }) => {
    console.log("========================================");
    console.log(`🔍 [DEBUG] Comando '${command}' ejecutado.`);
    console.log("========================================");

    try {
      // 1. Verificamos que sea un grupo
      if (!msg.isGroup) {
        return msg.reply('《✤》 Este comando solo funciona en grupos.');
      }

      // 2. Normalizamos el nombre del día (por si escriben "miércoles" con tilde)
      const diasValidos = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
      const dia = command.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

      if (!diasValidos.includes(dia)) {
        return msg.reply('❌ Día no válido.');
      }

      // 3. Emojis por día
      const emojiDia = {
        lunes: '🍯',
        martes: '🍒',
        miercoles: '🪩',
        jueves: '👯‍♀️',
        viernes: '🏹',
        sabado: '🌈'
      };

      const nombreDia = {
        lunes: 'Lunes',
        martes: 'Martes',
        miercoles: 'Miércoles',
        jueves: 'Jueves',
        viernes: 'Viernes',
        sabado: 'Sábado'
      };

      // 4. Obtenemos menciones del mensaje
      const menciones = msg.mentionedJid || msg.mentions || [];

      // 5. Leemos la configuración del chat
      const chatData = await db.getChat(msg.chat);
      const dbKey = `sorteos_${dia}`;
      let usuariosGuardados = chatData[dbKey] || [];

      // ============================================================
      // CASO 1: HAY MENCIONES → GUARDAR LOS USUARIOS
      // ============================================================
      if (menciones.length > 0) {
        // Guardamos los IDs de los usuarios mencionados
        const nuevosUsuarios = menciones.map(jid => jid.split('@')[0]);

        // Los guardamos (sin duplicados)
        const usuariosUnicos = [...new Set([...usuariosGuardados, ...nuevosUsuarios])];

        await db.updateChat(msg.chat, dbKey, usuariosUnicos);

        // Construimos la lista de menciones para el mensaje
        const listaMenciones = nuevosUsuarios.map(u => `@${u}`).join(' ');
        const mentionsFinal = nuevosUsuarios.map(u => u + '@s.whatsapp.net');

        await sock.sendMessage(msg.chat, {
          text: `✅ *Se guardaron ${nuevosUsuarios.length} usuarios para el sorteo de ${emojiDia[dia]} ${nombreDia[dia]}*\n\n> 👥 Total en la lista: ${usuariosUnicos.length} usuarios\n\n*Usuarios agregados:*\n${listaMenciones}`,
          mentions: mentionsFinal
        }, { quoted: msg });

        return;
      }

      // ============================================================
      // CASO 2: NO HAY MENCIONES → ETIQUETAR A LOS GUARDADOS
      // ============================================================
      if (usuariosGuardados.length === 0) {
        return msg.reply(`⚠️ *No hay usuarios guardados para el sorteo de ${emojiDia[dia]} ${nombreDia[dia]}.*\n\n> Un admin debe agregar usuarios primero.\n> *Ejemplo:* \`.${dia} @usuario1 @usuario2\``);
      }

      // Construimos las menciones
      const mentionsFinal = usuariosGuardados.map(u => u + '@s.whatsapp.net');
      const listaEtiquetas = usuariosGuardados.map(u => `@${u}`).join('\n');

      const mensajeSorteo = `🎲 *SORTEO DE ${emojiDia[dia]} ${nombreDia[dia].toUpperCase()}*

> 👥 *Usuarios participantes:* ${usuariosGuardados.length}

${listaEtiquetas}

> ✨ ¡Buena suerte a todos!`;

      await sock.sendMessage(msg.chat, {
        text: mensajeSorteo,
        mentions: mentionsFinal
      }, { quoted: msg });

    } catch (e) {
      console.error(`❌ [ERROR CRÍTICO] Fallo en el comando ${command}:`);
      console.error("   - Mensaje de error:", e.message);
      console.error("   - Stack trace:", e.stack);
      
      msg.reply('❌ Ocurrió un error al procesar el comando.');
    }
  },
};
