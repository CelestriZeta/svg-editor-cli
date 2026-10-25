import { describe, expect, it } from 'vitest';

import { GroupSpec } from '../../src/domain/specs/GroupSpec.js';
import { SvgDocument } from '../../src/domain/document/SvgDocument.js';
import { Rect } from '../../src/domain/shapes/Rect.js';
import { GeometryValueChange } from '../../src/domain/shapes/GeometryValueChange.js';
import { ShapeGeometryChange } from '../../src/domain/shapes/ShapeGeometryChange.js';
import { CompositeChangeSet } from '../../src/domain/CompositeChangeSet.js';
import { ShapeAttributeUpdate } from '../../src/domain/shapes/ShapeAttributeUpdate.js';
import { Text } from '../../src/domain/shapes/Text.js';
import { RectSpec } from '../../src/domain/specs/RectSpec.js';
import { TextSpec } from '../../src/domain/specs/TextSpec.js';
import { RecordingShapeTreeChange } from '../support/RecordingShapeTreeChange.js';

describe('shape attribute change records', () => {
  it('[CHANGE-05] restores an absent style attribute without inventing a value', () => {
    const document = new SvgDocument(100, 100);
    const rect = document.createShape(new RectSpec('r1', 1, 2, 3, 4)) as Rect;
    const change = rect.prepareSet(ShapeAttributeUpdate.text('fill', 'red'));

    change.apply();
    expect(rect.fill).toBe('red');
    change.revert();
    expect(rect.fill).toBeUndefined();
    change.apply();
    expect(rect.fill).toBe('red');
  });

  it('[SET-01/03, CHANGE-05] validates before applying and restores geometry and text', () => {
    const document = new SvgDocument(100, 100);
    const rect = document.createShape(new RectSpec('r1', 1, 2, 3, 4)) as Rect;
    const text = document.createShape(
      new TextSpec('t1', 5, 6, 'before')
    ) as Text;

    expect(() => rect.prepareSet(ShapeAttributeUpdate.number('width', 0))).toThrow(
      'width must be positive'
    );
    expect(rect.width).toBe(3);

    const width = rect.prepareSet(ShapeAttributeUpdate.number('width', 20));
    const content = text.prepareSet(ShapeAttributeUpdate.text('text', 'after'));
    width.apply();
    content.apply();
    expect(rect.width).toBe(20);
    expect(text.content).toBe('after');
    width.revert();
    content.revert();
    expect(rect.width).toBe(3);
    expect(text.content).toBe('before');
  });

  it('[CHANGE-14] attempts every rollback and preserves all failures', () => {
    const events: string[] = [];
    const first = new RecordingShapeTreeChange(
      () => events.push('first:apply'),
      () => {
        events.push('first:revert');
        throw new Error('rollback failed');
      }
    );
    const second = new RecordingShapeTreeChange(
      () => {
        events.push('second:apply');
        throw new Error('commit failed');
      },
      () => events.push('second:revert')
    );
    const changes = new CompositeChangeSet([first, second]);

    let failure: unknown;
    try {
      changes.apply();
    } catch (error) {
      failure = error;
    }

    expect(events).toEqual(['first:apply', 'second:apply', 'first:revert']);
    expect(failure).toBeInstanceOf(AggregateError);
    expect((failure as AggregateError).errors).toHaveLength(2);
  });

  it('[CHANGE-03/04] rolls back partial geometry writes in one shape', () => {
    const document = new SvgDocument(100, 100);
    const rect = document.createShape(
      new RectSpec('r1', 1, 2, 3, 4)
    ) as Rect;
    const change = new ShapeGeometryChange(rect, [
      new GeometryValueChange('x', 1, 10),
      new GeometryValueChange('width', 3, 0)
    ]);

    expect(() => change.apply()).toThrow('width must be positive');
    expect(rect).toMatchObject({ x: 1, width: 3 });
  });
  it('rolls back a mixed geometry, attribute and tree edit when a later action fails', () => {
    const document = new SvgDocument(100, 100);
    document.createShape(new GroupSpec('g1'));
    const rect = document.createShape(new RectSpec('r1', 1, 2, 3, 4)) as Rect;
    const changes = new CompositeChangeSet([
      rect.prepareMove(10, 20),
      rect.prepareSet(ShapeAttributeUpdate.text('fill', 'red')),
      document.prepareAddTo('g1', 'r1'),
      new RecordingShapeTreeChange(() => { throw new Error('later action failed'); }, () => undefined)
    ]);

    expect(() => changes.apply()).toThrow('later action failed');
    expect(rect.x).toBe(1);
    expect(rect.y).toBe(2);
    expect(rect.fill).toBeUndefined();
    expect(rect.parent).toBeUndefined();
    expect([...document.children].map((shape) => shape.id)).toEqual(['g1', 'r1']);
    expect(document.requireShape('r1')).toBe(rect);
    expect([...document.requireContainer('g1').children]).toEqual([]);
  });

});
