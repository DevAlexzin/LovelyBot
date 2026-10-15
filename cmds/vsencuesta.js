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

      // 1. Extraemos el texto completo (después del comando)
      let textoCompleto = msg.text || msg.body || '';
      let contenido = textoCompleto
        .replace(/^[.\/!#]?(vsencuesta|encuesta|encuestas)\s*/i, '')
        .trim();

      // 2. Si no hay contenido, mostrar instrucciones
      if (!contenido) {
        const instrucciones = `📊 *Encuestas de Versus*

*📋 Formato:*
\`.vsencuesta texto1 | texto2 | texto3\`

*📌 Ejemplo:*
\`.vsencuesta 𝙑𝙚𝙧𝙨𝙪𝙨 : Mixto / ⤷ by moviles / ⏳01🇦🇷 00🇧🇴 23🇵🇪 / ᯓ𝙍𝙞𝙫𝙖𝙡 : @blazinglegacy.fem | 𝙑𝙚𝙧𝙨𝙪𝙨 : Mixto / ⤷ by moviles / ⏳01🇦🇷 00🇧🇴 23🇵🇪 / ᯓ𝙍𝙞𝙫𝙖𝙡 : @blazinglegacy.fem\`

*📝 Instrucciones:*
> Separa cada encuesta con el símbolo \`|\`
> Separa cada línea con el símbolo \`/\`
> El bot creará una encuesta por cada bloque.`;

        return msg.reply(instrucciones);
      }

      // 3. Separamos en bloques por "|"
      const bloques = contenido.split('|').map(b => b.trim()).filter(b => b !== '');

      if (bloques.length === 0) {
        return msg.reply('❌ No se detectaron bloques de encuesta.');
      }

      console.log(`📊 [VSENCUESTA] ${bloques.length} bloque(s) detectado(s)`);

      // 4. Enviamos una encuesta por cada bloque
      let enviadas = 0;

      for (let i = 0; i < bloques.length; i++) {
        const bloque = bloques[i];

        // Reemplazamos "/" por saltos de línea para el mensaje final
        const textoFormateado = bloque
          .split('/')
          .map(linea => linea.trim())
          .filter(linea => linea !== '')
          .join('\n');

        // 5. Enviamos como encuesta de WhatsApp
        try {
          await sock.sendMessage(msg.chat, {
            poll: {
              name: textoFormateado,
              values: ['✅ Sí', '❌ No', '🤔 Tal vez'],
              selectableCount: 1
            }
          });

          enviadas++;
          console.log(`✅ [VSENCUESTA] Encuesta ${i + 1} enviada`);

          // Pausa de 2 segundos entre encuestas para evitar spam
          if (i < bloques.length - 1) {
            await new Promise(res => setTimeout(res, 2000));
          }

        } catch (err) {
          console.error(`❌ [VSENCUESTA] Error en encuesta ${i + 1}:`, err.message);
        }
      }

      // 6. Confirmación final
      await msg.reply(`✅ *Encuestas enviadas*

> 📊 Total: ${enviadas} de ${bloques.length}
> 💡 Si alguna falló, vuelve a intentarlo.`);

    } catch (e) {
      console.error("❌ [VSENCUESTA ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al enviar las encuestas.');
    }
  },
};
