/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { LocaleModule, configureLocalization } from '@lit/localize';
import { sourceLocale, targetLocales } from './generated/locale-codes.js';

import { templates as zhHans } from './generated/locales/zh-Hans.js';
import { templates as zhHantHK } from './generated/locales/zh-Hant-HK.js';

const map = new Map([
  ['zh-Hans', { templates: zhHans }],
  ['zh-Hant-HK', { templates: zhHantHK }],
]);

export const { getLocale, setLocale } = configureLocalization({
  sourceLocale,
  targetLocales,
  // loadLocale: (locale: string) => import(`./generated/locales/${locale}.js`)
  loadLocale: (locale: string) =>
    Promise.resolve(map.get(locale)) as Promise<LocaleModule>,
});
