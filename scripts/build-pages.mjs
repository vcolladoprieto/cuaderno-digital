import { execFileSync } from 'node:child_process';
import { readFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const raiz = fileURLToPath(new URL('../', import.meta.url));
const destino = new URL('../dist/', import.meta.url);
const contraseña = process.env.STATICRYPT_PASSWORD;

// El despliegue se detiene si falta el secreto; nunca genera una página sin cifrar.
if (!contraseña || contraseña.length < 16) {
  throw new Error('Configura PAGES_PASSWORD en GitHub con una contraseña de al menos 16 caracteres. Para compilar localmente usa STATICRYPT_PASSWORD.');
}

// Eliminamos restos de compilaciones anteriores para publicar únicamente el archivo nuevo.
rmSync(destino, { recursive: true, force: true });
execFileSync(process.execPath, [
  'node_modules/staticrypt/cli/index.js',
  'index.html',
  '--template', 'scripts/password-template.html',
  '--directory', 'dist',
  '--config', 'false',
  '--remember', '1'
], { cwd: raiz, stdio: 'inherit' });

const pagina = readFileSync(new URL('index.html', destino), 'utf8');
if (!pagina.includes('staticryptEncryptedMsgUniqueVariableName')
  || pagina.includes('<div id="app"') || pagina.includes('id="demo-data"')) {
  throw new Error('La salida no es una página cifrada válida. Se ha detenido la publicación.');
}
console.log('Página cifrada preparada en dist/index.html. Las copias locales no se publican.');
