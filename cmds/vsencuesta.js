import db from "#db"

export default {
  command: ['vsencuesta', 'encuesta', 'encuestas'],
  category: 'grupo',
  isAdmin: true,
  botAdmin: false,
  run: async ({ msg, sock }) => {
    console.log("========================================");
    console.log("🔍 [DEBUG] Comando 'vsencuesta' ejecutado.");
    console.log("========================================");

    try {
      if (!msg.isGroup) {
        return msg.reply('《✤》 Este comando solo funciona en grupos.');
      }

      let textoCompleto = msg.text || msg.body || '';
      let contenido = textoCompleto
        .replace(/^[.\/!#]?(vsencuesta|encuesta|encuestas)\s*/i, '')
        .trim();

      if (!contenido) {
        const instrucciones = `📊 *Encuestas de Versus*

*📋 Formato:*
\`.vsencuesta [opciones] texto | [opciones] texto2\`

*📌 Ejemplos:*

*Con opciones personalizadas:*
\`.vsencuesta [Sí,No] ¿Te gusta el versus?\`

*Múltiples encuestas con opciones diferentes:*
\`.vsencuesta [Azul,Rosa,Morado] ¿Qué color? | [A,B,C,D] ¿Qué equipo?\`

*Sin opciones (usa las por defecto):*
\`.vsencuesta ¿Te gusta el versus?\`

*📝 Notas:*
> • Las opciones van entre \`[ ]\` separadas por coma
> • Cada encuesta se separa con \`|\`
> • Si no pones opciones, usa: ✅ Sí / ❌ No / 🤔 Tal vez`;

        return msg.reply(instrucciones);
      }

      // ✅ Detección de bloques con MÚLTIPLES separadores
      let bloques = [];

      if (contenido.includes('|')) {
        bloques = contenido.split('|');
      }
      else if (contenido.includes(';')) {
        bloques = contenido.split(';');
      }
      else if (contenido.split('\n').length > 1) {
        bloques = contenido.split('\n').map(l => l.trim()).filter(l => l !== '');
      }
      else {
        bloques = [contenido];
      }

      bloques = bloques.map(b => b.trim()).filter(b => b !== '');

      if (bloques.length === 0) {
        return msg.reply('❌ No se detectaron bloques de encuesta.');
      }

      console.log(`📊 [VSENCUESTA] ${bloques.length} bloque(s) detectado(s)`);

      let enviadas = 0;

      for (let i = 0; i < bloques.length; i++) {
        let bloque = bloques[i];

        // ✅ Buscamos opciones personalizadas entre [...]
        let opciones = null;
        const matchOpciones = bloque.match(/^\[([^\]]+)\]\s*/);

        if (matchOpciones) {
          // Extraemos las opciones
          opciones = matchOpciones[1]
            .split(',')
            .map(op => op.trim())
            .filter(op => op !== '');

          // Quitamos las opciones del texto
          bloque = bloque.replace(/^\[([^\]]+)\]\s*/, '').trim();
        }

        // ✅ Si no hay opciones personalizadas, usamos las por defecto
        if (!opciones || opciones.length === 0) {
          opciones = ['✅ Sí', '❌ No', '🤔 Tal vez'];
        }

        // ✅ Formateamos el texto del bloque
        const textoFormateado = bloque
          .split('/')
          .map(linea => linea.trim())
          .filter(linea => linea !== '')
          .join('\n');

        if (!textoFormateado) {
          console.log(`⚠️ [VSENCUESTA] Bloque ${i + 1} vacío, saltando...`);
          continue;
        }

        console.log(`📤 [VSENCUESTA] Encuesta ${i + 1}:`);
        console.log(`   Texto: ${textoFormateado.slice(0, 100)}`);
        console.log(`   Opciones: ${opciones.join(' | ')}`);

        try {
          await sock.sendMessage(msg.chat, {
            poll: {
              name: textoFormateado,
              values: opciones,
              selectableCount: 1
            }
          });

          enviadas++;
          console.log(`✅ [VSENCUESTA] Encuesta ${i + 1} enviada`);

          if (i < bloques.length - 1) {
            await new Promise(res => setTimeout(res, 2000));
          }

        } catch (err) {
          console.error(`❌ [VSENCUESTA] Error en encuesta ${i + 1}:`, err.message);
        }
      }

      await msg.reply(`✅ *Encuestas enviadas*

> 📊 Total: ${enviadas} de ${bloques.length}`);

    } catch (e) {
      console.error("❌ [VSENCUESTA ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al enviar las encuestas.');
    }
  },
};
