import { randomUUID } from 'node:crypto';
import { rename, rm, writeFile } from 'node:fs/promises';

import type { DocumentStore } from '../application/ports/DocumentStore.js';
import type { SvgDocument } from '../domain/document/SvgDocument.js';
import type { SvgWriteVisitor } from './SvgWriteVisitor.js';

export class SvgDocumentStore implements DocumentStore {
  public constructor(private readonly writer: SvgWriteVisitor) {}

  public async save(path: string, document: SvgDocument): Promise<void> {
    const temporaryPath = `${path}.${process.pid}.${randomUUID()}.tmp`;

    try {
      await writeFile(temporaryPath, this.writer.serialize(document), 'utf8');
      await rename(temporaryPath, path);
    } finally {
      try {
        await rm(temporaryPath, { force: true });
      } catch {
        // Preserve the original write or replacement failure.
      }
    }
  }
}
