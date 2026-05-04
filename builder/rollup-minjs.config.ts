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
        // Make the bundle dual-purpose: as a browser <script>, the
        // global `sed` is the function; when require()-d from CJS
        // (e.g. by browserify-sed), the same file also assigns
        // `module.exports = sed` so consumers do not need to read
        // a global. Mirrors the long-standing pre-modernization
        // shape produced by the hand-rolled IIFE + tsc CJS wrapper.
        //
        // `footer` (not `outro`) is used so the line lands AFTER the
        // IIFE assigns its return value to the outer `var sed`.
        // Rollup's `outro` would be inside the IIFE, where `sed` does
        // not yet exist.
        footer: "if (typeof module !== 'undefined') { module.exports = sed }",
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
