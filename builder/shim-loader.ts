// Entry registered by `node --import=./builder/shim-loader.ts ...`.
// All it does is hand control to ./shim-hooks.ts via Node's module
// hooks API. The two-file split is required: `register()` runs the
// hook in a worker thread, and the hook file must therefore be
// resolvable as a worker entry separate from this loader.
//
// Used by `make test-shim` to route the same test sources that real
// `node --test` runs through the browser-side shims, so a regression
// in the shims is caught on Node before it reaches the browser bundle.

import {register} from "node:module";

register("./shim-hooks.ts", import.meta.url);
