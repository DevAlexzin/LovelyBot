import db from "#db"

// ============================================================
// SISTEMA DE AVISOS DE COMPETENCIAS PROGRAMADAS
// ============================================================
export function iniciarCompeChecker(sock) {
  console.log('🎲 [COMPE CHECKER] Sistema de avisos iniciado.');

  // Verificamos cada 60 segundos (1 minuto)
  setInterval(async () => {
    try {
      const ahora = new Date();
      
      // Obtenemos todos los chats con competencias programadas
      const todosLosChats = await db.getChat();
      
      for (const chatData of todosLosChats) {
        const compesProgramadas = chatData.compes_programadas || [];
        
        if (compesProgramadas.length === 0) continue;

        let huboCambios = false;
        const compesRestantes = [];

        for (const compe of compesProgramadas) {
          const horaAviso = new Date(compe.horaAviso);
          const horaCompe = new Date(compe.horaCompe);

          // Diferencia en minutos
          const diffAviso = (horaAviso - ahora) / 1000 / 60;
          const diffCompe = (horaCompe - ahora) / 1000 / 60;

          // ✅ Si ya pasó la hora de la competencia por más de 5 minutos, la eliminamos
          if (diffCompe < -5) {
            huboCambios = true;
            continue;
          }

          // ✅ Si es la hora del aviso (dentro del minuto actual), enviamos la alerta
          if (diffAviso <= 0 && diffAviso > -1) {
            console.log(`🔔 [COMPE] Enviando aviso para el chat ${chatData.id}`);

            const mentionsFinal = compe.jugadoras.map(j => j + '@s.whatsapp.net');
            const listaJugadoras = compe.jugadoras.map(j => `@${j}`).join('\n');

            const horaFormateada = horaCompe.toLocaleString('es-ES', {
              hour: '2-digit',
              minute: '2-digit'
            });

            const mensajeAviso = `🔔 *¡COMPETENCIA EN 10 MINUTOS!*

> ⏰ *Hora de la competencia:* ${horaFormateada}
> 👥 *Jugadoras:*
${listaJugadoras}

> 🎮 ¡Preparadas para la competencia!`;

            try {
              await sock.sendMessage(chatData.id, {
                text: mensajeAviso,
                mentions: mentionsFinal
              });
            } catch (err) {
              console.error(`❌ Error enviando aviso a ${chatData.id}:`, err.message);
            }
          }

          compesRestantes.push(compe);
        }

        // Si hubo cambios, actualizamos la base de datos
        if (huboCambios) {
          await db.updateChat(chatData.id, 'compes_programadas', compesRestantes);
        }
      }
    } catch (e) {
      console.error('❌ [COMPE CHECKER] Error:', e.message);
    }
  }, 60 * 1000); // Cada 60 segundos
}
