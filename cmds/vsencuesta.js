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

*📋 Formatos válidos:*

*Opción 1:* Separar con \`|\`
\`.vsencuesta texto1 | texto2 | texto3\`

*Opción 2:* Separar con \`;\`
\`.vsencuesta texto1 ; texto2 ; texto3\`

*Opción 3:* Separar con saltos de línea (uno por uno)
\`.vsencuesta
texto1
texto2
texto3\`

*📌 Ejemplo:*
\`.vsencuesta 𝙑𝙚𝙧𝙨𝙪𝙨 : Mixto / ⤷ by moviles / ⏳01🇦🇷 / ᯓ𝙍𝙞𝙫𝙖𝙡 : @blazinglegacy.fem | 𝙑𝙚𝙧𝙨𝙪𝙨 : Mixto / ⤷ by moviles / ⏳01🇦🇷 / ᯓ𝙍𝙞𝙫𝙖𝙡 : @blazinglegacy.fem\`

> ⚠️ *Cada bloque crea UNA encuesta diferente.*`;

        return msg.reply(instrucciones);
      }

      // ✅ Detección de bloques con MÚLTIPLES separadores
      let bloques = [];

      // 1. Si contiene "|" lo usamos como separador principal
      if (contenido.includes('|')) {
        bloques = contenido.split('|');
      }
      // 2. Si contiene ";" lo usamos como separador
      else if (contenido.includes(';')) {
        bloques = contenido.split(';');
      }
      // 3. Si contiene saltos de línea (2 o más), los usamos
      else if (contenido.split('\n').length > 1) {
        // Agrupamos cada 2-3 líneas como un bloque (por si el usuario escribe uno por línea)
        const lineas = contenido.split('\n').map(l => l.trim()).filter(l => l !== '');
        bloques = lineas;
      }
      // 4. Si nada funciona, tomamos todo como 1 solo bloque
      else {
        bloques = [contenido];
      }

      // Limpiamos bloques
      bloques = bloques
        .map(b => b.trim())
        .filter(b => b !== '');

      if (bloques.length === 0) {
        return msg.reply('❌ No se detectaron bloques de encuesta.');
      }

      console.log(`📊 [VSENCUESTA] ${bloques.length} bloque(s) detectado(s)`);
      bloques.forEach((b, i) => {
        console.log(`   Bloque ${i + 1}:`, b.slice(0, 80) + (b.length > 80 ? '...' : ''));
      });

      let enviadas = 0;

      for (let i = 0; i < bloques.length; i++) {
        const bloque = bloques[i];

        // ✅ Formateamos el bloque: reemplazamos "/" por saltos de línea
        const textoFormateado = bloque
          .split('/')
          .map(linea => linea.trim())
          .filter(linea => linea !== '')
          .join('\n');

        if (!textoFormateado) {
          console.log(`⚠️ [VSENCUESTA] Bloque ${i + 1} vacío, saltando...`);
          continue;
        }

        console.log(`📤 [VSENCUESTA] Enviando encuesta ${i + 1}:`, textoFormateado.slice(0, 100));

        try {
          await sock.sendMessage(msg.chat, {
            poll: {
              name: textoFormateado,
              values: ['✅ Sí', '❌ No', '🤔 Tal vez'],
              selectableCount: 1
            }
          });

          enviadas++;
          console.log(`✅ [VSENCUESTA] Encuesta ${i + 1} enviada correctamente`);

          // Pausa entre encuestas
          if (i < bloques.length - 1) {
            await new Promise(res => setTimeout(res, 2000));
          }

        } catch (err) {
          console.error(`❌ [VSENCUESTA] Error en encuesta ${i + 1}:`, err.message);
        }
      }

      await msg.reply(`✅ *Encuestas enviadas*

> 📊 Total enviadas: ${enviadas} de ${bloques.length}`);

    } catch (e) {
      console.error("❌ [VSENCUESTA ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al enviar las encuestas.');
    }
  },
};
