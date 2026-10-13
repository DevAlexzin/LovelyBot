import db from "#db"

export default {
  command: ['ganadores', 'lista', 'premios'],
  category: 'grupo',
  isAdmin: true,
  botAdmin: false,
  run: async ({ msg, sock }) => {
    console.log("========================================");
    console.log("🔍 [DEBUG] Comando 'ganadores' ejecutado.");
    console.log("========================================");

    try {
      if (!msg.isGroup) {
        return msg.reply('《✤》 Este comando solo funciona en grupos.');
      }

      // 1. Extraemos el texto que escribió el admin
      let textoCompleto = msg.text || msg.body || '';
      let textoUsuario = textoCompleto
        .replace(/^[.\/!#]?(ganadores|lista|premios)\s*/i, '')
        .trim();

      // 2. Si NO hay datos, mostramos los botones
      if (!textoUsuario) {
        const botones = [
          { buttonId: 'ganadores_lunes', buttonText: { displayText: '🍯 Lunes' }, type: 1 },
          { buttonId: 'ganadores_martes', buttonText: { displayText: '🍒 Martes' }, type: 1 },
          { buttonId: 'ganadores_miercoles', buttonText: { displayText: '🪩 Miércoles' }, type: 1 },
          { buttonId: 'ganadores_jueves', buttonText: { displayText: '👯‍♀️ Jueves' }, type: 1 },
          { buttonId: 'ganadores_viernes', buttonText: { displayText: '🏹 Viernes' }, type: 1 },
          { buttonId: 'ganadores_sabado', buttonText: { displayText: '🌈 Sábado' }, type: 1 }
        ];

        const mensajeBotones = `˖ . 𖥔 ݁ ˖ .𝙇𝙞𝙨𝙩𝙖 𝙙𝙚 𝙜𝙖𝙣𝙖𝙙𝙤𝙧𝙚𝙨 🌷

݁₊ .˚✶⋆ 𝗔𝗻𝗼𝘁𝗮𝗿 𝗮𝘀𝗶 🎐
𝑁𝑢𝑚𝑒𝑟𝑜 𝑑𝑒𝑙 𝑔𝑎𝑛𝑎𝑑𝑜𝑟/𝑃𝑟𝑒𝑚𝑖𝑜/𝑁𝑜𝑚𝑏𝑟𝑒 𝑑𝑒 𝑢𝑠𝑡𝑒𝑑𝑒𝑠
ㅤ╰  ‘ ★ Ejᥱmρᥣo
+5492914619852/cali/rosee

⌢ .⌢ . ⌢ . ꒰ ⌢୨୧⌢ ꒱ . ⌢ . ⌢. ⌢

> 👇 *Selecciona el día para anotar al ganador:*`;

        return await sock.sendMessage(msg.chat, {
          text: mensajeBotones,
          buttons: botones,
          headerType: 1,
          viewOnce: true
        }, { quoted: msg });
      }

      // 3. Si SÍ hay datos, los procesamos
      // Formato esperado: numero/premio/nombre
      const partes = textoUsuario.split('/').map(p => p.trim());

      if (partes.length < 3) {
        return msg.reply('❌ Formato incorrecto.\n\n*Ejemplo:* `.ganadores +5492914619852/cali/rosee`');
      }

      const numero = partes[0];
      const premio = partes[1];
      const nombre = partes[2];

      // 4. Guardamos en la base de datos (por defecto en "Extras" si no se especifica día)
      const ahora = new Date();
      const año = ahora.getFullYear();
      const inicioAño = new Date(año, 0, 1);
      const diasTranscurridos = Math.floor((ahora - inicioAño) / 86400000);
      const semana = Math.ceil((diasTranscurridos + inicioAño.getDay() + 1) / 7);

      const chatData = await db.getChat(msg.chat);
      const dbKey = `ganadores_semana_${año}_${semana}`;
      let ganadores = chatData[dbKey] || {
        lunes: [], martes: [], miercoles: [], jueves: [], viernes: [], sabado: [], extras: []
      };

      // Por defecto lo guardamos en "extras" si no se usa botón
      ganadores.extras.push({ numero, premio, nombre, fecha: ahora.toISOString() });

      await db.updateChat(msg.chat, dbKey, ganadores);

      return msg.reply(`✅ *Ganador anotado en Extras*\n\n> 📱 Número: ${numero}\n> 🎁 Premio: ${premio}\n> 👤 Nombre: ${nombre}`);

    } catch (e) {
      console.error("❌ [ERROR CRÍTICO] Fallo en el comando ganadores:");
      console.error("   - Mensaje de error:", e.message);
      console.error("   - Stack trace:", e.stack);
      
      msg.reply('❌ Ocurrió un error al procesar el comando.');
    }
  },
};
