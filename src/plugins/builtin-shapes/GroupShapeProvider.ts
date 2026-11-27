import { DomainError } from '../../domain/DomainError.js';
import { GroupSpec } from '../../domain/specs/GroupSpec.js';
import type { ShapeSpec } from '../../domain/specs/ShapeSpec.js';
import type { ShapeProvider } from '../../application/extensions/ShapeProvider.js';

export class GroupShapeProvider implements ShapeProvider {
  public readonly name = 'g';
  public readonly syntaxes = Object.freeze(['create g <id> [in <container-id>]']);

  public createSpec(id: string, parameters: readonly string[]): ShapeSpec {
    if (parameters.length !== 0) {
      throw new DomainError('g does not accept parameters');
    }
    return new GroupSpec(id);
  }
}
