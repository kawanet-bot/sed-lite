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
        //
        // Setting `exports.sed = sed` mirrors the named-export shape
        // of dist/sed-lite.cjs so the two files are interchangeable
        // under `require(...)`. The pre-modernization wrapper used
        // the same approach (it passed an `exports` object to the
        // IIFE and the body did `exports.sed = sed`). The gate is on
        // `typeof exports` for consistency with the body that writes
        // to `exports`.
        footer: "if (typeof exports !== 'undefined') { exports.sed = sed; }",
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
