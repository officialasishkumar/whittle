/* Shared by the compressor and the UI (no tokenizer import, so it is safe in the browser). */
const ANSI = /\x1b\[[0-9;?]*[A-Za-z]|\x1b\][^\x07]*\x07/g;
export const stripAnsi = (s: string) => s.replace(ANSI, "");

const TIMESTAMP = /^\s*(\[?\d{4}-\d{2}-\d{2}[T ][\d:.,]+(?:Z|[+-]\d{2}:?\d{2})?\]?|\[?\d{2}:\d{2}:\d{2}(?:[.,]\d+)?\]?|\w{3} \d{1,2} \d{2}:\d{2}:\d{2})\s*/;
export const stripTimestamp = (l: string) => l.replace(TIMESTAMP, "");

/* How a line is compared when showing what was cut: the compressor drops timestamps and ANSI, so ignore those. */
export const lineKey = (l: string) => stripTimestamp(stripAnsi(l)).trim();
