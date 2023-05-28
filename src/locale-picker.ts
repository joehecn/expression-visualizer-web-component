/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { localized } from '@lit/localize';
import { getLocale, setLocale } from './localization.js';
import { allLocales } from './generated/locale-codes.js';

const localeNames: {
  [L in (typeof allLocales)[number]]: string;
} = {
  en: 'English',
  'zh-Hant-HK': '中文 (繁體)',
  'zh-Hans': '中文 (简体)',
};

function localeChanged(event: Event) {
  const newLocale = (event.target as HTMLSelectElement).value;
  if (newLocale !== getLocale()) {
    setLocale(newLocale).then(() => {
      // eslint-disable-next-line no-console
      console.log(`Locale picker setting locale to ${newLocale}`);
    });
  }
}

// Note we use updateWhenLocaleChanges here so that we're always up to date with
// the active locale (the result of getLocale()) when the locale changes via a
// history navigation.
@localized()
@customElement('locale-picker')
export class LocalePicker extends LitElement {
  render() {
    return html`
      <label id="locale-label" for="locale-picker"></label>
      <select
        id="locale-picker"
        aria-label="locale"
        aria-labelledby="locale-label"
        @change=${localeChanged}
      >
        ${allLocales.map(
          locale =>
            html`<option value=${locale} ?selected=${locale === getLocale()}>
              ${localeNames[locale]}
            </option>`
        )}
      </select>
    `;
  }
}
