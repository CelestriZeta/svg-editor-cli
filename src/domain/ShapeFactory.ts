import { DomainError } from './DomainError.js';
import type { ShapeTree } from './document/ShapeTree.js';
import { Circle } from './shapes/Circle.js';
import { Ellipse } from './shapes/Ellipse.js';
import { Group } from './shapes/Group.js';
import { Line } from './shapes/Line.js';
import { Rect } from './shapes/Rect.js';
import type { Shape } from './shapes/Shape.js';
import { Text } from './shapes/Text.js';
import { CircleSpec } from './specs/CircleSpec.js';
import { EllipseSpec } from './specs/EllipseSpec.js';
import { GroupSpec } from './specs/GroupSpec.js';
import { LineSpec } from './specs/LineSpec.js';
import { RectSpec } from './specs/RectSpec.js';
import type { ShapeSpec } from './specs/ShapeSpec.js';
import { TextSpec } from './specs/TextSpec.js';

export class ShapeFactory {
  public create(spec: ShapeSpec, tree: ShapeTree): Shape {
    switch (spec.type) {
      case 'rect':
        if (!(spec instanceof RectSpec)) {
          throw new DomainError('invalid rect specification');
        }
        return new Rect(spec, tree);
      case 'circle':
        if (!(spec instanceof CircleSpec)) {
          throw new DomainError('invalid circle specification');
        }
        return new Circle(spec, tree);
      case 'ellipse':
        if (!(spec instanceof EllipseSpec)) {
          throw new DomainError('invalid ellipse specification');
        }
        return new Ellipse(spec, tree);
      case 'line':
        if (!(spec instanceof LineSpec)) {
          throw new DomainError('invalid line specification');
        }
        return new Line(spec, tree);
      case 'text':
        if (!(spec instanceof TextSpec)) {
          throw new DomainError('invalid text specification');
        }
        return new Text(spec, tree);
      case 'g':
        if (!(spec instanceof GroupSpec)) {
          throw new DomainError('invalid group specification');
        }
        return new Group(spec, tree);
      default:
        throw new DomainError(
          `unknown shape type: ${spec.type} (is the plugin loaded?)`
        );
    }
  }
}
