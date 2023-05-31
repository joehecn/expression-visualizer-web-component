// npm test dist/test/shot-expression.test.js

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

describe('shot expression', () => {
  it('1', async () => {
    const expression = '(1)';
    const el = await fixtureSync<ExpressionVisualizerWebComponent>(
      html`<expression-visualizer-web-component
        .expression=${expression}
      ></expression-visualizer-web-component>`
    );
    setTimeout(() => elementUpdated(el));
    await oneEvent(el, 'expression-inited');

    await sleep(300);

    expect(el._blocks.length).to.equal(1);
    expect(el._expression).to.equal('(1)');
    expect(el._result).to.equal(1);
  });
});
