import { DomainError } from '../DomainError.js';
import { ShapeStyle } from '../shapes/ShapeStyle.js';
import { ShapeSpec } from './ShapeSpec.js';

export class TextSpec extends ShapeSpec {
  readonly #x: number;
  readonly #y: number;
  readonly #content: string;

  public constructor(
    id: string,
    x: number,
    y: number,
    content: string,
    style = new ShapeStyle()
  ) {
    super(id, style);

    if (![x, y].every(Number.isFinite)) {
      throw new DomainError('text geometry must be finite numbers');
    }
    if (content.length === 0) {
      throw new DomainError('text must not be empty');
    }

    this.#x = x;
    this.#y = y;
    this.#content = content;
  }

  public override readonly type = 'text';

  public get x(): number {
    return this.#x;
  }

  public get y(): number {
    return this.#y;
  }

  public get content(): string {
    return this.#content;
  }
}
