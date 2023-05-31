// npm test dist/test/string-true.test.js

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

describe('string true', function t() {
  this.timeout(0);

  it('true', async () => {
    const el = await fixtureSync<ExpressionVisualizerWebComponent>(
      html`<expression-visualizer-web-component></expression-visualizer-web-component>`
    );
    setTimeout(() => elementUpdated(el));
    await oneEvent(el, 'expression-inited');

    await sleep(300);

    const input = el.shadowRoot!.querySelector(
      '#newconstant-input'
    ) as HTMLInputElement;

    input.value = 'true';
    input.focus();

    await sendKeys({
      down: 'Enter',
    });

    expect(el._blocks.length).to.equal(1);
    expect(el._expression).to.equal('true');
    expect(el._result).to.equal(true);
  });
});
