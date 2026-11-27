import type { PluginContext } from './PluginContext.js';
import type { PluginContributions } from './PluginContributions.js';
import { PluginRegistrationError } from './PluginRegistrationError.js';

/** 一次激活的暂存区。插件只得到四方法门面，不能触发 finish 或 close。 */
export class PluginRegistration {
  readonly #context: PluginContext;
  #pending: PluginContributions;
  #closed = false;
  #failed = false;
  #failure: unknown;

  public constructor(current: PluginContributions) {
    this.#pending = current;
    this.#context = Object.freeze({
      registerShape: (provider) => this.stage((state) => state.withShape(provider)),
      registerCommand: (command) => this.stage((state) => state.withCommand(command)),
      registerDecorator: (decorator) => this.stage((state) => state.withDecorator(decorator)),
      registerAttribute: (handler) => this.stage((state) => state.withAttribute(handler))
    } satisfies PluginContext);
  }

  public get context(): PluginContext {
    return this.#context;
  }

  public finish(): PluginContributions {
    this.requireOpen();
    this.close();
    if (this.#failed) {
      throw this.#failure;
    }
    return this.#pending;
  }

  public close(): void {
    this.#closed = true;
  }

  private stage(update: (state: PluginContributions) => PluginContributions): void {
    this.requireOpen();
    try {
      this.#pending = update(this.#pending);
    } catch (error) {
      // 插件捕获异常也不能把已经失败的批次重新变为可提交状态。
      if (!this.#failed) {
        this.#failed = true;
        this.#failure = error;
      }
      throw error;
    }
  }

  private requireOpen(): void {
    if (this.#closed) {
      throw new PluginRegistrationError('plugin registration context is closed');
    }
  }
}
