import { describe, expect, it } from 'vitest';

import { Main } from '../src/bootstrap/Main.js';

describe('project baseline', () => {
  it('provides a bootstrap entry point', () => {
    expect(new Main()).toBeInstanceOf(Main);
  });
});
