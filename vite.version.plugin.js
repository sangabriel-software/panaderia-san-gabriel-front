// vite.version.plugin.js (en la raíz del proyecto, junto a vite.config.js)
//
// En cada `npm run build`:
//  1. Genera una versión única (por defecto la fecha/hora del build, o APP_VERSION si la defines).
//  2. La inyecta en el código como __APP_VERSION__ (la versión con la que corre el navegador).
//  3. Emite dist/version.json con esa misma versión (la "última versión publicada").
//
// La app compara ambas: si no coinciden, hay una versión nueva y se muestra el aviso de actualizar.

const buildVersion = () =>
    process.env.APP_VERSION ||
    new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14); // ej. 20261002153045
  
  export default function versionPlugin() {
    const version = buildVersion();
  
    return {
      name: "app-version",
  
      config() {
        return {
          define: {
            __APP_VERSION__: JSON.stringify(version),
          },
        };
      },
  
      generateBundle() {
        this.emitFile({
          type: "asset",
          fileName: "version.json",
          source: JSON.stringify({ version }),
        });
      },
    };
  }