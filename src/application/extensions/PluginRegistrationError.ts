/** 注册错误由外层装配显示；本层不直接写终端或添加 error: 前缀。 */
export class PluginRegistrationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'PluginRegistrationError';
  }
}
