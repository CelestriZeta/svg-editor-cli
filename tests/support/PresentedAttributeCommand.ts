import type { CommandPresenter } from '../../src/application/commands/contracts/CommandPresenter.js';
import { EditChangeSetCommand } from '../../src/application/commands/EditChangeSetCommand.js';
import { PresentedCommandResult } from '../../src/application/commands/results/PresentedCommandResult.js';
import type { SvgDocument } from '../../src/domain/document/SvgDocument.js';
import { ShapeAttributeUpdate } from '../../src/domain/shapes/ShapeAttributeUpdate.js';

export class PresentedAttributeCommand extends EditChangeSetCommand {
  public constructor(
    private readonly document: SvgDocument,
    private readonly presenter: CommandPresenter<number>
  ) {
    super();
  }

  protected prepareChange() {
    return this.document.requireShape('r1').prepareSet(ShapeAttributeUpdate.text('fill', 'red'));
  }

  protected createResult(): PresentedCommandResult<number> {
    return new PresentedCommandResult(1, this.presenter);
  }
}
