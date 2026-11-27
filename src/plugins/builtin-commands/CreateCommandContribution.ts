import type { ShapeCatalog } from '../../application/extensions/ShapeCatalog.js';
import type { CommandContribution } from '../../application/extensions/CommandContribution.js';
import type { Command } from '../../application/commands/contracts/Command.js';
import type { CreateShapeCommandFactory } from './factories/CreateShapeCommandFactory.js';

export class CreateCommandContribution implements CommandContribution {
  public readonly name = 'create';

  public constructor(private readonly factory: CreateShapeCommandFactory, private readonly shapes: ShapeCatalog) {}

  public get syntaxes(): readonly string[] {
    const syntaxes = this.shapes.shapeSyntaxes();
    return syntaxes.length === 0
      ? Object.freeze(['create <type> <id> [params...] [in <container-id>]'])
      : syntaxes;
  }

  public create(args: readonly string[]): Command {
    return this.factory.create(args);
  }
}
