import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { allLocales } from '../generated/locale-codes.js';

const localeNames: {
  [L in (typeof allLocales)[number]]: string;
} = {
  en: 'English',
  'zh-Hant-HK': '中文 (繁體)',
  'zh-Hans': '中文 (简体)',
};

@customElement('locale-picker-helper')
export class LocalePickerHelper extends LitElement {
  @property({ type: String }) locale = 'zh-Hant-HK';

  localeChanged(e: Event) {
    const newLocale = (e.target as HTMLSelectElement).value;
    // console.log(
    //   '[locale-picker]: localeChanged:',
    //   this.locale,
    //   'to',
    //   newLocale
    // );

    if (newLocale === this.locale) return;

    const detail = { locale: newLocale };
    const event = new CustomEvent('locale-changed', {
      detail,
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    this.dispatchEvent(event);
  }

  render() {
    return html`
      <label id="locale-label" for="locale-picker">Locale:</label>
      <select
        id="locale-picker"
        aria-label="locale"
        aria-labelledby="locale-label"
        @change=${this.localeChanged}
      >
        ${allLocales.map(
          locale =>
            html`<option value=${locale} ?selected=${locale === this.locale}>
              ${localeNames[locale]}
            </option>`
        )}
      </select>
    `;
  }
}
