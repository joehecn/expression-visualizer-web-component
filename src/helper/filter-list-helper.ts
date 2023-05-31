import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { msg, localized } from '@lit/localize';

@localized()
@customElement('filter-list-helper')
export class FilterListHelper extends LitElement {
  @property({ type: Array })
  list: {
    name: string;
    hidden?: boolean;
  }[] = [];

  onCheckedChanged(e: Event) {
    const target = e.target as HTMLInputElement;
    const name = target.parentElement?.textContent?.trim();
    const item = this.list.find(it => msg(it.name) === name);
    if (item) {
      item.hidden = !target.checked;
      this.requestUpdate();
    }

    const filter = this.list
      .filter(it => !it.hidden)
      .map(({ name: n }) => ({ name: n }));

    const detail = { filter };
    const event = new CustomEvent('filter-changed', {
      detail,
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    this.dispatchEvent(event);
  }

  render() {
    return html`
      ${map(
        this.list,
        item => html`
          <span>
            <label>
              ${msg(item.name)}
              <input
                type="checkbox"
                .checked=${!item.hidden}
                @change=${this.onCheckedChanged}
              />
            </label>
          </span>
        `
      )}
    `;
  }
}
