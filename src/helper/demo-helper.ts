import { html, css, LitElement } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';

import '../expression-visualizer-web-component.js';
import './locale-picker-helper.js';
import './filter-list-helper.js';
import './filter-variables-helper.js';

function handleExpressionInited(e: CustomEvent) {
  // eslint-disable-next-line no-console
  console.log('[demo-helper]: handleExpressionInited:', e.detail);
}

const _operators = [
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
];

const _funcs = [{ name: 'equalText' }];

const _variables: {
  name: string;
  test: boolean | number | string;
}[] = [
  { name: 'variable1', test: 1 },
  { name: 'variable2', test: true },
  { name: 'variable3', test: false },
  { name: 'variable4', test: 'abc' },
];

@customElement('demo-helper')
export class DemoHelper extends LitElement {
  static styles = css`
    .properties-helper {
      padding-top: 16px;
    }
    #expression-input {
      min-width: 400px;
    }
  `;

  @state()
  private theme: 'light' | 'dark' = 'light';

  @state()
  private locale = 'zh-Hant-HK';

  @state()
  private hiddenexpression: boolean = false;

  @state()
  private expression: string = '(1)*(2+3)>0 and equalText(variable4, "abc")';

  @state()
  private operators: {
    name: string;
  }[] = _operators;

  @state()
  private funcs: {
    name: string;
  }[] = _funcs;

  @state()
  private variables: {
    name: string;
    test: boolean | number | string;
  }[] = _variables;

  @query('#expression-input')
  input!: HTMLInputElement;

  handleExpressionChanged(e: CustomEvent) {
    // eslint-disable-next-line no-console
    console.log('[demo-helper]: handleExpressionChanged:', e.detail);

    const { expression, errMsg } = e.detail;

    if (errMsg) return;

    if (this.expression === expression) return;

    this.expression = expression;
  }

  onLocaleChanged(e: CustomEvent) {
    // console.log(
    //   '[demo-helper]: onLocaleChanged:',
    //   this.locale,
    //   'to',
    //   e.detail.locale
    // );
    this.locale = e.detail.locale;
  }

  onHiddenExpressionChanged(e: Event) {
    this.hiddenexpression = (e.target as HTMLInputElement).checked;
  }

  onSendExpression() {
    if (this.input.value === this.expression) return;

    // eslint-disable-next-line no-console
    console.log('[demo-helper]: onSendExpression:', {
      inutValue: this.input.value,
      expression: this.expression,
    });

    this.expression = this.input.value;
  }

  onOperatorsChanged(e: CustomEvent) {
    this.operators = e.detail.filter;
  }

  onFuncsChanged(e: CustomEvent) {
    this.funcs = e.detail.filter;
  }

  onVariablesChanged(e: CustomEvent) {
    this.variables = e.detail.filter;
  }

  render() {
    return html`
      <expression-visualizer-web-component
        .theme=${this.theme}
        .locale=${this.locale}
        .hiddenexpression=${this.hiddenexpression}
        .expression=${this.expression}
        .operators=${this.operators}
        .funcs=${this.funcs}
        .variables=${this.variables}
        @expression-inited=${handleExpressionInited}
        @expression-changed=${this.handleExpressionChanged}
      ></expression-visualizer-web-component>
      <div class="properties-helper"></div>
      <h4>Properties</h4>
      <locale-picker-helper
        .locale=${this.locale}
        @locale-changed=${this.onLocaleChanged}
      ></locale-picker-helper>
      <div class="properties-helper"></div>
      hiddenexpression:
      <input
        type="checkbox"
        id="hiddenexpression"
        name="hiddenexpression"
        .checked=${this.hiddenexpression}
        @change=${this.onHiddenExpressionChanged}
      />
      <div class="properties-helper"></div>
      expression:
      <input
        id="expression-input"
        type="text"
        name="expression"
        .value=${this.expression}
      />
      <button @click=${this.onSendExpression}>Send</button>
      <div class="properties-helper"></div>
      operators:
      <filter-list-helper
        .list=${_operators}
        @filter-changed=${this.onOperatorsChanged}
      ></filter-list-helper>
      <div class="properties-helper"></div>
      funcs:
      <filter-list-helper
        .list=${_funcs}
        @filter-changed=${this.onFuncsChanged}
      ></filter-list-helper>
      <div class="properties-helper"></div>
      variables:
      <filter-variables-helper
        .list=${_variables}
        @filter-changed=${this.onVariablesChanged}
      ></filter-variables-helper>
    `;
  }
}
