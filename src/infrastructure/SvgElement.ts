import type { ContainerShape } from '../domain/shapes/ContainerShape.js';
import type { SvgDocument } from '../domain/document/SvgDocument.js';
import { DomainError } from '../domain/DomainError.js';
import type { ShapeSpec } from '../domain/specs/ShapeSpec.js';
import type { MissingIdAllocator } from './MissingIdAllocator.js';

export abstract class SvgElement {
  readonly #tagName: string;
  readonly #id: string | undefined;

  protected constructor(tagName: string, id: string | undefined) {
    this.#tagName = tagName;
    this.#id = id;
  }

  public get tagName(): string {
    return this.#tagName;
  }

  public get id(): string | undefined {
    return this.#id;
  }

  public collectExplicitIds(ids: Set<string>): void {
    if (this.#id === undefined) {
      return;
    }
    if (ids.has(this.#id)) {
      throw new DomainError(`id already exists: ${this.#id}`);
    }
    ids.add(this.#id);
  }

  public addChild(_child: SvgElement): void {
    throw new DomainError(`${this.#tagName} cannot contain child elements`);
  }

  public appendText(text: string): void {
    if (text.trim().length > 0) {
      throw new DomainError(
        'text content is not supported outside text elements'
      );
    }
  }

  public appendTo(
    document: SvgDocument,
    parent: ContainerShape | undefined,
    ids: MissingIdAllocator
  ): void {
    const id = ids.resolve(this.#id, this.#tagName);
    document.createShape(this.createSpec(id), parent);
  }

  protected abstract createSpec(id: string): ShapeSpec;
}
