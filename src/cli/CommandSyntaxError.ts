export class CommandSyntaxError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'CommandSyntaxError';
  }
}
