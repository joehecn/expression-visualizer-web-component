// npm test dist/test/load-script.test.js

import { expect } from '@open-wc/testing';
import { loadScript } from '../src/load-script.js';

describe('load script', function t() {
  this.timeout(0);

  it('loadScript', async () => {
    try {
      const res = await loadScript(
        'https://cdnj.joehecn.co/ajax/libs/mathjax/3.2.0/es5/tex-svg.js'
      );
      expect(res).to.equal(
        'Failed to load https://cdnj.joehecn.co/ajax/libs/mathjax/3.2.0/es5/tex-svg.js'
      );
    } catch (e) {
      console.error(e);
    }
  });
});
