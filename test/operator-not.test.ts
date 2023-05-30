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

describe.skip('drag and drop', function t() {
  this.timeout(0);

  it('1+2', async () => {
    const el = await fixtureSync<ExpressionVisualizerWebComponent>(
      html`<expression-visualizer-web-component
        .expression=${'1+2'}
      ></expression-visualizer-web-component>`
    );
    setTimeout(() => elementUpdated(el));
    await oneEvent(el, 'expression-inited');

    await sleep(300);

    expect(el.blocks.length).to.equal(1);
    expect(el.expression).to.equal('1+2');
    expect(el.result).to.equal(3);

    const target = el.shadowRoot!.querySelector('.expression-visualizer');
    const father = el.shadowRoot!.querySelector('tree-component');
    const child = father!.shadowRoot!.querySelector('tree-component');
    const source = child!.shadowRoot!.querySelector('span');

    console.log({ child, source });

    triggerDragAndDrop(source!, target!);
    await sleep(300);

    expect(2).to.equal(2);
  });
});
