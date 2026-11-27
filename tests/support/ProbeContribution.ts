import type { CommandPresenter } from '../../src/application/commands/contracts/CommandPresenter.js';
import type { CommandContribution } from '../../src/application/extensions/CommandContribution.js';
import { ProbeCommand } from './ProbeCommand.js';
import { ProbePresenter } from './ProbePresenter.js';

export class ProbeContribution implements CommandContribution {
  public readonly name = 'probe';
  public readonly syntaxes = Object.freeze(['probe']);

  public constructor(private readonly presenter: CommandPresenter<number> = new ProbePresenter()) {}

  public create(): ProbeCommand {
    return new ProbeCommand(this.presenter);
  }
}
