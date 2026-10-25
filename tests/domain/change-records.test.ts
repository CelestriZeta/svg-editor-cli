import { describe, expect, it } from 'vitest';

import { SvgDocument } from '../../src/domain/document/SvgDocument.js';
import { Rect } from '../../src/domain/shapes/Rect.js';
import { ShapeTreeChangeSet } from '../../src/domain/shapes/ShapeTreeChangeSet.js';
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
    const changes = new ShapeTreeChangeSet([first, second]);

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
});
