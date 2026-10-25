import type { ShapeViewVisitor } from './ShapeViewVisitor.js';

export abstract class ShapeView {
  readonly #id: string;
  readonly #fill: string | undefined;
  readonly #stroke: string | undefined;
  readonly #strokeWidth: number | undefined;

  protected constructor(
    id: string,
    fill?: string,
    stroke?: string,
    strokeWidth?: number
  ) {
    this.#id = id;
    this.#fill = fill;
    this.#stroke = stroke;
    this.#strokeWidth = strokeWidth;
  }

  public get id(): string {
    return this.#id;
  }

  public get fill(): string | undefined {
    return this.#fill;
  }

  public get stroke(): string | undefined {
    return this.#stroke;
  }

  public get strokeWidth(): number | undefined {
    return this.#strokeWidth;
  }

  public get children(): readonly ShapeView[] {
    return [];
  }

  public abstract accept<T>(visitor: ShapeViewVisitor<T>): T;
}
