import db from "#db"

export default {
  command: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'],
  category: 'grupo',
  botAdmin: true,
  run: async ({ msg, sock, command, groupMetadata, participants }) => {
    try {
      if (!msg.isGroup) {
        return msg.reply('《✤》 Este comando solo funciona en grupos.');
      }

      const diasValidos = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
      const dia = command.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

      if (!diasValidos.includes(dia)) {
        return msg.reply('❌ Día no válido.');
      }

      const emojiDia = {
        lunes: '🍯', martes: '🍒', miercoles: '🪩',
        jueves: '👯‍♀️', viernes: '🏹', sabado: '🌈'
      };

      const nombreDia = {
        lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles',
        jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado'
      };

      // Obtenemos menciones
      const menciones = msg.mentionedJid || msg.mentions || [];

      // Leemos la configuración del chat
      const chatData = await db.getChat(msg.chat);
      const dbKey = `sorteos_${dia}`;
      let usuariosGuardados = chatData[dbKey] || [];

      // ============================================================
      // ✅ AUTO-DETECCIÓN: Verificamos quiénes siguen en el grupo
      // ============================================================
      if (groupMetadata && participants.length > 0) {
        // Obtenemos todos los IDs válidos del grupo
        const idsValidos = new Set(
          participants.flatMap(p => [
            p.id?.split('@')[0],
            p.lid?.split('@')[0],
            p.phoneNumber?.split('@')[0]
          ].filter(Boolean))
        );

        // Filtramos la lista: solo dejamos a los que siguen en el grupo
        const usuariosActualizados = usuariosGuardados.filter(u => idsValidos.has(u));

        // Si hubo cambios, guardamos
        if (usuariosActualizados.length !== usuariosGuardados.length) {
          const eliminados = usuariosGuardados.length - usuariosActualizados.length;
          console.log(`🧹 [SORTEOS] Se eliminaron ${eliminados} usuarios que ya no están en el grupo.`);
          
          usuariosGuardados = usuariosActualizados;
          await db.updateChat(msg.chat, dbKey, usuariosGuardados);
        }
      }

      // ============================================================
      // CASO 1: HAY MENCIONES → GUARDAR LOS USUARIOS
      // ============================================================
      if (menciones.length > 0) {
        const nuevosUsuarios = menciones.map(jid => jid.split('@')[0]);
        const usuariosUnicos = [...new Set([...usuariosGuardados, ...nuevosUsuarios])];

        await db.updateChat(msg.chat, dbKey, usuariosUnicos);

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
      console.error(`❌ Error en sorteo ${command}:`, e.message);
      msg.reply('❌ Ocurrió un error al procesar el comando.');
    }
  },
};
