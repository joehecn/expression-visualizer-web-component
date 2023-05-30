import { html } from 'lit';
import {
  expect,
  oneEvent,
  fixtureSync,
  elementUpdated,
} from '@open-wc/testing';
import { ExpressionVisualizerWebComponent } from '../src/ExpressionVisualizerWebComponent.js';
import '../src/expression-visualizer-web-component.js';

import { sleep } from './test-helper.js';

describe('define properties', () => {
  it('1', async () => {
    const expression = 'equalText(variable4, "abc")';
    const variables = [
      { name: 'variable1', test: 1 },
      { name: 'variable2', test: true },
      { name: 'variable3', test: false },
      { name: 'variable4', test: 'abc' },
    ];

    const el = await fixtureSync<ExpressionVisualizerWebComponent>(
      html`<expression-visualizer-web-component
        .expression=${expression}
        .variables=${variables}
      ></expression-visualizer-web-component>`
    );
    setTimeout(() => elementUpdated(el));
    await oneEvent(el, 'expression-inited');

    await sleep(300);

    expect(el.blocks.length).to.equal(1);
    expect(el.expression).to.equal('equalText(variable4, "abc")');
    expect(el.result).to.equal(true);
  });
});
