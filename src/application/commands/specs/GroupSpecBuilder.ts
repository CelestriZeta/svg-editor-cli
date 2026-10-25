import { DomainError } from '../../../domain/DomainError.js';
import { GroupSpec } from '../../../domain/specs/GroupSpec.js';
import type { ShapeSpec } from '../../../domain/specs/ShapeSpec.js';
import type { ShapeSpecBuilder } from '../contracts/ShapeSpecBuilder.js';

export class GroupSpecBuilder implements ShapeSpecBuilder {
  public create(id: string, parameters: readonly string[]): ShapeSpec {
    if (parameters.length !== 0) {
      throw new DomainError('g does not accept parameters');
    }
    return new GroupSpec(id);
  }
}
