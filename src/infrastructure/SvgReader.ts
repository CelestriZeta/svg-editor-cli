import { LoadedDocument } from '../application/ports/LoadedDocument.js';
import { SvgDocument } from '../domain/document/SvgDocument.js';
import { MissingIdAllocator } from './MissingIdAllocator.js';
import { SvgTreeParser } from './SvgTreeParser.js';

export class SvgReader {
  public constructor(
    private readonly parser = new SvgTreeParser()
  ) {}

  public read(source: string): LoadedDocument {
    const canvas = this.parser.parse(source);
    const explicitIds = new Set<string>();
    for (const child of canvas.children) {
      child.collectExplicitIds(explicitIds);
    }

    const allocator = new MissingIdAllocator(explicitIds);
    const document = new SvgDocument(canvas.width, canvas.height);
    for (const child of canvas.children) {
      child.appendTo(document, undefined, allocator);
    }

    return new LoadedDocument(document, allocator.assignments);
  }
}
