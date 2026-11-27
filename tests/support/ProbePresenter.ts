import type { CommandPresenter } from '../../src/application/commands/contracts/CommandPresenter.js';

export class ProbePresenter implements CommandPresenter<number> {
  public format(value: number): string {
    return `probe: ${value}`;
  }
}
