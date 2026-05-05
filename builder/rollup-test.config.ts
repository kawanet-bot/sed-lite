import alias from "@rollup/plugin-alias"
import commonjs from "@rollup/plugin-commonjs"
import multiEntry from "@rollup/plugin-multi-entry"
import nodeResolve from "@rollup/plugin-node-resolve"
import sucrase from "@rollup/plugin-sucrase"
import type {RollupOptions} from "rollup"
import {fileURLToPath} from "node:url"
import {showFiles} from "./show-files.ts"

const rollupConfig: RollupOptions = {
    input: "../test/*.test.ts",

    output: {
        file: "../browser/run-tests.js",
        format: "iife",
    },

    treeshake: false,

    plugins: [
        // Redirect `node:test` / `node:assert` to the browser shims
        // and `sed-lite` to the published `browser/import.js` (a
        // 2-line CJS bridge to `globalThis.sed` from the
        // `dist/sed-lite.min.js` IIFE — see browser/import.js).
        // The same import statement therefore resolves to:
        //   - real `node:test` / `node:assert` / `sed-lite` under
        //     `node --test` (Node + the package's own dist),
        //   - the local shims / global bridge in the browser bundle,
        // exercising the published `.min.js` instead of inlining the
        // source via nodeResolve.
        alias({
            entries: [
                {find: "node:test", replacement: fileURLToPath(new URL("./node-test.shim.ts", import.meta.url))},
                {find: "node:assert", replacement: fileURLToPath(new URL("./node-assert.shim.ts", import.meta.url))},
                {find: "sed-lite", replacement: fileURLToPath(new URL("../browser/import.js", import.meta.url))},
            ],
        }),

        multiEntry(),

        nodeResolve({
            browser: true,
            preferBuiltins: false,
        }),

        // Required so rollup can interpret `browser/import.js`'s
        // `exports.sed = sed` syntax (the file is CJS so it can also
        // serve browserify users — see browser/package.json).
        commonjs(),

        sucrase({
            exclude: ["node_modules/**"],
            transforms: ["typescript"],
        }),

        showFiles(),
    ],
}

export default rollupConfig
