import db from "#db"

export default {
  command: ['ganadores', 'ganador'],
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
        .replace(/^[.\/!#]?(ganadores|ganador)\s*/i, '')
        .trim();

      // ============================================================
      // CASO 1: NO HAY DATOS → MOSTRAR INSTRUCCIONES
      // ============================================================
      if (!textoUsuario) {
        const instrucciones = `˖ . 𖥔 ݁ ˖ .𝙇𝙞𝙨𝙩𝙖 𝙙𝙚 𝙜𝙖𝙣𝙖𝙙𝙤𝙧𝙚𝙨 🌷

݁₊ .˚✶⋆ 𝗔𝗻𝗼𝘁𝗮𝗿 𝗮𝘀𝗶 🎐
𝑁𝑢𝑚𝑒𝑟𝑜 𝑑𝑒𝑙 𝑔𝑎𝑛𝑎𝑑𝑜𝑟/𝑃𝑟𝑒𝑚𝑖𝑜/𝑁𝑜𝑚𝑏𝑟𝑒 𝑑𝑒 𝑢𝑠𝑡𝑒𝑑𝑒𝑠
ㅤ╰  ‘ ★ Ejᥱmρᥣo
+5492914619852/cali/rosee

⌢ .⌢ . ⌢ . ꒰ ⌢୨୧⌢ ꒱ . ⌢ . ⌢. ⌢

> 💡 *Escribe el comando con los datos del ganador.*
> *Ejemplo:* \`.ganadores +5492914619852/cali/rosee\``;

        return msg.reply(instrucciones);
      }

      // ============================================================
      // CASO 2: HAY DATOS → PROCESAR Y MOSTRAR BOTONES
      // ============================================================
      
      // Verificamos que tenga el formato correcto (3 partes separadas por /)
      const partes = textoUsuario.split('/').map(p => p.trim());

      if (partes.length < 3) {
        return msg.reply('❌ *Formato incorrecto.*\n\nDebes usar:\n`numero/premio/nombre`\n\n*Ejemplo:*\n`+5492914619852/cali/rosee`');
      }

      const numero = partes[0];
      const premio = partes[1];
      const nombre = partes[2];

      // Guardamos los datos temporalmente en memoria
      global.ganadoresTemporal = global.ganadoresTemporal || {};
      global.ganadoresTemporal[msg.chat] = {
        numero: numero,
        premio: premio,
        nombre: nombre,
        senderId: msg.sender,
        timestamp: Date.now()
      };

      console.log(`📌 [GANADORES] Datos temporales guardados: ${numero}/${premio}/${nombre}`);

      // Mostramos los botones para elegir el día
      const botones = [
        { buttonId: 'ganadores_lunes', buttonText: { displayText: '🍯 Lunes' }, type: 1 },
        { buttonId: 'ganadores_martes', buttonText: { displayText: '🍒 Martes' }, type: 1 },
        { buttonId: 'ganadores_miercoles', buttonText: { displayText: '🪩 Miércoles' }, type: 1 },
        { buttonId: 'ganadores_jueves', buttonText: { displayText: '👯‍♀️ Jueves' }, type: 1 },
        { buttonId: 'ganadores_viernes', buttonText: { displayText: '🏹 Viernes' }, type: 1 },
        { buttonId: 'ganadores_sabado', buttonText: { displayText: '🌈 Sábado' }, type: 1 }
      ];

      const mensajeBotones = `✅ *Datos recibidos correctamente*

> 📱 Número: ${numero}
> 🎁 Premio: ${premio}
> 👤 Nombre: ${nombre}

> 👇 *Selecciona el día para anotar al ganador:*`;

      await sock.sendMessage(msg.chat, {
        text: mensajeBotones,
        buttons: botones,
        headerType: 1,
        viewOnce: true
      }, { quoted: msg });

    } catch (e) {
      console.error("❌ [ERROR CRÍTICO] Fallo en el comando ganadores:");
      console.error("   - Mensaje de error:", e.message);
      console.error("   - Stack trace:", e.stack);
      
      msg.reply('❌ Ocurrió un error al procesar el comando.');
    }
  },
};
