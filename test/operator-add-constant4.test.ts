// npm test dist/test/operator-add.test.js

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

describe('operator add constant4', function t() {
  this.timeout(0);

  it('add', async () => {
    const expression = '';
    const variables = [
      { name: 'variable1', test: 1 },
      { name: 'variable2', test: true },
      { name: 'variable3', test: false },
      { name: 'variable4', test: 'abc' },
    ];
    const constantList = ['1', 'abc', 'true', 'false'];

    const el = await fixtureSync<ExpressionVisualizerWebComponent>(
      html`<expression-visualizer-web-component
        .expression=${expression}
        .variables=${variables}
        .constantList=${constantList}
      ></expression-visualizer-web-component>`
    );
    setTimeout(() => elementUpdated(el));
    await oneEvent(el, 'expression-inited');

    await sleep(300);

    // click button
    const button1 = el.shadowRoot!.querySelector(
      '#constbtn-false'
    ) as HTMLButtonElement;
    setTimeout(() => {
      button1.click();
    });
    await oneEvent(button1, 'click');
    await sleep(600);

    expect(el._blocks.length).to.equal(1);
  });
});
