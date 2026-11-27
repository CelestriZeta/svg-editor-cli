import { ExtensionHostSuite } from './ExtensionHostSuite.js';

export async function run(): Promise<void> {
  await new ExtensionHostSuite().run();
}
