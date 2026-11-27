import type { Shape } from '../../domain/shapes/Shape.js';
import { ContainerShape } from '../../domain/shapes/ContainerShape.js';
import { DomainError } from '../../domain/DomainError.js';
import { Line } from '../../domain/shapes/Line.js';
import type { ShapeRelations } from '../../domain/shapes/ShapeRelations.js';
import type { ShapeStyle } from '../../domain/shapes/ShapeStyle.js';

export class ArrowShape extends ContainerShape {
  public readonly type = 'arrow';

  public constructor(id: string, relations: ShapeRelations, style: ShapeStyle) {
    super(id, relations, style);
  }

  public get shaft(): Line {
    return this.requirePart([...this.children], '-shaft');
  }

  public override validateStructure(relations: ShapeRelations): void {
    const children = [...relations.childrenOf(this)];
    for (const suffix of ['-shaft', '-head-left', '-head-right']) {
      this.requirePart(children, suffix);
    }
  }

  private requirePart(children: readonly Shape[], suffix: string): Line {
    const part = children.find(child => child instanceof Line && child.id === this.id + suffix);
    if (!(part instanceof Line)) throw new DomainError('invalid arrow parts: ' + this.id);
    return part;
  }
}
