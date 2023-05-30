// npm test dist/test/change-locale.test.js

import { html } from 'lit';
import { fixture, expect, oneEvent } from '@open-wc/testing';
import {
  ExpressionVisualizerWebComponent,
  getLocale,
} from '../src/ExpressionVisualizerWebComponent.js';
import '../src/expression-visualizer-web-component.js';
import { LocalePicker } from '../src/locale-picker.js';

describe('change locale', () => {
  it('en', async () => {
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
});
