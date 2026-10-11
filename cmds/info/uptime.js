import db from "#db"

function formatUptime(seconds) {
  seconds = Number(seconds)
  const d = Math.floor(seconds / (3600 * 24))
  const h = Math.floor((seconds % (3600 * 24)) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  
  let texto = ""
  if (d > 0) texto += `${d} ${d === 1 ? 'día' : 'días'}`
  if (h > 0) texto += `${texto ? ' con ' : ''}${h} ${h === 1 ? 'hora' : 'horas'}`
  if (m > 0) texto += `${texto ? ' y ' : ''}${m} ${m === 1 ? 'minuto' : 'minutos'}`
  if (s > 0 && d === 0) texto += `${texto ? ' y ' : ''}${s} ${s === 1 ? 'segundo' : 'segundos'}`
  
  return texto || "0 segundos"
}

export default {
  command: ['uptime', 'activo', 'tiempo'],
  category: 'info',
  run: async ({ msg, sock }) => {
    try {
      const uptimeFormateado = formatUptime(process.uptime())
      
      const uptimeMsg = `⏱️ El bot lleva *${uptimeFormateado}* activo.`

      await sock.sendMessage(msg.chat, { text: uptimeMsg }, { quoted: msg });

    } catch (e) {
      console.error("❌ Error en uptime:", e.message);
      msg.reply('❌ Ocurrió un error al procesar el comando.');
    }
  },
};
