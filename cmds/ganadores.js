import db from "#db"

export default {
  command: ['ganadores', 'ganador'],
  category: 'grupo',
  isAdmin: true,
  botAdmin: false,
  run: async ({ msg, sock }) => {
    try {
      if (!msg.isGroup) {
        return msg.reply('《✤》 Este comando solo funciona en grupos.');
      }

      let textoCompleto = msg.text || msg.body || '';
      let textoUsuario = textoCompleto
        .replace(/^[.\/!#]?(ganadores|ganador)\s*/i, '')
        .trim();

      // CASO 1: NO HAY DATOS → MOSTRAR INSTRUCCIONES
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

      // CASO 2: HAY DATOS → VALIDAR Y MOSTRAR BOTONES
      const partes = textoUsuario.split('/').map(p => p.trim());

      if (partes.length < 3) {
        return msg.reply('❌ *Formato incorrecto.*\n\nDebes usar:\n`numero/premio/nombre`\n\n*Ejemplo:*\n`+5492914619852/cali/rosee`');
      }

      const numero = partes[0].replace(/\D/g, '');
      const premio = partes[1];
      const nombre = partes[2];

      if (!numero || numero.length < 8) {
        return msg.reply('❌ El número no es válido. Debe tener al menos 8 dígitos.\n\n*Ejemplo:* `+5492914619852/cali/rosee`');
      }

      // ✅ VALIDACIÓN: Verificar cuántas veces ha ganado esta semana
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

      let vecesGanadas = 0;
      for (const key of ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'extras']) {
        const items = ganadores[key] || [];
        vecesGanadas += items.filter(item => item.numero === numero).length;
      }

      if (vecesGanadas >= 2) {
        return msg.reply(`⚠️ *Este número ya ganó 2 veces esta semana.*\n\n> 📱 Número: ${numero}\n> 👤 Nombre: ${nombre}\n\n*No puede ganar más de 2 veces por semana.*`);
      }

      // Guardamos los datos temporalmente
      global.ganadoresTemporal = global.ganadoresTemporal || {};
      global.ganadoresTemporal[msg.chat] = {
        numero: numero,
        premio: premio,
        nombre: nombre,
        senderId: msg.sender,
        timestamp: Date.now()
      };

      // ✅ Botones (6 días + Extras, SIN MVP)
      const botones = [
        { buttonId: 'ganadores_lunes', buttonText: { displayText: '🍯 Lunes' }, type: 1 },
        { buttonId: 'ganadores_martes', buttonText: { displayText: '🍒 Martes' }, type: 1 },
        { buttonId: 'ganadores_miercoles', buttonText: { displayText: '🪩 Miércoles' }, type: 1 },
        { buttonId: 'ganadores_jueves', buttonText: { displayText: '👯‍♀️ Jueves' }, type: 1 },
        { buttonId: 'ganadores_viernes', buttonText: { displayText: '🏹 Viernes' }, type: 1 },
        { buttonId: 'ganadores_sabado', buttonText: { displayText: '🌈 Sábado' }, type: 1 },
        { buttonId: 'ganadores_extras', buttonText: { displayText: '✨ Extras' }, type: 1 }
      ];

      const mensajeBotones = `✅ *Datos recibidos correctamente*

> 📱 Número: ${numero}
> 🎁 Premio: ${premio}
> 👤 Nombre: ${nombre}
> 📊 Veces ganadas esta semana: ${vecesGanadas}/2

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
