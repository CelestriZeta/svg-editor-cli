import { ImportedShapeId } from '../application/ports/ImportedShapeId.js';

export class MissingIdAllocator {
  readonly #occupied: Set<string>;
  readonly #nextIndexes = new Map<string, number>();
  readonly #assignments: ImportedShapeId[] = [];

  public constructor(explicitIds: ReadonlySet<string>) {
    this.#occupied = new Set(explicitIds);
  }

  public resolve(id: string | undefined, tagName: string): string {
    if (id !== undefined) {
      return id;
    }

    let index = this.#nextIndexes.get(tagName) ?? 1;
    let candidate = `${tagName}${index}`;
    while (this.#occupied.has(candidate)) {
      index += 1;
      candidate = `${tagName}${index}`;
    }

    this.#nextIndexes.set(tagName, index + 1);
    this.#occupied.add(candidate);
    this.#assignments.push(new ImportedShapeId(tagName, candidate));
    return candidate;
  }

  public get assignments(): readonly ImportedShapeId[] {
    return this.#assignments;
  }
}
