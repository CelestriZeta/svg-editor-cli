import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export class TemporaryDirectory {
  private constructor(private readonly directoryPath: string) {}

  public static async create(prefix: string): Promise<TemporaryDirectory> {
    const path = await mkdtemp(join(tmpdir(), prefix));
    return new TemporaryDirectory(path);
  }

  public get path(): string {
    return this.directoryPath;
  }

  public file(name: string): string {
    return join(this.directoryPath, name);
  }

  public async dispose(): Promise<void> {
    await rm(this.directoryPath, { force: true, recursive: true });
  }
}
