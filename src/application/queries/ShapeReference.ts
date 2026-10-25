export class ShapeReference {
  readonly #type: string;
  readonly #id: string;

  public constructor(type: string, id: string) {
    this.#type = type;
    this.#id = id;
  }

  public get type(): string {
    return this.#type;
  }

  public get id(): string {
    return this.#id;
  }
}
