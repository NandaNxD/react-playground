import * as esbuild from "esbuild-wasm";
import localforage from "localforage";

const fileCache = localforage.createInstance({
    name: "fileCache",
});

export const fetchPlugin = (code: string) => {
    return {
        name: "fetch-plugin",
        setup: (build: esbuild.PluginBuild) => {
            build.onLoad({ filter: /^index\.js$/ }, async () => {
                return {
                    loader: "jsx",
                    contents: code,
                };
            });

             build.onLoad({ filter: /.*/ }, async (args: any) => {
                 const cachedResults =
                     await fileCache.getItem<esbuild.OnLoadResult>(args.path);

                 if (cachedResults) {
                     return cachedResults;
                 }

                return null;
             });

            build.onLoad({ filter: /.css$/ }, async (args:any) => {

                  const data = await fetch(args.path);
                  const fileText = await data.text();
                  console.log(fileText);

                  const path = new URL("./", data.url).pathname;
                  console.log(path);

            
                  const escapedCss = fileText
                      .replace(/\n/g, "")
                      .replace(/"/g, '\\"')
                      .replace(/'/g, "\\'");

                  const contents =
                      
                          `
                                const style=document.createElement('style');
                                style.innerText=' ${escapedCss} ';
                                document.head.appendChild(style);
                            `
                          

                  const result: esbuild.OnLoadResult = {
                      loader: "jsx",
                      contents: contents,
                      resolveDir: path,
                  };

                  await fileCache.setItem(args.path, result);

                  return result;
            });

            build.onLoad({ filter: /.*/ }, async (args: any) => {
                console.log("onLoad", args);

                const data = await fetch(args.path);
                const fileText = await data.text();
                console.log(fileText);

                const path = new URL("./", data.url).pathname;
                console.log(path);

                

                const result: esbuild.OnLoadResult = {
                    loader: "jsx",
                    contents: fileText,
                    resolveDir: path,
                };

                await fileCache.setItem(args.path, result);

                return result;
            });
        },
    };
};