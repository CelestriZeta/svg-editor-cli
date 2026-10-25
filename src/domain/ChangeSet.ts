export interface ChangeSet {
  readonly hasChanges: boolean;

  apply(): void;

  revert(): void;
}
