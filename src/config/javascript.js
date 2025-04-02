const esbuild = require("esbuild");
const fs = require("node:fs");
const path = require("path");
const server = require("../config/server");
const isProduction = server.isProduction;

module.exports = {
    // All .js files will be recognised as a language. The contents of these files will be processed as per the compile method
    outputFileExtension: "js",
    init: async function () {
        // Create the /assets/js directory on first build
        fs.mkdirSync('public/assets/js', { recursive: true });
    },
    compile: async (content, inputPath) => {
        // If the file isn't from the assets directory, ignore it
        if (!inputPath.includes("/src/assets/")) {
            return;
        }

        // Get the filename from the input path
        const filename = path.basename(inputPath);
        const outputPath = path.join('public/assets/js', filename);

        // Build JS with ESBuild. If production, minify, use sourcemaps, and target ES6
        const result = await esbuild.build({
            entryPoints: [inputPath],
            outfile: outputPath,
            write: false,
            bundle: true,
            minify: isProduction,
            sourcemap: !isProduction,
            target: isProduction ? "es6" : "esnext",
        });

        return async () => {
            // Write the built file
            fs.writeFileSync(outputPath, result.outputFiles[0].text);
            return undefined;
        };
    }
}; 