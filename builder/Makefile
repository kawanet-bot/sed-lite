# Force bash so `set -o pipefail` works in the smoke-minjs recipe below.
SHELL := bash
.SHELLFLAGS := -eo pipefail -c

SRC   := $(wildcard ../lib/*.ts)
TYPES := $(wildcard ../types/*.d.ts)
BUILDER_SRC := $(wildcard ./*.ts)

MJS_DST   := ../dist/sed-lite.mjs
CJS_DST   := ../dist/sed-lite.cjs
MINJS_DST := ../dist/sed-lite.min.js

MJS_CONFIG   := ./rollup-mjs.config.ts
CJS_CONFIG   := ./rollup-cjs.config.ts
MINJS_CONFIG := ./rollup-minjs.config.ts

# Bundle is small: this package is a single source file with no production
# dependencies. Node builtins are external for cjs/mjs; the browser bundle
# inlines everything (which here is just the source). Anything noticeably
# larger means an accidental bundling of a Node built-in or a transitive
# dep — fail the build so it cannot slip in.
MAX_BYTES := 5000

# Documented named exports that must be verified in every bundle.
NAMED_EXPORTS := sed

ALL := $(MJS_DST) $(CJS_DST) $(MINJS_DST)

####

# Build all artifacts.
all: $(ALL)

$(MJS_DST): $(MJS_CONFIG) $(SRC) $(BUILDER_SRC)
	@mkdir -p $(dir $@)
	../node_modules/.bin/rollup -c $<
	@test "$$(wc -c < $@)" -le $(MAX_BYTES) || { echo "ERROR: $@ exceeds $(MAX_BYTES) byte cap" >&2; exit 1; }
	@ls -l $@
	@echo ""

$(CJS_DST): $(CJS_CONFIG) $(SRC) $(BUILDER_SRC)
	@mkdir -p $(dir $@)
	../node_modules/.bin/rollup -c $<
	@test "$$(wc -c < $@)" -le $(MAX_BYTES) || { echo "ERROR: $@ exceeds $(MAX_BYTES) byte cap" >&2; exit 1; }
	@ls -l $@
	@echo ""

$(MINJS_DST): $(MINJS_CONFIG) $(SRC) $(BUILDER_SRC)
	@mkdir -p $(dir $@)
	../node_modules/.bin/rollup -c $<
	@test "$$(wc -c < $@)" -le $(MAX_BYTES) || { echo "ERROR: $@ exceeds $(MAX_BYTES) byte cap" >&2; exit 1; }
	@ls -l $@
	@echo ""

# Verify the bundles by importing/requiring the package itself.
# This ensures the public entrypoints (exports/main) are correctly configured.
# Note: process.argv.slice(1) is used because `node -e 'code' arg1 arg2`
# results in process.argv = ['node', 'arg1', 'arg2'].
smoke: smoke-mjs smoke-cjs smoke-minjs

smoke-mjs: all
	@# MJS smoke test via public entrypoint
	cd .. && node --input-type=module -e 'const m = await import("sed-lite"); for (const k of process.argv.slice(1)) { if (typeof m[k] !== "function") { console.error("missing MJS export:", k); process.exit(1); } console.log("MJS export OK:", k); }' $(NAMED_EXPORTS)

smoke-cjs: all
	@# CJS smoke test via public entrypoint
	cd .. && node --input-type=commonjs -e 'const m = require("sed-lite"); for (const k of process.argv.slice(1)) { if (typeof m[k] !== "function") { console.error("missing CJS export:", k); process.exit(1); } console.log("CJS export OK:", k); }' $(NAMED_EXPORTS)

smoke-minjs: $(MINJS_DST)
	@# Browser bundle smoke: pipe the IIFE bundle plus a verification tail
	@# into `node -`, then look up each named export via direct eval(k). The
	@# bundle's top-level `var` declarations are in scope for eval(). argv
	@# layout is [node, '-', name1, name2, ...] when stdin is the script,
	@# hence slice(2) (asymmetric with smoke-mjs/cjs which use slice(1)).
	(cat $< && echo '; for (const k of process.argv.slice(2)) { if (typeof eval(k) !== "function") { console.error("missing browser export:", k); process.exit(1); } console.log("browser export OK:", k); }') | node - $(NAMED_EXPORTS)

####

# Build, run smoke tests, and conditionally run full tests (tsc and node:test).
test: all smoke $(TYPES)
	@node -v | grep -qv "^v20" || echo "Node 20 detected: skipping full tests."
	@ [ "$$npm_command" != "install" ] || echo "npm install detected: skipping full tests."
	@node -v | grep -q "^v20" || [ "$$npm_command" = "install" ] || $(MAKE) test-ts

test-ts:
	../node_modules/.bin/tsc --noEmit
	cd .. && node --test test/*.test.ts

clean:
	/bin/rm -fr $(ALL)

.PHONY: all clean test smoke smoke-mjs smoke-cjs smoke-minjs test-ts
