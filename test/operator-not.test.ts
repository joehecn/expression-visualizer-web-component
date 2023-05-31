// npm test dist/test/operator-not.test.js

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

import { sleep, triggerDragAndDrop } from './test-helper.js';

afterEach(async () => {
  await resetMouse();
});

describe('operator not', function t() {
  this.timeout(0);

  it('not', async () => {
    const expression = '(1)*(2+3)>0 and equalText(variable4, "abc")';
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
    expect(el._expression).to.equal(
      '(1)*(2+3)>0 and equalText(variable4, "abc")'
    );
    expect(el._result).to.equal(true);

    // click button
    const button = el.shadowRoot!.querySelector(
      '#not-btn'
    ) as HTMLButtonElement;
    setTimeout(() => button.click());
    await oneEvent(button, 'click');
    await sleep(600);

    // drag and drop
    const [targetFather, sourceFather] = Array.from(
      el.shadowRoot!.querySelectorAll('tree-component')
    );
    console.log({ targetFather, sourceFather });
    const targetChild =
      targetFather!.shadowRoot!.querySelector('tree-component');
    const target = targetChild!.shadowRoot!.querySelector('span');
    const source = sourceFather!.shadowRoot!.querySelector('span');

    console.log({ source, target });

    triggerDragAndDrop(source!, target!);
    await sleep(600);

    expect(el._blocks.length).to.equal(1);
    expect(el._expression).to.equal(
      'not (1 * (2 + 3) > 0 and equalText(variable4, "abc"))'
    );
    expect(el._result).to.equal(false);
  });
});
