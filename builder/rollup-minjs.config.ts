import nodeResolve from "@rollup/plugin-node-resolve"
import sucrase from "@rollup/plugin-sucrase"
import terser from "@rollup/plugin-terser"
import type {RollupOptions} from "rollup"
import {showFiles} from "./show-files.ts"

const rollupConfig: RollupOptions = {
    // See iife-entry.ts for why we route the bundle through a default
    // re-export instead of consuming `lib/sed-lite.ts` directly.
    input: "./iife-entry.ts",

    output: {
        file: "../dist/sed-lite.min.js",
        format: "iife",
        name: "sed",
        // Expose the default export as the single global value rather
        // than wrapping it in a `{default: ...}` namespace object.
        exports: "default",
    },

    plugins: [
        nodeResolve({
            browser: true,
            preferBuiltins: false,
        }),

        sucrase({
            exclude: ["node_modules/**"],
            transforms: ["typescript"],
        }),

        showFiles(),

        terser({
            compress: true,
            ecma: 2020,
            mangle: true,
        }),
    ],
}

export default rollupConfig
