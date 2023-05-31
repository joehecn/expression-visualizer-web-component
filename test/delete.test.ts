// npm test dist/test/delete.test.js

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

describe('delete', function t() {
  this.timeout(0);

  it('not', async () => {
    const expression = '1';
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

    expect(el._blocks.length).to.equal(1);
    expect(el._expression).to.equal('1');
    expect(el._result).to.equal(1);

    // click button
    const button = el.shadowRoot!.querySelector(
      '#not-btn'
    ) as HTMLButtonElement;
    setTimeout(() => button.click());
    await oneEvent(button, 'click');
    await sleep(600);

    // delete
    const deleteBtn = el.shadowRoot!.querySelector(
      '.delete-btn'
    ) as HTMLButtonElement;
    setTimeout(() => deleteBtn.click());
    await oneEvent(deleteBtn, 'click');
    await sleep(600);

    expect(el._result).to.equal(1);
  });
});
