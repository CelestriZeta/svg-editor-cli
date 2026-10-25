import { DomainError } from './DomainError.js';
import { Rect } from './shapes/Rect.js';
import type { Shape } from './shapes/Shape.js';
import { RectSpec } from './specs/RectSpec.js';
import type { ShapeSpec } from './specs/ShapeSpec.js';

export class ShapeFactory {
  public create(spec: ShapeSpec): Shape {
    switch (spec.type) {
      case 'rect':
        if (!(spec instanceof RectSpec)) {
          throw new DomainError('invalid rect specification');
        }
        return new Rect(spec);
      default:
        throw new DomainError(
          `unknown shape type: ${spec.type} (is the plugin loaded?)`
        );
    }
  }
}
