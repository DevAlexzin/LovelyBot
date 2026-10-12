import db from "#db"

export default {
  command: ['partireset', 'resetparti'],
  category: 'grupo',
  isAdmin: true,
  botAdmin: false,
  run: async ({ msg, sock }) => {
    console.log("========================================");
    console.log("🔍 [DEBUG] Comando 'partireset' ejecutado.");
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

      const dbKey = `participacion_semana_${año}_${semana}`;

      // 3. Leemos la configuración del chat
      const chatData = await db.getChat(msg.chat);
      const registros = chatData[dbKey] || [];

      if (registros.length === 0) {
        return msg.reply('⚠️ La lista de participación ya está vacía.');
      }

      // 4. Guardamos la lista vacía
      await db.updateChat(msg.chat, dbKey, []);

      // 5. Enviamos confirmación
      const resetMsg = `✅ *Lista de participación reiniciada.*

> Se eliminaron *${registros.length}* participantes de la semana actual.
> La lista ha quedado en blanco.

*Semana reiniciada:* ${semana} del ${año}`;

      await sock.sendMessage(msg.chat, { text: resetMsg.trim() }, { quoted: msg });

    } catch (e) {
      console.error("❌ [ERROR CRÍTICO] Fallo en el comando partireset:");
      console.error("   - Mensaje de error:", e.message);
      console.error("   - Stack trace:", e.stack);
      
      msg.reply('❌ Ocurrió un error al reiniciar la lista.');
    }
  },
};
