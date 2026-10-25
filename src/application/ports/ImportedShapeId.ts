export class ImportedShapeId {
  readonly #tagName: string;
  readonly #id: string;

  public constructor(tagName: string, id: string) {
    this.#tagName = tagName;
    this.#id = id;
  }

  public get tagName(): string {
    return this.#tagName;
  }

  public get id(): string {
    return this.#id;
  }
}
