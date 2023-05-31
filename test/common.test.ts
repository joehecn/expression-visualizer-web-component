// npm test dist/test/common.test.js

import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { ExpressionVisualizerWebComponent } from '../src/ExpressionVisualizerWebComponent.js';
import '../src/expression-visualizer-web-component.js';

describe('common', () => {
  it('default property', async () => {
    const el = await fixture<ExpressionVisualizerWebComponent>(
      html`<expression-visualizer-web-component></expression-visualizer-web-component>`
    );

    expect(el.locale).to.equal('zh-Hant-HK');
    expect(el.hiddenexpression).to.equal(false);
    expect(el._expression).to.equal('');
    expect(el.operators).to.have.deep.members([
      { name: '+' },
      { name: '-' },
      { name: '*' },
      { name: '/' },
      { name: '>' },

      { name: '<' },
      { name: '>=' },
      { name: '<=' },
      { name: '==' },
      { name: '!=' },

      { name: 'and' },
      { name: 'or' },
      { name: 'xor' },
      { name: 'not' },
    ]);
    expect(el.funcs).to.have.deep.members([{ name: 'equalText' }]);
    expect(el.variables.length).to.equal(0);
  });

  it('can hidden locale-picker and expression', async () => {
    const hiddenexpression = true;
    const el = await fixture<ExpressionVisualizerWebComponent>(
      html`<expression-visualizer-web-component
        .hiddenexpression=${hiddenexpression}
      ></expression-visualizer-web-component>`
    );
    expect(el.hiddenexpression).to.equal(true);
  });

  it('passes the a11y audit', async () => {
    const el = await fixture<ExpressionVisualizerWebComponent>(
      html`<expression-visualizer-web-component></expression-visualizer-web-component>`
    );

    await expect(el).shadowDom.to.be.accessible();
  });
});
