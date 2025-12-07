import mysql from 'mysql2/promise';
import sharp from 'sharp';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public', 'inmuebles');

async function downloadImage(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

async function main() {
  console.log('🚀 Iniciando migración de imágenes...\n');

  await mkdir(publicDir, { recursive: true });

  const connection = await mysql.createConnection({
    socketPath: '/var/run/mysqld/mysqld.sock',
    user: 'root',
    database: 'aloba_db'
  });

  try {
    const [rows] = await connection.query(
      "SELECT id, titulo, imagen_url FROM inmuebles WHERE imagen_url IS NOT NULL AND imagen_url != '' AND imagen_url NOT LIKE '/inmuebles/%' ORDER BY id"
    );

    console.log(`📦 Encontradas ${rows.length} imágenes externas para migrar\n`);

    let success = 0;
    let failed = 0;

    for (const row of rows) {
      const { id, titulo, imagen_url } = row;

      try {
        console.log(`[${id}] Descargando: ${imagen_url.substring(0, 60)}...`);

        const imageBuffer = await downloadImage(imagen_url);

        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const baseFilename = `inmueble-${id}-${timestamp}-${randomStr}`;
        const filename = `${baseFilename}.webp`;
        const thumbFilename = `thumb-${baseFilename}.webp`;

        const imagePath = path.join(publicDir, filename);
        const thumbPath = path.join(publicDir, thumbFilename);

        await Promise.all([
          sharp(imageBuffer)
            .resize(800, 600, { fit: 'cover', withoutEnlargement: true })
            .webp({ quality: 85 })
            .toFile(imagePath),
          sharp(imageBuffer)
            .resize(100, 100, { fit: 'cover', withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(thumbPath)
        ]);

        const newUrl = `/inmuebles/${filename}`;

        await connection.query(
          'UPDATE inmuebles SET imagen_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [newUrl, id]
        );

        console.log(`    ✅ Migrado a: ${newUrl}`);
        success++;

      } catch (error) {
        console.log(`    ❌ Error: ${error.message}`);
        failed++;
      }
    }

    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ Exitosas: ${success}`);
    console.log(`   ❌ Fallidas: ${failed}`);
    console.log(`   📁 Directorio: ${publicDir}`);

  } finally {
    await connection.end();
  }
}

main().catch(console.error);
