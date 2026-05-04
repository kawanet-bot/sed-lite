import alias from "@rollup/plugin-alias"
import multiEntry from "@rollup/plugin-multi-entry"
import nodeResolve from "@rollup/plugin-node-resolve"
import sucrase from "@rollup/plugin-sucrase"
import type {RollupOptions} from "rollup"
import {fileURLToPath} from "node:url"
import {showFiles} from "./show-files.ts"

const rollupConfig: RollupOptions = {
    input: "../test/*.test.ts",

    output: {
        file: "../test/test.browser.js",
        format: "iife",
    },

    treeshake: false,

    plugins: [
        // Redirect node:test / node:assert imports to the browser
        // shims in `builder/`. Tests can therefore use identical
        // source under both `node --test` (real node:*) and the
        // browser (these shims).
        alias({
            entries: [
                {find: "node:test", replacement: fileURLToPath(new URL("./node-test.shim.ts", import.meta.url))},
                {find: "node:assert", replacement: fileURLToPath(new URL("./node-assert.shim.ts", import.meta.url))},
            ],
        }),

        multiEntry(),

        nodeResolve({
            browser: true,
            preferBuiltins: false,
        }),

        sucrase({
            exclude: ["node_modules/**"],
            transforms: ["typescript"],
        }),

        showFiles(),
    ],
}

export default rollupConfig
