export class DocumentStoreError extends Error {
  readonly #path: string;

  public constructor(
    path: string,
    cause?: unknown
  ) {
    super(
      `cannot write file: ${path}`,
      cause === undefined ? undefined : { cause }
    );
    this.name = 'DocumentStoreError';
    this.#path = path;
  }

  public get path(): string {
    return this.#path;
  }
}
