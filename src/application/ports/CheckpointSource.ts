import type { DocumentView } from '../queries/DocumentView.js';

export interface CheckpointSource {
  subscribe(listener: (view: DocumentView) => void): () => void;
}
