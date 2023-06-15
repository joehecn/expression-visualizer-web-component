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

  const element = e.target! as HTMLElement;
  element.classList.add('border-color');

  // console.log("---- drag over 1");

  e.dataTransfer!.dropEffect = 'move';
}

function _handleDragLeave(e: DragEvent) {
  e.preventDefault();
  const element = e.target! as HTMLElement;
  element.classList.remove('border-color');
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

    .variablemode {
      cursor: unset;
      border: 1px solid transparent;
    }

    .variablemode:not(.unknown):not(:has(:hover)):hover {
      border: 1px solid transparent;
      cursor: unset;
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

    .block.border-color {
      border: 1px solid #186fb0;
      background-color: #1b8df6;
      opacity: 0.5;
    }
  `;

  @property() block: MathNode = {
    // "uuid": "00000000-0000-0000-0000-000000000000",
    isUnknown: true,
    type: 'ConstantNode',
    value: 'U',
  };

  @property({ type: String }) operatorMode: 'default' | 'variable' = 'default';

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
    switch (block.type) {
      case 'ConstantNode': {
        if (block.isUnknown) {
          return html`
            <span
              id=${block.uuid}
              class=${this.operatorMode === 'variable'
                ? 'block leaf unknown variablemode'
                : 'block leaf unknown'}
              droppable=${this.operatorMode !== 'variable'}
              .ondragover=${_handleDragOver}
              .ondragleave=${_handleDragLeave}
              .ondrop=${this._handleDrop}
              >${block.value}</span
            >
          `;
        }

        // contenteditable="true"
        return html`
          <span
            id=${block.uuid}
            class=${this.operatorMode === 'variable'
              ? 'block leaf variablemode'
              : 'block leaf'}
            draggable=${this.operatorMode !== 'variable'}
            .ondragstart=${_handleDragStart}
            .ondragleave=${_handleDragLeave}
            >${block.value}</span
          >
        `;
      }
      case 'SymbolNode': {
        return html`
          <span
            id=${block.uuid}
            class=${this.operatorMode === 'variable'
              ? 'block leaf variablemode'
              : 'block leaf'}
            draggable=${this.operatorMode !== 'variable'}
            .ondragstart=${_handleDragStart}
            .ondragleave=${_handleDragLeave}
            >${block.name}</span
          >
        `;
      }
      case 'OperatorNode': {
        if (block.op === 'not') {
          return html`
            <span
              id=${block.uuid}
              class="block draggable"
              draggable="true"
              .ondragstart=${_handleDragStart}
              .ondragleave=${_handleDragLeave}
            >
              <span class="op">${block.op}</span>
              <tree-component
                .block=${block.args![0]}
                .operatorMode=${this.operatorMode}
              ></tree-component>
            </span>
          `;
        }

        return html`
          <span
            id=${block.uuid}
            class="block draggable"
            draggable="true"
            .ondragstart=${_handleDragStart}
            .ondragleave=${_handleDragLeave}
          >
            <tree-component
              .block=${block.args![0]}
              .operatorMode=${this.operatorMode}
            ></tree-component>
            <span class="op">${block.op}</span>
            <tree-component
              .block=${block.args![1]}
              .operatorMode=${this.operatorMode}
            ></tree-component>
          </span>
        `;
      }
      case 'FunctionNode': {
        return html`
          <span
            id=${block.uuid}
            class="block draggable"
            draggable="true"
            .ondragstart=${_handleDragStart}
            .ondragleave=${_handleDragLeave}
          >
            <span class="op">${(block.fn as { name: string }).name}(</span>
            <tree-component
              .block=${block.args![0]}
              .operatorMode=${this.operatorMode}
            ></tree-component>
            <span class="op">,</span>
            <tree-component
              .block=${block.args![1]}
              .operatorMode=${this.operatorMode}
            ></tree-component>
            <span class="op">)</span>
          </span>
        `;
      }
      case 'ParenthesisNode': {
        // 正常情况不会出现括号
        // 因为转换树时会丢掉括号
        return this._getTemplate(block.content!);
      }
      default: {
        // 正常情况不会出现 UNKNOWN
        return html` <span>UNKNOWN</span> `;
      }
    }
  }

  render() {
    return html`${this._getTemplate(this.block)}`;
  }
}
