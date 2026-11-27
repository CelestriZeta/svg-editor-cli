/** 源码元素只保存语法层级和 UTF-16 偏移，不创建 CLI 领域图形。 */
export class SvgOutlineElement {
  readonly #children: SvgOutlineElement[] = [];
  #end: number;

  public constructor(
    private readonly label: string,
    private readonly startOffset: number,
    private readonly nameEndOffset: number
  ) {
    this.#end = nameEndOffset;
  }

  public get name(): string {
    return this.label;
  }

  public get start(): number {
    return this.startOffset;
  }

  public get selectionEnd(): number {
    return this.nameEndOffset;
  }

  public get end(): number {
    return this.#end;
  }

  public get children(): readonly SvgOutlineElement[] {
    return [...this.#children];
  }

  public append(child: SvgOutlineElement): void {
    this.#children.push(child);
  }

  public close(end: number): void {
    this.#end = end;
  }
}
