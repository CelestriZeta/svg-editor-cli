import type { ShapeProvider } from '../../application/extensions/ShapeProvider.js';
import type { Shape } from '../../domain/shapes/Shape.js';
import { CommandNumberParser } from '../../application/commands/support/CommandNumberParser.js';
import { GeometrySnapshot } from '../../application/queries/GeometrySnapshot.js';
import { SvgContentKind } from '../../application/ports/SvgContentKind.js';
import type { SvgShapeInput } from '../../application/ports/SvgShapeInput.js';
import { SvgShapeOutput } from '../../application/ports/SvgShapeOutput.js';
import { RectSpec } from '../../domain/specs/RectSpec.js';
import { TextSpec } from '../../domain/specs/TextSpec.js';
import { ShapeStyle } from '../../domain/shapes/ShapeStyle.js';
import { DomainError } from '../../domain/DomainError.js';
import { BoxShape } from './BoxShape.js';
import { BoxSpec } from './BoxSpec.js';
export class BoxProvider implements ShapeProvider {
  public readonly name='box';public readonly svgTag='g';public readonly content=SvgContentKind.Children;
  public readonly syntaxes=Object.freeze(['create box <id> <x> <y> <w> <h> "<label>" [in <container-id>]']);
  public createSpec(id: string, parameters: readonly string[]): BoxSpec {
    if(parameters.length!==5)throw new DomainError('box requires x, y, width, height and label');
    const numbers=new CommandNumberParser();
    const x=numbers.parseShape('box',parameters[0],'x'),y=numbers.parseShape('box',parameters[1],'y');
    const w=numbers.parseShape('box',parameters[2],'width'),h=numbers.parseShape('box',parameters[3],'height');
    return new BoxSpec(id,[new RectSpec(id+'-rect',x,y,w,h,new ShapeStyle('#4a90d9')),new TextSpec(id+'-label',x+20,y+h/2+5,parameters[4]!)]);
  }
  public project(shape: Shape): GeometrySnapshot {this.requireShape(shape);return GeometrySnapshot.empty();}
  public encode(shape: Shape): SvgShapeOutput {this.requireShape(shape);return new SvgShapeOutput([]);}
  public decode(input: SvgShapeInput): BoxSpec {
    input.requireSupported(['id','fill','stroke','stroke-width']);return new BoxSpec(input.id,[],input.style());
  }
  public validateImported(shape: Shape): void {this.requireShape(shape);}
  private requireShape(shape: Shape): BoxShape {if(!(shape instanceof BoxShape))throw new DomainError('invalid shape instance: box');return shape;}
}
