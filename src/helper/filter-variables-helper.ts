import { LitElement, css, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';

@customElement('filter-variables-helper')
export class FilterVariablesHelper extends LitElement {
  static styles = css`
    .err-msg {
      color: red;
    }
  `;

  @property({ type: Array })
  list: {
    hidden?: boolean;
    name: string;
    test: string | number | boolean;
    isExpression?: boolean; // 是否是一个表达式
    varib?: string;
    isHidden?: boolean; // 是否隐藏该表达式
    op?: string;
    isFn?: string;
  }[] = [];

  @state()
  private _errMsg = '';

  @state()
  private _isVarib = false;

  @query('#name-input')
  _name!: HTMLInputElement;

  @query('#test-input')
  _test!: HTMLInputElement;

  @query('#op') _op!: HTMLInputElement;

  onChanged() {
    const filter = this.list.map(
      ({ name, op, test, isFn, isExpression, isHidden, varib }) => ({
        name,
        op,
        test,
        isFn,
        isExpression,
        isHidden,
        varib,
      })
    );

    const detail = { filter };
    const event = new CustomEvent('filter-changed', {
      detail,
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    this.dispatchEvent(event);
  }

  addItem() {
    this._errMsg = '';

    const { _name: name } = this;
    if (!name.value) {
      this._errMsg = 'Name is required';
      return;
    }

    const { _test: test } = this;
    if (!test.value) {
      this._errMsg = 'Test is required';
      return;
    }

    const { _op: op } = this;

    // 变量名不能重复
    if (this.list.find(item => item.name === name.value)) {
      this._errMsg = 'Name is duplicated';
      return;
    }

    let { value }: any = test;
    if (value === 'true') {
      value = true;
    } else if (value === 'false') {
      value = false;
    } else if (!Number.isNaN(Number(value))) {
      value = Number(value);
    }

    // name: string;
    // test: string | number | boolean;
    // isExpression?: boolean,  // 是否是一个表达式
    // varib?: '',
    // isHidden?: boolean, // 是否隐藏该表达式
    // op?: string;
    // isFn?: string;

    let obj: any = {};
    console.log(this._isVarib);
    if (this._isVarib) {
      obj = {
        name: name.value,
        test: 10,
        isExpression: true, // 是否是一个表达式
        varib: value,
        isHidden: false, // 是否隐藏该表达式
        op: op.value,
      };
    } else {
      obj = {
        name: name.value,
        test: value,
        isExpression: false, // 是否是一个表达式
        varib: value,
        isHidden: false, // 是否隐藏该表达式
        op: '==',
      };
    }

    this.list.push(obj);
    this._name.value = '';
    this._test.value = '';

    this.requestUpdate();

    this.onChanged();
  }

  deleteItem(index: number) {
    return () => {
      this.list.splice(index, 1);
      this.requestUpdate();

      this.onChanged();
    };
  }

  // 常熟输入框 是否隐藏
  checkedChanged(e: Event) {
    this._isVarib = (e.target as HTMLInputElement).checked;
  }

  render() {
    return html`
      <div>
        <input id="name-input" placeholder="Input a variable name" />
        <input id="op" />
        <input id="test-input" placeholder="Input a test value" />
        <button @click=${this.addItem}>Add</button>
        <input
          id="chceked"
          type="checkbox"
          .checked=${this._isVarib}
          @change=${this.checkedChanged}
        />
        <div class="err-msg">${this._errMsg}</div>
      </div>

      <ul>
        ${map(
          this.list,
          (item, index) => html`
            <li>
              <label>
                ${item.name} ${item.op} ${item.test}
                <button @click=${this.deleteItem(index)}>Delete</button>
              </label>
            </li>
          `
        )}
      </ul>
    `;
  }
}
