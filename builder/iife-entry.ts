// IIFE entry point used only by `rollup-minjs.config.ts` to expose `sed`
// as the global directly (e.g. `globalThis.sed = function (str) { ... }`)
// rather than as a named export under a namespace object.
//
// Without this re-export-as-default, an `iife` bundle of the named export
// `{sed}` would yield `var sed = {sed: function...}`, requiring browser
// callers to write `sed.sed(...)`. The historical `dist/sed-lite.min.js`
// shape is `var sed = function...` (a bare callable on the global), so
// we preserve that contract by routing through a default export here.
export {sed as default} from "../lib/sed-lite.ts"
