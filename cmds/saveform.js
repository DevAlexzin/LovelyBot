import db from "#db"
import fs from 'fs'
import path from 'path'
import { downloadContentFromMessage } from 'baileys'

export default {
  command: ['saveform', 'guardarform', 'setform'],
  category: 'grupo',
  isAdmin: true,
  botAdmin: false,
  run: async ({ msg, sock }) => {
    try {
      if (!msg.isGroup) {
        return msg.reply('《✤》 Este comando solo funciona en grupos.');
      }

      let textoCompleto = msg.text || msg.body || '';
      const texto = textoCompleto
        .replace(/^[.\/!#]?(saveform|guardarform|setform)\s*/i, '')
        .trim();

      if (!texto) {
        return msg.reply(`📋 *Guardar Formulario*

*📋 Formato:*
\`.saveform Nombre | Contenido del formulario\`

*📌 Ejemplo:*
\`.saveform Jhon | 💙 𝙁𝙤𝙧𝙢𝙪𝙡𝙖𝙧𝙞𝙤 _*Strom*_ 💙\\n🇧🇷 ᯓ Nιᥴk : ...\`

*🖼️ Con imagen:*
> Responde a una imagen con: \`.saveform Jhon | Texto del formulario\``);
      }

      // ✅ Separamos por "|"
      const partes = texto.split('|').map(p => p.trim());
      
      if (partes.length < 2) {
        return msg.reply('❌ *Formato incorrecto.*\n\nDebes usar: `.saveform Nombre | Contenido`');
      }

      const nombre = partes[0];
      const contenido = partes.slice(1).join('|').replace(/\\n/g, '\n').trim();

      // ✅ Detectar imagen adjunta
      const tieneImagen = msg.message?.imageMessage || msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
      let mediaGuardada = null;

      const carpetaFormularios = path.join(process.cwd(), 'media', 'formularios');
      if (!fs.existsSync(carpetaFormularios)) {
        fs.mkdirSync(carpetaFormularios, { recursive: true });
      }

      if (tieneImagen) {
        try {
          const imgMsg = msg.message?.imageMessage || msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
          
          // Descargamos la imagen
          const stream = await downloadContentFromMessage(imgMsg, 'image');
          let buffer = Buffer.from([]);
          for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
          }

          const nombreArchivo = `form_${msg.chat.split('@')[0]}_${nombre.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.jpg`;
          const rutaCompleta = path.join(carpetaFormularios, nombreArchivo);

          fs.writeFileSync(rutaCompleta, buffer);

          mediaGuardada = { path: rutaCompleta };
          console.log(`✅ [SAVEFORM] Imagen guardada en: ${rutaCompleta}`);
        } catch (err) {
          console.error('❌ [SAVEFORM] Error descargando imagen:', err);
        }
      }

      // ✅ Guardamos el formulario en la base de datos
      const chatData = await db.getChat(msg.chat);
      const dbKey = `formularios_${msg.chat}`;
      let formularios = chatData[dbKey] || [];

      const nombreKey = nombre.toLowerCase().trim();
      
      // Si ya existía, lo sobrescribimos
      formularios = formularios.filter(f => f.nombre.toLowerCase() !== nombreKey);
      
      formularios.push({
        nombre: nombre,
        contenido: contenido,
        media: mediaGuardada,
        creadoPor: msg.sender.split('@')[0],
        fechaCreacion: new Date().toISOString()
      });

      await db.updateChat(msg.chat, dbKey, formularios);

      await msg.reply(`✅ *Formulario guardado*

> 👤 Nombre: *${nombre}*
> 🖼️ Imagen: ${mediaGuardada ? 'Sí' : 'No'}
> 📝 Contenido guardado.

> 💡 Usa \`.formulario ${nombre}\` para enviarlo.`);

    } catch (e) {
      console.error("❌ [SAVEFORM ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al guardar el formulario.');
    }
  },
};
