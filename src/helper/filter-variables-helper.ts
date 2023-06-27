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
    name: string;
    op: string;
    test: boolean | number | string;
    isFn?: string;
    hidden?: boolean;
  }[] = [];

  @state()
  private _errMsg = '';

  @query('#name-input')
  _name!: HTMLInputElement;

  @query('#test-input')
  _test!: HTMLInputElement;

  onChanged() {
    const filter = this.list.map(({ name, op, test, isFn }) => ({
      name,
      op,
      test,
      isFn,
    }));

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

    this.list.push({ name: name.value, op: '=', test: value });
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

  render() {
    return html`
      <div>
        <input id="name-input" placeholder="Input a variable name" />
        <input id="test-input" placeholder="Input a test value" />
        <button @click=${this.addItem}>Add</button>
        <div class="err-msg">${this._errMsg}</div>
      </div>

      <ul>
        ${map(
          this.list,
          (item, index) => html`
            <li>
              <label>
                ${item.name} = ${item.test}
                <button @click=${this.deleteItem(index)}>Delete</button>
              </label>
            </li>
          `
        )}
      </ul>
    `;
  }
}
