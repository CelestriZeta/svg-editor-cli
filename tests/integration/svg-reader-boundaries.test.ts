import { describe, expect, it } from 'vitest';

import { DomainError } from '../../src/domain/DomainError.js';
import { SvgReader } from '../../src/infrastructure/SvgReader.js';

describe('SVG reader boundaries', () => {
  it('[READ-03/07/09] assigns collision-free ids case-sensitively and accepts a valid viewBox', () => {
    const result = new SvgReader().read(
      [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<svg xmlns="http://www.w3.org/2000/svg" width="10.5" height="20" viewBox="0 0 10.5 20">',
        '  <rect id="Rect1" x="0" y="0" width="1" height="1"/>',
        '  <rect x="0" y="0" width="1" height="1"/>',
        '  <rect x="0" y="0" width="1" height="1"/>',
        '</svg>'
      ].join('\n')
    );

    expect(result.document.width).toBe(10.5);
    expect(result.document.height).toBe(20);
    expect(result.assignedIds.map((assignment) => assignment.id)).toEqual([
      'rect1',
      'rect2'
    ]);
  });

  it.each([
    [
      'unsupported element',
      '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="20"><defs/></svg>',
      'unsupported element: defs'
    ],
    [
      'transform',
      '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="20"><g id="g1" transform="translate(1,2)"/></svg>',
      'unsupported attribute: transform'
    ],
    [
      'style and class',
      '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="20"><rect id="r1" x="0" y="0" width="1" height="1" style="fill:red"/></svg>',
      'unsupported attribute: style'
    ],
    [
      'class',
      '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="20"><rect id="r1" x="0" y="0" width="1" height="1" class="node"/></svg>',
      'unsupported attribute: class'
    ],
    [
      'viewBox transform',
      '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="20" viewBox="0 0 20 40"><rect id="r1" x="0" y="0" width="1" height="1"/></svg>',
      'viewBox must be 0 0 10 20'
    ],
    [
      'namespace',
      '<svg width="10" height="20"><rect id="r1" x="0" y="0" width="1" height="1"/></svg>',
      'root element must be SVG in the SVG namespace'
    ],
    [
      'unknown root attribute',
      '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="20" data-x="1"/>',
      'unsupported attribute: data-x'
    ],
    [
      'non-UTF-8 encoding',
      '<?xml version="1.0" encoding="ISO-8859-1"?><svg xmlns="http://www.w3.org/2000/svg" width="10" height="20"/>',
      'unsupported XML encoding: ISO-8859-1'
    ],
    [
      'text child element',
      '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="20"><text id="t1" x="1" y="2"><rect id="r1" x="0" y="0" width="1" height="1"/></text></svg>',
      'text cannot contain child elements'
    ]
  ])('rejects %s', (_name, source, message) => {
    expect(() => new SvgReader().read(source)).toThrowError(
      new DomainError(message)
    );
  });

  it('[READ-06/12] rejects malformed XML and duplicate ids', () => {
    expect(() =>
      new SvgReader().read(
        '<!DOCTYPE svg><svg xmlns="http://www.w3.org/2000/svg" width="10" height="20"/>'
      )
    ).toThrowError(new DomainError('DOCTYPE is not supported'));

    expect(() =>
      new SvgReader().read(
        '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="20"><rect id="r1" x="0" y="0" width="1" height="1"></g></svg>'
      )
    ).toThrowError(/^invalid SVG XML:/);

    expect(() =>
      new SvgReader().read(
        '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="20"><rect id="same" x="0" y="0" width="1" height="1"/><circle id="same" cx="1" cy="1" r="1"/></svg>'
      )
    ).toThrowError(new DomainError('id already exists: same'));
  });
});
