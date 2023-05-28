import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { ExpressionVisualizerWebComponent } from '../src/ExpressionVisualizerWebComponent.js';
import '../src/expression-visualizer-web-component.js';

describe('ExpressionVisualizerWebComponent', () => {
  it('has a default header "Hey there" and counter 5', async () => {
    const el = await fixture<ExpressionVisualizerWebComponent>(
      html`<expression-visualizer-web-component></expression-visualizer-web-component>`
    );

    expect(el.hiddenexpression).to.equal(false);
    // expect(el.counter).to.equal(5);
  });

  // it('increases the counter on button click', async () => {
  //   const el = await fixture<ExpressionVisualizerWebComponent>(html`<expression-visualizer-web-component></expression-visualizer-web-component>`);
  //   el.shadowRoot!.querySelector('button')!.click();

  //   // expect(el.counter).to.equal(6);
  // });

  // it('can override the header via attribute', async () => {
  //   const el = await fixture<ExpressionVisualizerWebComponent>(html`<expression-visualizer-web-component header="attribute header"></expression-visualizer-web-component>`);

  //   // expect(el.header).to.equal('attribute header');
  // });

  it('passes the a11y audit', async () => {
    const el = await fixture<ExpressionVisualizerWebComponent>(
      html`<expression-visualizer-web-component></expression-visualizer-web-component>`
    );

    await expect(el).shadowDom.to.be.accessible();
  });
});
