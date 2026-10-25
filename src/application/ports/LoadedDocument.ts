import type { SvgDocument } from '../../domain/document/SvgDocument.js';
import type { ImportedShapeId } from './ImportedShapeId.js';

export class LoadedDocument {
  readonly #idAssignments: readonly ImportedShapeId[];

  public constructor(
    private readonly loadedDocument: SvgDocument,
    idAssignments: readonly ImportedShapeId[]
  ) {
    this.#idAssignments = Object.freeze([...idAssignments]);
  }

  public get document(): SvgDocument {
    return this.loadedDocument;
  }

  public get assignedIds(): readonly ImportedShapeId[] {
    return this.#idAssignments;
  }
}
