/** 插件提供展示实现，框架不枚举插件结果类型或提供其文案。 */
export interface CommandPresenter<T> {
  format(value: T): string;
}
