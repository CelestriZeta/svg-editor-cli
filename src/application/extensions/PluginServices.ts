import type { ActiveDocument } from '../ports/ActiveDocument.js';
import type { DirectoryAccess } from '../ports/DirectoryAccess.js';
import type { CheckpointSource } from '../ports/CheckpointSource.js';
import type { DocumentQuery } from '../queries/DocumentQuery.js';

export interface PluginServices {
  readonly documents: ActiveDocument;
  readonly query: DocumentQuery;
  readonly checkpoints: CheckpointSource;
  readonly directory: DirectoryAccess;
}
