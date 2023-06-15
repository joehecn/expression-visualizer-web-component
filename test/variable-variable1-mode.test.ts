// npm test dist/test/variable-variable1.test.js

import { html } from 'lit';
import {
  expect,
  oneEvent,
  fixtureSync,
  elementUpdated,
} from '@open-wc/testing';
import { resetMouse } from '@web/test-runner-commands';
import { ExpressionVisualizerWebComponent } from '../src/ExpressionVisualizerWebComponent.js';
import '../src/expression-visualizer-web-component.js';

import { sleep } from './test-helper.js';

afterEach(async () => {
  await resetMouse();
});

describe('variable-variable1-mode', function t() {
  this.timeout(0);

  it('variable1', async () => {
    const expression = '';
    const variables = [
      { name: 'variable1', test: 1, op: '>' },
      { name: 'variable2', test: true, op: '==' },
      { name: 'variable3', test: false, op: '!=' },
      { name: 'variable4', test: 'abc', op: '==', isFn: 'equalText' },
    ];

    const el = await fixtureSync<ExpressionVisualizerWebComponent>(
      html`<expression-visualizer-web-component
        .expression=${expression}
        .variables=${variables}
        .operatorMode=${'variable'}
      ></expression-visualizer-web-component>`
    );
    setTimeout(() => elementUpdated(el));
    await oneEvent(el, 'expression-inited');

    await sleep(300);

    // click button
    const button = el.shadowRoot!.querySelector(
      '#variable4-btn'
    ) as HTMLButtonElement;
    setTimeout(() => button.click());
    await oneEvent(button, 'click');
    await sleep(600);

    expect(el._blocks.length).to.equal(1);
  });
});
