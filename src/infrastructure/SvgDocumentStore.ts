import { randomUUID } from 'node:crypto';
import { readFile, rename, rm, writeFile } from 'node:fs/promises';

import type { DocumentStore } from '../application/ports/DocumentStore.js';
import { DocumentReadError } from '../application/ports/DocumentReadError.js';
import type { LoadedDocument } from '../application/ports/LoadedDocument.js';
import type { SvgDocument } from '../domain/document/SvgDocument.js';
import type { SvgReader } from './SvgReader.js';
import type { SvgWriteVisitor } from './SvgWriteVisitor.js';

export class SvgDocumentStore implements DocumentStore {
  public constructor(
    private readonly reader: SvgReader,
    private readonly writer: SvgWriteVisitor
  ) {}

  public async read(path: string): Promise<LoadedDocument> {
    let source: string;
    try {
      source = await readFile(path, 'utf8');
    } catch (error) {
      throw new DocumentReadError(path, error);
    }
    return this.reader.read(source);
  }

  public async save(path: string, document: SvgDocument): Promise<void> {
    // 临时文件与目标放在同一目录，写完后再 rename 替换，避免直接截断旧文件。
    const temporaryPath = `${path}.${process.pid}.${randomUUID()}.tmp`;

    try {
      await writeFile(temporaryPath, this.writer.serialize(document), 'utf8');
      await rename(temporaryPath, path);
    } finally {
      try {
        await rm(temporaryPath, { force: true });
      } catch {
        // 清理失败不覆盖原先的写入或替换错误。
      }
    }
  }
}
