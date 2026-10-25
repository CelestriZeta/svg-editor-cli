import { CompositeChangeSet } from '../CompositeChangeSet.js';
import { ShapeGeometryChange } from './ShapeGeometryChange.js';
import type { GeometryValueChange } from './GeometryValueChange.js';
import type { Shape } from './Shape.js';

export class GeometryChangeSet extends CompositeChangeSet<ShapeGeometryChange> {
  public static single(shape: Shape, values: readonly GeometryValueChange[]): GeometryChangeSet {
    return new GeometryChangeSet([new ShapeGeometryChange(shape, values)]);
  }
}
