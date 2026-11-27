import { describe, expect, it } from 'vitest';

import { SvgOutlineParser } from '../src/outline/SvgOutlineParser.js';

describe('SVG source outline', () => {
  const parser = new SvgOutlineParser();

  it('preserves the root, nested groups, leaves and missing ids', () => {
    const source = '<svg xmlns="http://www.w3.org/2000/svg"><g id="outer"><g><rect id="r"/><text>Hello</text></g></g></svg>';
    const [root] = parser.parse(source);
    expect(root?.name).toBe('svg');
    expect(root?.children[0]?.name).toBe('g#outer');
    expect(root?.children[0]?.children[0]?.name).toBe('g');
    expect(root?.children[0]?.children[0]?.children.map(node => node.name))
      .toEqual(['rect#r', 'text']);
    expect(root?.start).toBe(0);
    expect(root?.end).toBe(source.length);
  });

  it('locates exact UTF-16 source ranges across CRLF, Unicode and multiline tags', () => {
    const source = '<?xml version="1.0"?>\r\n<svg>😀<!-- <fake/> -->\r\n  <text\r\n id="中&amp;文">a<![CDATA[<g/>]]></text><rect/></svg>';
    const [root] = parser.parse(source);
    const text = root?.children[0];
    expect(text?.name).toBe('text#中&文');
    expect(source.slice(text?.start, text?.end)).toBe('<text\r\n id="中&amp;文">a<![CDATA[<g/>]]></text>');
    expect(source.slice(text?.start, text?.selectionEnd)).toBe('<text');
    expect(root?.children[1]?.start).toBe(source.indexOf('<rect/>'));
    expect(root?.children[1]?.end).toBe(source.indexOf('<rect/>') + 7);
  });

  it('supports SVG elements outside the CLI vocabulary and qualified names', () => {
    const [root] = parser.parse('<s:svg xmlns:s="http://www.w3.org/2000/svg"><s:defs><s:linearGradient id="paint"/></s:defs><s:path d="M0 0"/></s:svg>');
    expect(root?.name).toBe('s:svg');
    expect(root?.children[0]?.children[0]?.name).toBe('s:linearGradient#paint');
    expect(root?.children[1]?.name).toBe('s:path');
  });

  it.each(['', '<svg><g>', '<svg><g></svg>', '<svg id="', '<html/>', '<svg>&missing;</svg>', '<svg/><svg/>', '<!DOCTYPE svg SYSTEM "file:///secret"><svg/>'])
    ('returns no partial outline for invalid or unsupported XML: %s', source => {
      expect(parser.parse(source)).toEqual([]);
    });

  it('rebuilds after edits and recovers after incomplete XML without retaining old state', () => {
    expect(parser.parse('<svg><g id="before"/></svg>')[0]?.children[0]?.name).toBe('g#before');
    expect(parser.parse('<svg><g')).toEqual([]);
    expect(parser.parse('<svg>\n<circle id="after"/></svg>')[0]?.children[0]?.name).toBe('circle#after');
  });
});
