import db from "#db"

// ✅ Límite de usos por día
const LIMITE_USOS_DIA = 3;

// ✅ Tiempo de cuenta regresiva (en segundos)
const TIEMPO_CUENTA = 5;

export default {
  command: ['ruletaban', 'kickrandom', 'rban'],
  category: 'grupo',
  isAdmin: true,
  botAdmin: true,
  run: async ({ msg, sock, groupMetadata, participants }) => {
    try {
      if (!msg.isGroup) {
        return msg.reply('《✤》 Este comando solo funciona en grupos.');
      }

      const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
      const botNum = botId.split('@')[0];
      const botSettings = await db.getSettings(botId);

      // ✅ Verificamos que tengamos los participantes
      if (!participants || participants.length === 0) {
        return msg.reply('❌ No se pudo obtener la lista de participantes.');
      }

      // ============================================================
      // ✅ 1. VERIFICAR LÍMITE DE USOS POR DÍA
      // ============================================================
      const ahora = new Date();
      const fechaHoy = `${ahora.getFullYear()}-${(ahora.getMonth() + 1).toString().padStart(2, '0')}-${ahora.getDate().toString().padStart(2, '0')}`;
      
      const chatData = await db.getChat(msg.chat);
      const ruletaStats = chatData.ruletaStats || { fecha: fechaHoy, usos: 0 };

      // Si es un día nuevo, reiniciamos el contador
      if (ruletaStats.fecha !== fechaHoy) {
        ruletaStats.fecha = fechaHoy;
        ruletaStats.usos = 0;
      }

      if (ruletaStats.usos >= LIMITE_USOS_DIA) {
        return msg.reply(`⚠️ *Límite alcanzado*

> Ya se usó la ruleta *${ruletaStats.usos}/${LIMITE_USOS_DIA}* veces hoy.
> Vuelve a intentarlo mañana.`);
      }

      // ============================================================
      // ✅ 2. LISTA DE OWNERS (no se pueden eliminar)
      // ============================================================
      const ownersGlobales = (global.owner || []).map(num => num + '@s.whatsapp.net');
      const ownerBot = botSettings.owner ? [botSettings.owner] : [];
      const todosLosOwners = [...ownersGlobales, ...ownerBot];

      // ============================================================
      // ✅ 3. FILTRAR USUARIOS ELEGIBLES
      // ============================================================
      const admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');

      const eligibleUsers = participants.filter(p => {
        const isAdmin = p.admin === 'admin' || p.admin === 'superadmin';
        const id = p.jid || p.id || p.lid || '';
        const num = id.split('@')[0].split(':')[0];
        const isBot = num === botNum;
        
        // ✅ Verificar si es owner
        const esOwner = todosLosOwners.some(owner => {
          const ownerNum = owner.split('@')[0];
          return num === ownerNum;
        });

        // ✅ No es admin, no es bot, no es owner
        return !isAdmin && !isBot && !esOwner;
      });

      if (eligibleUsers.length === 0) {
        return msg.reply('⚠️ *No hay miembros elegibles para eliminar.*\n\n> Todos son administradores, owners o solo está el bot.');
      }

      if (participants.length === admins.length) {
        return msg.reply('⚠️ *Solo hay administradores en este grupo.*');
      }

      // ============================================================
      // ✅ 4. ELEGIR USUARIO AL AZAR
      // ============================================================
      const randomUser = eligibleUsers[Math.floor(Math.random() * eligibleUsers.length)];
      const randomId = randomUser.jid || randomUser.id || randomUser.lid;
      const randomNum = randomId.split('@')[0].split(':')[0];

      // ✅ Obtenemos el nombre del usuario
      let tag = randomNum;
      try {
        const participante = groupMetadata.participants.find(
          p => (p.jid || p.id || p.lid)?.split('@')[0] === randomNum
        );
        if (participante?.notify) {
          tag = participante.notify;
        } else if (participante?.name) {
          tag = participante.name;
        }
      } catch (e) {
        console.log('Error obteniendo nombre:', e.message);
      }

      // ============================================================
      // ✅ 5. MENSAJE CON CUENTA REGRESIVA
      // ============================================================
      const mensajeInicial = await sock.sendMessage(msg.chat, {
        text: `🎰 *RULETA RUSA* 🎰

> 👤 *Usuario seleccionado:* @${randomNum}
> ⏳ *Será eliminado en ${TIEMPO_CUENTA} segundos...*
> 💡 *Envía \`cancelar\` para detenerlo.*

> 📊 *Uso:* ${ruletaStats.usos + 1}/${LIMITE_USOS_DIA} hoy`,
        mentions: [randomId]
      }, { quoted: msg });

      // ✅ Guardamos el ID del mensaje para verificar la cancelación
      const mensajeId = mensajeInicial.key.id;

      // ✅ Estado temporal para detectar cancelación
      global.ruletasActivas = global.ruletasActivas || {};
      global.ruletasActivas[msg.chat] = {
        cancelado: false,
        usuarioId: randomId,
        usuarioTag: tag,
        mensajeId: mensajeId,
        iniciado: Date.now()
      };

      // ✅ Esperamos el tiempo de cuenta regresiva
      await new Promise(res => setTimeout(res, TIEMPO_CUENTA * 1000));

      // ✅ Verificamos si se canceló
      const estado = global.ruletasActivas[msg.chat];
      
      if (!estado || estado.cancelado) {
        delete global.ruletasActivas[msg.chat];
        return; // Se canceló, no hacemos nada
      }

      // ✅ Verificamos si sigue siendo el mismo usuario
      if (estado.usuarioId !== randomId) {
        return; // Otro proceso lo cambió
      }

      // ============================================================
      // ✅ 6. ELIMINAR USUARIO
      // ============================================================
      try {
        await sock.groupParticipantsUpdate(msg.chat, [randomId], 'remove');

        // ✅ Actualizamos el contador de usos
        ruletaStats.usos++;
        await db.updateChat(msg.chat, 'ruletaStats', ruletaStats);

        await sock.sendMessage(msg.chat, {
          text: `🌵 *${tag}* fue eliminado con éxito.

> 📊 *Uso:* ${ruletaStats.usos}/${LIMITE_USOS_DIA} hoy`,
          mentions: [randomId]
        }, { quoted: msg });

        // ✅ Reacción de éxito
        try {
          await sock.sendMessage(msg.chat, { react: { text: '✅', key: msg.key } });
        } catch {}

      } catch (e) {
        console.error('❌ [RULETA] Error al eliminar:', e.message);

        await msg.reply(`✖️ No se pudo eliminar a *${tag}*.\n> Error: ${e.message}`);

        try {
          await sock.sendMessage(msg.chat, { react: { text: '✖️', key: msg.key } });
        } catch {}
      }

      // ✅ Limpiamos el estado
      delete global.ruletasActivas[msg.chat];

    } catch (e) {
      console.error('❌ [RULETA ERROR]:', e.message);
      msg.reply('❌ Ocurrió un error al ejecutar la ruleta.');
    }
  },
};
