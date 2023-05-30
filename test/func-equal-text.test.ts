// npm test dist/test/func-equal-text.test.js

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

describe('func equal text', function t() {
  this.timeout(0);

  it('equal text', async () => {
    const expression = '';
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

    // click button
    const button = el.shadowRoot!.querySelector(
      '#equalText-btn'
    ) as HTMLButtonElement;
    setTimeout(() => button.click());
    await oneEvent(button, 'click');
    await sleep(600);

    expect(el.blocks.length).to.equal(1);
  });
});
