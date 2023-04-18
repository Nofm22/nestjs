interface ToNumberOptions {
  default?: number;
  min?: number;
  max?: number;
}
export function toNumber(value: string, opts: ToNumberOptions = {}): number {
  let newValue: number = Number.parseInt(value || String(opts.default), 10);

  return newValue;
}
