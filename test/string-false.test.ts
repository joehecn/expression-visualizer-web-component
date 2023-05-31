// npm test dist/test/string-false.test.js

import { html } from 'lit';
import {
  expect,
  oneEvent,
  fixtureSync,
  elementUpdated,
} from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import { ExpressionVisualizerWebComponent } from '../src/ExpressionVisualizerWebComponent.js';
import '../src/expression-visualizer-web-component.js';

import { sleep } from './test-helper.js';

describe('string false', function t() {
  this.timeout(0);

  it('false', async () => {
    const el = await fixtureSync<ExpressionVisualizerWebComponent>(
      html`<expression-visualizer-web-component></expression-visualizer-web-component>`
    );
    setTimeout(() => elementUpdated(el));
    await oneEvent(el, 'expression-inited');

    await sleep(300);

    const input = el.shadowRoot!.querySelector(
      '#newconstant-input'
    ) as HTMLInputElement;

    input.value = 'false';
    input.focus();

    await sendKeys({
      down: 'Enter',
    });

    expect(el.blocks.length).to.equal(1);
    expect(el._expression).to.equal('false');
    expect(el.result).to.equal(false);
  });
});
