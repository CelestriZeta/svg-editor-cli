import { RectShapeProvider } from '../../src/plugins/builtin-shapes/RectShapeProvider.js';
import { CommandNumberParser } from '../../src/application/commands/support/CommandNumberParser.js';

export class RegistrationTestShape extends RectShapeProvider {
  public constructor() { super(new CommandNumberParser()); }
}
