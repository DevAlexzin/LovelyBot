import db from "#db"

export default {
  command: ['verganadores', 'listaganadores', 'verlista'],
  category: 'grupo',
  botAdmin: false,
  run: async ({ msg, sock }) => {
    console.log("========================================");
    console.log("🔍 [DEBUG] Comando 'verganadores' ejecutado.");
    console.log("========================================");

    try {
      // 1. Verificamos que sea un grupo
      if (!msg.isGroup) {
        return msg.reply('《✤》 Este comando solo funciona en grupos.');
      }

      // 2. Obtenemos la fecha actual para saber qué semana es
      const ahora = new Date();
      const año = ahora.getFullYear();
      const inicioAño = new Date(año, 0, 1);
      const diasTranscurridos = Math.floor((ahora - inicioAño) / 86400000);
      const semana = Math.ceil((diasTranscurridos + inicioAño.getDay() + 1) / 7);

      // 3. Leemos la base de datos
      const chatData = await db.getChat(msg.chat);
      const dbKey = `ganadores_semana_${año}_${semana}`;
      const ganadores = chatData[dbKey] || {
        lunes: [], martes: [], miercoles: [], jueves: [], viernes: [], sabado: [], extras: []
      };

      // 4. Definimos los días con sus emojis
      const dias = [
        { nombre: 'Lᥙᥒᥱs', emoji: '🍯', key: 'lunes' },
        { nombre: 'Mᥲrtᥱs', emoji: '🍒', key: 'martes' },
        { nombre: 'Mιᥱrᥴoᥣᥱs', emoji: '🪩', key: 'miercoles' },
        { nombre: 'Jᥙᥱvᥱs', emoji: '👯🏻‍♀️', key: 'jueves' },
        { nombre: 'Vιᥱrᥒᥱs', emoji: '🏹', key: 'viernes' },
        { nombre: 'Sᥲbᥲdo', emoji: '🌈', key: 'sabado' }
      ];

      // 5. Construimos el mensaje
      let listaMsg = `⌢ .⌢ . ⌢ . ꒰ ⌢୨୧⌢ ꒱ . ⌢ . ⌢. ⌢

𖤣𖥧𖡼.𖤣𖡼 𝗬𝗮 𝗻𝗼 𝗽𝘂𝗲𝗱𝗲𝗻 𝗴𝗮𝗻𝗮𝗿

. ݁₊ ⊹ ⋆ꕀ Dzᥒ
─⋆
. ݁₊ ⊹ ⋆ꕀ Iᥒtᥱgrᥲᥒtᥱ
─⋆

⁺⊹⋆₊˚ᰔ 𝗚𝗮𝗻𝗮𝗱𝗼𝗿𝗲𝘀 𝗱𝗲 𝗹𝗮 𝘀𝗲𝗺𝗮𝗻𝗮`;

      // 6. Recorremos cada día
      for (const dia of dias) {
        listaMsg += `\n்⋆ ✮ ${dia.nombre}\n`;
        
        const items = ganadores[dia.key] || [];
        
        // ✅ Mostramos los ganadores reales
        for (const item of items) {
          listaMsg += `⋆${dia.emoji}⋆ ${item.nombre}\n`;
        }

        // ✅ Calculamos cuántas casillas vacías agregar (mínimo 5 en total)
        const totalMostrar = Math.max(5, items.length);
        const vacias = totalMostrar - items.length;
        
        for (let i = 0; i < vacias; i++) {
          listaMsg += `⋆${dia.emoji}⋆\n`;
        }

        // Separador entre días
        listaMsg += `\n         ‧ ₊˚ . ⁺‧˖ ݁⋆✮⁺‧˖ ݁⋆‧ ₊˚ . ⁺‧\n`;
      }

      // 7. Extras (también con mínimo 3 casillas)
      listaMsg += `\n்⋆ ✮ Extrᥲs\n`;
      const extras = ganadores.extras || [];
      
      for (const item of extras) {
        listaMsg += `⋆🌈⋆ ${item.nombre}\n`;
      }
      
      const totalExtras = Math.max(3, extras.length);
      const vaciasExtras = totalExtras - extras.length;
      
      for (let i = 0; i < vaciasExtras; i++) {
        listaMsg += `⋆🌈⋆\n`;
      }

      // 8. Enviamos el mensaje
      await sock.sendMessage(msg.chat, { text: listaMsg.trim() }, { quoted: msg });

    } catch (e) {
      console.error("❌ [ERROR CRÍTICO] Fallo en el comando verganadores:");
      console.error("   - Mensaje de error:", e.message);
      console.error("   - Stack trace:", e.stack);
      
      msg.reply('❌ Ocurrió un error al procesar la lista.');
    }
  },
};
