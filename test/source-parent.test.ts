// npm test dist/test/source-parent.test.js

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

describe('drag and drop', function t() {
  this.timeout(0);

  it('1+2', async () => {
    const el = await fixtureSync<ExpressionVisualizerWebComponent>(
      html`<expression-visualizer-web-component
        .expression=${'not(1+2)'}
      ></expression-visualizer-web-component>`
    );
    setTimeout(() => elementUpdated(el));
    await oneEvent(el, 'expression-inited');

    await sleep(300);

    expect(el._blocks.length).to.equal(1);
    expect(el._expression).to.equal('not(1+2)');
    expect(el._result).to.equal(false);

    const target1 = el.shadowRoot!.querySelector('.expression-visualizer');
    const father = el.shadowRoot!.querySelector('tree-component');
    const child = father!.shadowRoot!.querySelector('tree-component');
    const [child1, child2] = Array.from(
      child!.shadowRoot!.querySelectorAll('tree-component')
    );
    console.log({ child1, child2 });
    const source1 = child1!.shadowRoot!.querySelector('span');

    // console.log({ target1, source1 });

    triggerDragAndDrop(source1!, target1!);
    await sleep(600);

    const fatherTwo = el.shadowRoot!.querySelector('tree-component');
    console.log({ fatherTwo });

    const childTwo = fatherTwo!.shadowRoot!.querySelector('tree-component');
    const [child3, child4] = Array.from(
      childTwo!.shadowRoot!.querySelectorAll('tree-component')
    );
    console.log({ child3, child4 });

    const target2 = child3!.shadowRoot!.querySelector('span');
    const source2 = child4!.shadowRoot!.querySelector('span');
    console.log({ target2, source2 });

    triggerDragAndDrop(source2!, target2!);
    await sleep(300);

    expect(el._blocks.length).to.equal(2);
  });
});
