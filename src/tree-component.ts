import { html, css, LitElement, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { MathNode } from './type.js';

function _handleDragStart(e: DragEvent) {
  if (e.target !== e.currentTarget) return;

  // console.log("---- drag start");
  const { id } = e.target! as HTMLElement;
  e.dataTransfer!.setData('text/plain', id);
  e.dataTransfer!.effectAllowed = 'move';
  e.dataTransfer!.dropEffect = 'move';
}

function _handleDragOver(e: DragEvent) {
  e.preventDefault();

  // console.log("---- drag over 1");

  e.dataTransfer!.dropEffect = 'move';
}

@customElement('tree-component')
export class TreeComponent extends LitElement {
  static styles = css`
    :host {
    }

    .block {
      display: inline-block;
      border: 1px solid #ccc;
    }
    .block:not(.unknown):not(:has(:hover)):hover {
      border: 1px solid blue;
      cursor: move;
    }

    .block.unknown {
      border: 1px solid red;
      color: transparent;
      user-select: none;
    }

    .draggable {
      padding: 2px;
      margin: 2px;
    }

    .leaf {
      padding: 4px 8px;
      margin: 2px;
      font-family: monospace;
      font-size: 16px;
    }

    .op {
      display: inline-block;
      padding: 0 2px;
      font-family: monospace;
      font-size: 16px;
      user-select: none;
      pointer-events: none;
    }
  `;

  @property() block: MathNode = {
    // "uuid": "00000000-0000-0000-0000-000000000000",
    isUnknown: true,
    type: 'ConstantNode',
    value: 'U',
  };

  private _handleDrop(e: DragEvent) {
    e.preventDefault();

    // console.log("---- drop 1");

    const sourceId = e.dataTransfer!.getData('text/plain');
    const targetId = (e.target! as HTMLElement).id;

    const detail = { sourceId, targetId };
    const event = new CustomEvent('changed', {
      detail,
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    this.dispatchEvent(event);
  }

  private _getTemplate(block: MathNode): TemplateResult {
    if (block.type === 'ConstantNode') {
      if (block.isUnknown) {
        return html`
          <span
            id=${block.uuid}
            class="block unknown leaf"
            droppable="true"
            .ondragover=${_handleDragOver}
            .ondrop=${this._handleDrop}
            >${block.value}</span
          >
        `;
      }

      return html`
        <span
          id=${block.uuid}
          class="block leaf"
          draggable="true"
          .ondragstart=${_handleDragStart}
          >${block.value}</span
        >
      `;
    }

    if (block.type === 'SymbolNode') {
      return html`
        <span
          id=${block.uuid}
          class="block leaf"
          draggable="true"
          .ondragstart=${_handleDragStart}
          >${block.name}</span
        >
      `;
    }

    if (block.type === 'OperatorNode') {
      if (block.op === 'not') {
        return html`
          <span
            id=${block.uuid}
            class="block draggable"
            draggable="true"
            .ondragstart=${_handleDragStart}
          >
            <span class="op">${block.op}</span>
            <tree-component .block=${block.args![0]}></tree-component>
          </span>
        `;
      }

      return html`
        <span
          id=${block.uuid}
          class="block draggable"
          draggable="true"
          .ondragstart=${_handleDragStart}
        >
          <tree-component .block=${block.args![0]}></tree-component>
          <span class="op">${block.op}</span>
          <tree-component .block=${block.args![1]}></tree-component>
        </span>
      `;
    }

    if (block.type === 'FunctionNode') {
      return html`
        <span
          id=${block.uuid}
          class="block draggable"
          draggable="true"
          .ondragstart=${_handleDragStart}
        >
          <span class="op">${(block.fn as { name: string }).name}(</span>
          <tree-component .block=${block.args![0]}></tree-component>
          <span class="op">,</span>
          <tree-component .block=${block.args![1]}></tree-component>
          <span class="op">)</span>
        </span>
      `;
    }

    if (block.type === 'ParenthesisNode') {
      // 正常情况不会出现括号
      // 因为转换树时会丢掉括号
      return this._getTemplate(block.content!);
    }

    // 正常情况不会出现 UNKNOWN
    return html` <span>UNKNOWN</span> `;
  }

  render() {
    return html`${this._getTemplate(this.block)}`;
  }
}
