import { SaxesParser } from 'saxes';

import { SvgOutlineElement } from './SvgOutlineElement.js';

export class SvgOutlineParser {
  public parse(source: string): readonly SvgOutlineElement[] {
    const parser = new SaxesParser({ xmlns: true });
    const roots: SvgOutlineElement[] = [];
    const stack: SvgOutlineElement[] = [];
    let start = 0;

    parser.on('error', (error) => {
      throw error;
    });
    parser.on('doctype', () => {
      throw new Error('DOCTYPE is not supported');
    });
    parser.on('opentagstart', () => {
      // 此事件发生在属性之前，避免属性值、注释或 CDATA 中的字符影响定位。
      start = source.lastIndexOf('<', parser.position - 1);
    });
    parser.on('opentag', (tag) => {
      if (
        roots.length === 0 &&
        (tag.local !== 'svg' ||
          (tag.uri !== '' && tag.uri !== 'http://www.w3.org/2000/svg'))
      ) {
        throw new Error('Expected an SVG root');
      }
      const id = tag.attributes['id']?.value;
      const element = new SvgOutlineElement(
        id ? `${tag.name}#${id}` : tag.name,
        start,
        start + 1 + tag.name.length
      );
      const parent = stack.at(-1);
      if (parent === undefined) {
        roots.push(element);
      } else {
        parent.append(element);
      }
      stack.push(element);
    });
    parser.on('closetag', () => {
      stack.pop()?.close(parser.position);
    });

    try {
      parser.write(source).close();
      return roots;
    } catch {
      // 输入中的半个标签是正常编辑状态；不向宿主暴露部分树或保留旧结果。
      return [];
    }
  }
}
