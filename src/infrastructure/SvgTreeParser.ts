import { SaxesParser } from 'saxes';
import type { SaxesTagNS } from 'saxes';

import { CanvasSize } from '../domain/document/CanvasSize.js';
import { DomainError } from '../domain/DomainError.js';
import { SvgAttributes } from './SvgAttributes.js';
import { SvgCanvas } from './SvgCanvas.js';
import type { SvgElement } from './SvgElement.js';
import { SvgElementFactory } from './SvgElementFactory.js';

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

export class SvgTreeParser {
  readonly #factory: SvgElementFactory;

  public constructor(factory = new SvgElementFactory()) {
    this.#factory = factory;
  }

  public parse(source: string): SvgCanvas {
    const parser = new SaxesParser({ xmlns: true });
    const stack: SvgElement[] = [];
    const rootChildren: SvgElement[] = [];
    let width: number | undefined;
    let height: number | undefined;
    let hasRoot = false;

    parser.on('error', (error) => {
      throw new DomainError(`invalid SVG XML: ${error.message}`);
    });
    parser.on('xmldecl', ({ encoding }) => {
      if (
        encoding !== undefined &&
        encoding.toLowerCase() !== 'utf-8'
      ) {
        throw new DomainError(`unsupported XML encoding: ${encoding}`);
      }
    });
    parser.on('doctype', () => {
      throw new DomainError('DOCTYPE is not supported');
    });
    parser.on('processinginstruction', ({ target }) => {
      throw new DomainError(`unsupported processing instruction: ${target}`);
    });
    parser.on('opentag', (tag) => {
      if (!hasRoot) {
        const size = this.readCanvas(tag);
        width = size.width;
        height = size.height;
        hasRoot = true;
        return;
      }

      const parent = stack.at(-1);
      this.requireShapeNamespace(tag);
      const element = this.#factory.create(tag.local, tag.attributes);
      if (parent === undefined) {
        rootChildren.push(element);
      } else {
        parent.addChild(element);
      }
      stack.push(element);
    });
    parser.on('closetag', () => {
      if (stack.length > 0) {
        stack.pop();
      }
    });
    parser.on('text', (text) => {
      this.appendText(stack, text);
    });
    parser.on('cdata', (text) => {
      this.appendText(stack, text);
    });

    parser.write(source).close();

    if (width === undefined || height === undefined || !hasRoot) {
      throw new DomainError('invalid SVG XML: missing svg root element');
    }

    return new SvgCanvas(new CanvasSize(width, height), rootChildren);
  }

  private readCanvas(tag: SaxesTagNS): CanvasSize {
    this.requireRootNamespace(tag);
    if (tag.local !== 'svg') {
      throw new DomainError(
        'root element must be SVG in the SVG namespace'
      );
    }

    const attributes = new SvgAttributes('svg', tag.attributes);
    attributes.requireSupported(['xmlns', 'width', 'height', 'viewBox']);
    const width = attributes.requireNumber('width');
    const height = attributes.requireNumber('height');
    attributes.requireViewBox(width, height);
    return new CanvasSize(width, height);
  }

  private requireRootNamespace(tag: SaxesTagNS): void {
    if (tag.uri !== SVG_NAMESPACE) {
      throw new DomainError(
        'root element must be SVG in the SVG namespace'
      );
    }
  }

  private requireShapeNamespace(tag: SaxesTagNS): void {
    if (tag.uri !== SVG_NAMESPACE) {
      throw new DomainError(
        `element is not in the SVG namespace: ${tag.name}`
      );
    }
  }

  private appendText(
    stack: readonly SvgElement[],
    text: string
  ): void {
    const parent = stack.at(-1);
    if (parent !== undefined) {
      parent.appendText(text);
      return;
    }
    if (text.trim().length > 0) {
      throw new DomainError('text content is not supported outside text elements');
    }
  }
}
