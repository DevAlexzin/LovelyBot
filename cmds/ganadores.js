import db from "#db"

export default {
  command: ['ganadores', 'lista', 'premios'],
  category: 'grupo',
  isAdmin: true,
  botAdmin: false,
  run: async ({ msg, sock }) => {
    try {
      if (!msg.isGroup) {
        return msg.reply('《✤》 Este comando solo funciona en grupos.');
      }

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

    } catch (e) {
      console.error("❌ Error en ganadores:", e.message);
      msg.reply('❌ Ocurrió un error.');
    }
  },
};
