import { CommandResult } from '../contracts/CommandResult.js';
import type { CommandResultVisitor } from '../contracts/CommandResultVisitor.js';
import type { CommandPresenter } from '../contracts/CommandPresenter.js';

/** 在结果构造期完成插件展示，避免提交历史后才调用可能失败的插件代码。 */
export class PresentedCommandResult<T> extends CommandResult {
  readonly #text: string;

  public constructor(private readonly resultValue: T, presenter: CommandPresenter<T>) {
    super();
    this.#text = presenter.format(resultValue);
    if (typeof this.#text !== 'string') {
      throw new TypeError('command presenter must return text');
    }
    Object.freeze(this);
  }

  public readonly succeeded = true;

  public get value(): T {
    return this.resultValue;
  }

  public get text(): string {
    return this.#text;
  }

  public accept<R>(visitor: CommandResultVisitor<R>): R {
    return visitor.visitPresented(this);
  }
}
