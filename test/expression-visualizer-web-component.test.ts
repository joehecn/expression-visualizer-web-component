import { html } from 'lit';
import { fixture, expect, oneEvent } from '@open-wc/testing';
import {
  ExpressionVisualizerWebComponent,
  getLocale,
} from '../src/ExpressionVisualizerWebComponent.js';
import '../src/expression-visualizer-web-component.js';
import { LocalePicker } from '../src/locale-picker.js';

import { sendKeys, sendMouse, resetMouse } from '@web/test-runner-commands';

// eslint-disable-next-line
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function getMiddleOfElement(element: HTMLElement) {
  const { x, y, width, height } = element.getBoundingClientRect();

  return {
    x: Math.floor(x + window.pageXOffset + width / 2),
    y: Math.floor(y + window.pageYOffset + height / 2),
  };
}

afterEach(async () => {
  await resetMouse();
});

describe('ExpressionVisualizerWebComponent', () => {
  it('default property', async () => {
    const el = await fixture<ExpressionVisualizerWebComponent>(
      html`<expression-visualizer-web-component></expression-visualizer-web-component>`
    );

    expect(el.locale).to.equal('zh-Hant-HK');
    expect(el.hiddenlocalepicker).to.equal(false);
    expect(el.hiddenexpression).to.equal(false);
    expect(el.expression).to.equal('');
    expect(el.operators).to.have.deep.members([
      { name: '+' },
      { name: '-' },
      { name: '*' },
      { name: '/' },
      { name: '>' },

      { name: '<' },
      { name: '>=' },
      { name: '<=' },
      { name: '==' },
      { name: '!=' },

      { name: 'and' },
      { name: 'or' },
      { name: 'xor' },
      { name: 'not' },
    ]);
    expect(el.funcs).to.have.deep.members([{ name: 'equalText' }]);
    expect(el.variables.length).to.equal(0);
  });

  it('can hidden locale-picker and expression', async () => {
    const hiddenlocalepicker = true;
    const hiddenexpression = true;
    const el = await fixture<ExpressionVisualizerWebComponent>(
      html`<expression-visualizer-web-component
        .hiddenlocalepicker=${hiddenlocalepicker}
        .hiddenexpression=${hiddenexpression}
      ></expression-visualizer-web-component>`
    );
    expect(el.hiddenlocalepicker).to.equal(true);
    expect(el.hiddenexpression).to.equal(true);
  });

  it('define property expression', async () => {
    const el = await fixture<ExpressionVisualizerWebComponent>(
      html`<expression-visualizer-web-component
        .expression=${'1'}
      ></expression-visualizer-web-component>`
    );
    await sleep(600);

    expect(el.blocks.length).to.equal(1);
    expect(el.expression).to.equal('1');
    expect(el.result).to.equal(1);
  });

  it('define property variables', async () => {
    const variables = [
      { name: 'variable1', test: 1 },
      { name: 'variable2', test: true },
      { name: 'variable3', test: false },
      { name: 'variable4', test: 'abc' },
    ];
    const el = await fixture<ExpressionVisualizerWebComponent>(
      html`<expression-visualizer-web-component
        .variables=${variables}
      ></expression-visualizer-web-component>`
    );
    expect(el.variables).to.have.deep.members([
      { name: 'variable1', test: 1 },
      { name: 'variable2', test: true },
      { name: 'variable3', test: false },
      { name: 'variable4', test: 'abc' },
    ]);
  });

  it('can change locale', async () => {
    const el = await fixture<ExpressionVisualizerWebComponent>(
      html`<expression-visualizer-web-component></expression-visualizer-web-component>`
    );
    const picker = el.shadowRoot!.querySelector(
      'locale-picker'
    ) as LocalePicker;
    const select = picker.shadowRoot!.querySelector(
      'select'
    ) as HTMLSelectElement;
    select.getElementsByTagName('option')[0].selected = true;

    setTimeout(() => select.dispatchEvent(new Event('change')));

    await oneEvent(select, 'change');
    expect(getLocale()).to.equal('en');
  });

  it('send keydown Enter', async () => {
    const el = await fixture<ExpressionVisualizerWebComponent>(
      html`<expression-visualizer-web-component></expression-visualizer-web-component>`
    );
    await sleep(600);

    const input = el.shadowRoot!.querySelector(
      '#newconstant-input'
    ) as HTMLInputElement;

    input.value = '1';
    input.focus();

    await sendKeys({
      down: 'Enter',
    });

    expect(el.blocks.length).to.equal(1);
    expect(el.expression).to.equal('1');
    expect(el.result).to.equal(1);
  });

  it.only('drag and drop', async () => {
    const el = await fixture<ExpressionVisualizerWebComponent>(
      html`<expression-visualizer-web-component
        .expression=${'1+2'}
      ></expression-visualizer-web-component>`
    );
    await sleep(600);

    expect(el.blocks.length).to.equal(1);
    expect(el.expression).to.equal('1+2');
    expect(el.result).to.equal(3);
  });

  // it.only('block.isUnknown', async () => {
  //   const el = await fixture<ExpressionVisualizerWebComponent>(html`<expression-visualizer-web-component></expression-visualizer-web-component>`);
  //   await sleep(300);

  //   const button = el.shadowRoot!.querySelector('#add-btn') as HTMLButtonElement;
  //   button.click();
  //   await sleep(300);

  //   button.click();
  //   await sleep(300);

  //   const deleteBtn = el.shadowRoot!.querySelector('.delete-btn') as HTMLButtonElement;
  //   console.log(deleteBtn)
  //   deleteBtn.click();
  //   await sleep(300);

  //   expect(el.blocks.length).to.equal(1);
  // });

  it('passes the a11y audit', async () => {
    const el = await fixture<ExpressionVisualizerWebComponent>(
      html`<expression-visualizer-web-component></expression-visualizer-web-component>`
    );

    await expect(el).shadowDom.to.be.accessible();
  });
});

// click button
// const button = el.shadowRoot!.querySelector(
//   '#addconstant-btn'
// ) as HTMLButtonElement;
// setTimeout(() => button.click());
// await oneEvent(button, 'click');