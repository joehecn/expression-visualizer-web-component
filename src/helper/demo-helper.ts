import { html, css, LitElement } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';

import '../expression-visualizer-web-component.js';
import './locale-picker-helper.js';
import './filter-list-helper.js';
import './filter-variables-helper.js';
import { map } from 'lit/directives/map.js';

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

const _operators1 = [
  { name: 'and' },
  { name: 'or' },
  { name: 'xor' },
  { name: 'not' },
];

const _funcs = [
  { name: 'equalText' },
  { name: 'belong' },
  { name: 'isInRange' },
];

const _variables: {
  name: string;
  test: string | number | boolean;
  isExpression?: boolean; // 是否是一个表达式
  varib?: string;
  isHidden?: boolean; // 是否隐藏该表达式
  op?: string;
  isFn?: string;
}[] = [
  {
    name: 'v1',
    test: 10,
    isExpression: false, // 是否是一个表达式
    varib: '10',
    isHidden: true, // 是否隐藏该表达式
    op: '==',
  },
  {
    name: 'v2',
    test: 5,
    isExpression: true, // 是否是一个表达式
    varib: 'v1',
    isHidden: false, // 是否隐藏该表达式
    op: '>',
  },
];

const _operatorMode = 'variableExpre';

const _operatorModeList = ['default', 'variable', 'variableExpre'];

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

  @state() private operatorMode: string = _operatorMode;

  @state()
  private theme: 'light' | 'dark' = 'light';

  @state()
  private locale = 'zh-Hant-HK';

  @state()
  private hiddenexpression: boolean = false;

  @state()
  private hiddenConstant: boolean = false;

  @state()
  private constantList: any[] = [3, 4];

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
    test: string | number | boolean;
    isExpression?: boolean | undefined;
    varib?: string | undefined;
    isHidden?: boolean | undefined;
    op?: string | undefined;
    isFn?: string | undefined;
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

  variableListChange(e: CustomEvent) {
    // console.log( e.detail.constantList)
    this.constantList = e.detail.constantList;
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

  // 常熟输入框 是否隐藏
  onHiddenConstantChanged(e: Event) {
    this.hiddenConstant = (e.target as HTMLInputElement).checked;
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

  modeChanged(e: Event) {
    const newMode = (e.target as HTMLSelectElement).value;
    this.operatorMode = newMode;
  }

  render() {
    return html`
      <expression-visualizer-web-component
        .theme=${this.theme}
        .locale=${this.locale}
        .hiddenexpression=${this.hiddenexpression}
        .hiddenConstant=${this.hiddenConstant}
        .expression=${this.expression}
        .operators=${this.operatorMode === 'variable'
          ? _operators1
          : this.operators}
        .operatorMode=${this.operatorMode}
        .funcs=${this.operatorMode === 'variable' ? [] : this.funcs}
        .variables=${this.variables}
        .constantList=${this.constantList}
        @expression-inited=${handleExpressionInited}
        @expression-changed=${this.handleExpressionChanged}
        @variableList-changed=${this.variableListChange}
      ></expression-visualizer-web-component>
      <div class="properties-helper"></div>
      <h4>Properties</h4>
      <locale-picker-helper
        .locale=${this.locale}
        @locale-changed=${this.onLocaleChanged}
      ></locale-picker-helper>

      <div class="properties-helper">
        <label id="locale-label" for="locale-picker">operatorMode:</label>
        <select
          id="operator-mode"
          aria-label="operatormode"
          @change=${this.modeChanged}
        >
          ${_operatorModeList.map(
            mode =>
              html`<option
                value=${mode}
                ?selected=${mode === this.operatorMode}
              >
                ${mode}
              </option>`
          )}
        </select>
      </div>

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
      hiddenConstant:
      <input
        type="checkbox"
        id="hiddenConstant"
        name="hiddenConstant"
        .checked=${this.hiddenConstant}
        @change=${this.onHiddenConstantChanged}
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
      constantList:
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

      operators:
      ${map(
        this.constantList,
        constant => html`
          <button class="varbtn" .id=${`${constant}-constbtn`}>
            ${constant}
          </button>
        `
      )}
      <div class="properties-helper"></div>
      variables:
      <filter-variables-helper
        .list=${_variables}
        @filter-changed=${this.onVariablesChanged}
      ></filter-variables-helper>
    `;
  }
}
