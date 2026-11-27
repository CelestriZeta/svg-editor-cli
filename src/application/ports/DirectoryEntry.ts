export class DirectoryEntry {
  public constructor(private readonly entryName: string, private readonly directory: boolean) {
    Object.freeze(this);
  }
  public get name(): string { return this.entryName; }
  public get isDirectory(): boolean { return this.directory; }
}
