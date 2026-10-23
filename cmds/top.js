import db from "#db"

export default {
  command: ['top', 'top10'],
  category: 'fun',
  botAdmin: false,
  group: true,
  run: async ({ msg, sock, text, participants }) => {
    try {
      if (!msg.isGroup) return msg.reply('《✤》 Este comando solo funciona en grupos.');

      // ✅ 1. Verificamos que se haya ingresado un texto
      if (!text || text.trim() === '') {
        return msg.reply(`🏆 *Generador de Top*

> Ingresa un tema para crear el top.
*Ejemplo:* \`.top mejores jugadoras\``);
      }

      const tema = text.trim();

      // ✅ 2. Filtramos participantes (evitamos al bot y usuarios sin ID)
      const usuariosValidos = participants.filter(p => p.id && p.id !== sock.user.id);
      
      // ✅ 3. Ahora solo pedimos un mínimo de 2 personas para que tenga sentido
      if (usuariosValidos.length < 2) {
        return msg.reply('❌ Se necesitan al menos 2 personas en el grupo para armar el Top.');
      }

      // ✅ 4. Mezclamos los usuarios y tomamos hasta 10 (o los que haya)
      const cantidad = Math.min(10, usuariosValidos.length);
      const usuariosMezclados = usuariosValidos.sort(() => 0.5 - Math.random()).slice(0, cantidad);

      // ✅ 5. Lista de emojis para el título (aleatorio)
      const emojisTitulo = ['🔥', '✨', '🥇', '💫', '🌟', '🏆', '👑', '💥'];
      const emojiElegido = emojisTitulo[Math.floor(Math.random() * emojisTitulo.length)];

      // ✅ 6. Construimos la lista
      let listaTop = '';
      const menciones = [];

      usuariosMezclados.forEach((user, index) => {
        const numero = index + 1;
        const id = user.id;
        
        // Guardamos el ID para las menciones
        menciones.push(id);
        
        // Formato del nombre
        const nombre = `@${id.split('@')[0]}`;
        
        // Emoji para el podio (top 3) y el resto
        let medalla = '';
        if (numero === 1) medalla = '🥇';
        else if (numero === 2) medalla = '🥈';
        else if (numero === 3) medalla = '🥉';
        else medalla = `*${numero}.*`;

        listaTop += `${medalla} ${nombre}\n`;
      });

      // ✅ 7. Armamos el mensaje final
      const mensajeFinal = `🏆 *TOP ${cantidad}: ${tema.toUpperCase()}* ${emojiElegido}

━━━━━━━━━━━━━━━

${listaTop}
━━━━━━━━━━━━━━━

> 💡 *Ranking generado aleatoriamente*`;

      // ✅ 8. Enviamos el mensaje con las menciones
      await sock.sendMessage(msg.chat, {
        text: mensajeFinal,
        mentions: menciones
      }, { quoted: msg });

    } catch (e) {
      console.error("❌ [TOP ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al generar el Top.');
    }
  }
};
