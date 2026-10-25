export class DocumentReadError extends Error {
  readonly #path: string;

  public constructor(path: string, cause?: unknown) {
    super(
      `cannot read file: ${path}`,
      cause === undefined ? undefined : { cause }
    );
    this.name = 'DocumentReadError';
    this.#path = path;
  }

  public get path(): string {
    return this.#path;
  }
}
