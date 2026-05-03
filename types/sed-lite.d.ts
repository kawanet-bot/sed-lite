/**
 * sed-lite — compile a `sed`-style substitution definition into a
 * JavaScript replacer function.
 *
 * The returned function takes a string and returns a new string with the
 * substitution applied (i.e. `str => str.replace(regexp, replacement)`).
 *
 * @param def Substitution definition in the form `"s/match/replace/flags"`.
 *            Multiple substitutions can be chained with `;` and lines
 *            beginning with `#` are treated as comments.
 * @returns A function that applies the parsed substitution(s) to its input,
 *          or `undefined` when `def` is empty (or contains only whitespace,
 *          `;`, and `#` comment lines, which collapse to nothing after
 *          stripping).
 * @throws SyntaxError if `def` is non-empty but not a valid `sed` expression.
 *
 * @example
 *   const fn = sed("s/foo/FOO/g");
 *   fn("foo bar foo"); // "FOO bar FOO"
 */
export declare const sed: (def: string) => (str: string) => string;
