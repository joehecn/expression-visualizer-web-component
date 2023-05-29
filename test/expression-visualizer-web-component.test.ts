import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import {
  ExpressionVisualizerWebComponent,
  getLanguage,
} from '../src/ExpressionVisualizerWebComponent.js';
import '../src/expression-visualizer-web-component.js';
import { LocalePicker } from '../src/locale-picker.js';

// eslint-disable-next-line
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

  it('can change locale', async () => {
    const el = await fixture<ExpressionVisualizerWebComponent>(
      html`<expression-visualizer-web-component></expression-visualizer-web-component>`
    );
    const selectWrap = el.shadowRoot!.querySelector(
      '.locale-picker'
    ) as HTMLDivElement;
    const picker = selectWrap.getElementsByTagName(
      'locale-picker'
    )[0] as LocalePicker;
    const select = picker.shadowRoot!.querySelector(
      'select'
    ) as HTMLSelectElement;
    select.getElementsByTagName('option')[0].selected = true;
    select.dispatchEvent(new Event('change'));

    setTimeout(() => {
      expect(getLanguage()).to.equal('en');
    });
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

  it('1 = 1', async () => {
    const el = await fixture<ExpressionVisualizerWebComponent>(
      html`<expression-visualizer-web-component></expression-visualizer-web-component>`
    );
    await sleep(300);

    const input = el.shadowRoot!.querySelector(
      '#newconstant-input'
    ) as HTMLInputElement;
    console.log(input);
    input.value = '1';
    await sleep(1000);

    const button = el.shadowRoot!.querySelector(
      '#addconstant-btn'
    ) as HTMLButtonElement;
    console.log(button);
    button.click();
    await sleep(100);

    expect(el.blocks.length).to.equal(1);
    expect(el.expression).to.equal('1');
    expect(el.result).to.equal(1);
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
