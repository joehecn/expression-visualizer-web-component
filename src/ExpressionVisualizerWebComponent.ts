import { v4 as uuidv4 } from 'uuid';
import { html, css, LitElement } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { msg, localized } from '@lit/localize';
import { MathNode } from './type.js';

import { setLocale } from './localization.js';

import './tree-component.js';
import './locale-picker.js';

// msg('+');
// msg('-');
// msg('*');
// msg('/');
// msg('>');

// msg('<');
// msg('>=');
// msg('<=');
// msg('==');
// msg('!=');

// msg('and');
// msg('or');
// msg('xor');
// msg('not');
// msg('equalText');

const operatorMap = new Map();
operatorMap.set('+', 'add');
operatorMap.set('-', 'subtract');
operatorMap.set('*', 'multiply');
operatorMap.set('/', 'divide');
operatorMap.set('>', 'larger');

operatorMap.set('<', 'smaller');
operatorMap.set('>=', 'largerEq');
operatorMap.set('<=', 'smallerEq');
operatorMap.set('==', 'equal');
operatorMap.set('!=', 'unequal');

operatorMap.set('and', 'and');
operatorMap.set('or', 'or');
operatorMap.set('xor', 'xor');
operatorMap.set('not', 'not');

const funcMap = new Map();
funcMap.set('equalText', true);

let that: any = null;

// 缓存一下
let _scope: any = null;
function _getScope(
  variables: {
    name: string;
    test: string | number | boolean;
  }[]
) {
  if (_scope) return _scope;

  const scope: any = {};
  for (let i = 0; i < variables.length; i += 1) {
    const variable = variables[i];
    scope[variable.name] = variable.test;
  }
  _scope = scope;

  return _scope;
}

function _loadScript(src: string) {
  return new Promise((resolve: any) => {
    const script = document.createElement('script');
    function onLoaded() {
      if (script.parentElement) {
        script.parentElement.removeChild(script);
      }
      resolve();
    }
    script.src = src;
    script.onload = onLoaded;

    script.onerror = () => {
      // eslint-disable-next-line no-console
      console.error(
        `[main-loader] failed to load: ${src} check the network tab for HTTP status.`
      );
      onLoaded();
    };

    document.head.appendChild(script);
  });
}

function _node2Blocks(node: any) {
  let blocks: MathNode[] = [];

  const _ndWeakMap = new WeakMap();
  const _ndParentWeakMap = new WeakMap();

  // 副作用
  node.traverse((nd: any, path: string, parent: any) => {
    const uuid = uuidv4();

    const block = { uuid, ...nd, type: nd.type, path };
    _ndWeakMap.set(nd, block);
    _ndParentWeakMap.set(nd, parent);

    if (parent) {
      const parentBlock = _ndWeakMap.get(parent);

      if (parentBlock.type === 'OperatorNode') {
        const index = parseInt(path.replace('args[', ''), 10);
        block.index = index;
        parentBlock.args[index] = block;
      } else if (parentBlock.type === 'ParenthesisNode') {
        const grandParent = _ndParentWeakMap.get(parent);
        if (!grandParent) {
          blocks = [block];
        } else {
          const grandParentBlock = _ndWeakMap.get(grandParent);
          block.path = parentBlock.path;
          block.index = parentBlock.index;
          grandParentBlock.args[block.index] = block;
        }
      }
    } else {
      blocks = [block];
    }
  });

  // console.log(JSON.stringify(blocks, null, 2))
  return blocks;
}

function _handleDragOver(e: DragEvent) {
  e.preventDefault();

  // console.log("---- drag over 2");

  e.dataTransfer!.dropEffect = 'move';
}

function _handleDrop(e: DragEvent) {
  e.preventDefault();

  if (!that) return;

  // console.log("---- drop 2");
  if ((e.target as HTMLElement).className !== 'expression-visualizer') return;

  const id = e.dataTransfer!.getData('text/plain');
  const { node, parent } = that._findNodeAndParent(that.blocks, id);

  // console.log({ node, parent })
  if (!node || !parent) return;

  // 原来的位置替换为 UNKNOWN
  parent!.args!.splice(node!.index!, 1, {
    type: 'ConstantNode',
    value: 'U',
    uuid: uuidv4(),
    isUnknown: true,
    path: node!.path,
    index: node!.index!,
  });

  // e.target 一定是class="expression-visualizer" 的 div
  // that.blocks = [node!, ...that.blocks];
  that.blocks = [...that.blocks, node!];
  // console.log(JSON.stringify(that.blocks, null, 2))

  // 手动触发更新
  // that.requestUpdate();

  // 表达式
  // that._generateExpression();

  // 下面的代码是为了手动触发更新
  that._triggerUpdate();
}

function _handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && that) {
    that._addConstantNode();
  }
}

@localized()
export class ExpressionVisualizerWebComponent extends LitElement {
  static styles = css`
    .local-picker {
      padding: 8px 0;
    }
    .hidden.local-picker {
      display: none;
    }

    .expression-visualizer {
      background-color: #eee;
      min-height: 300px;
    }
    .expression {
      display: flex;
      align-items: center;
    }
    .hidden.expression {
      display: none;
    }
    .tools {
      padding: 8px 0;
    }
    .tools button {
      height: 26px;
      margin: 2px 0;
    }
    .tools input {
      height: 20px;
      margin: 2px 0;
    }
    .block {
      display: inline-block;
      border: 1px solid #ddd;
      padding: 2px 8px 0 8px;
      min-height: 28px;
      min-width: 32px;
    }
    .equal {
      display: inline-block;
      padding: 2px 8px 0 8px;
      min-height: 28px;
    }
    .split-group {
      display: inline-block;
      width: 8px;
    }
  `;

  @property({
    type: String,
    hasChanged(newVal: string, oldVal: string) {
      const changed = newVal !== oldVal;
      // 副作用
      setLocale(newVal).then(() => {
        // eslint-disable-next-line no-console
        console.log('---- locale changed');
      });
      return changed;
    },
  })
  locale = 'zh-Hant-HK';

  @property({ type: Boolean }) hiddenlocalepicker = false;

  @property({ type: Boolean }) hiddenexpression = false;

  @property({
    type: String,
    hasChanged(newVal: string, oldVal: string) {
      const changed = newVal !== oldVal;

      // 副作用
      if (changed && oldVal !== undefined && that) {
        const detail = { expression: newVal };
        const event = new CustomEvent('expression-changed', {
          detail,
          bubbles: true,
          composed: true,
          cancelable: true,
        });
        that.dispatchEvent(event);
      }

      return changed;
    },
  })
  expression = '';

  @property({ type: Array }) operators: {
    name: string;
  }[] = [
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

  @property({ type: Array }) funcs: {
    name: string;
  }[] = [{ name: 'equalText' }];

  @property({ type: Array }) variables: {
    name: string;
    test: string | number | boolean;
  }[] = [];

  @state()
  blocks: MathNode[] = [];

  @state()
  result: any = null;

  @query('#newconstant')
  input!: HTMLInputElement;

  private _block2Node(block: MathNode, ctx: any) {
    if (block.type === 'ConstantNode' && !block.isUnknown) {
      ctx.node = new (window as any).math.ConstantNode(block.value);
    } else if (block.type === 'SymbolNode') {
      ctx.node = new (window as any).math.SymbolNode(block.name);
    } else if (block.type === 'OperatorNode') {
      const _args: any[] = [];
      for (let i = 0; i < block.args!.length; i += 1) {
        const arg = block.args![i];
        const _ctx: any = {};
        this._block2Node(arg, _ctx);
        if (_ctx.node) {
          _args[i] = _ctx.node;
        } else {
          ctx.node = null;
          return;
        }
      }
      ctx.node = new (window as any).math.OperatorNode(
        block.op,
        block.fn,
        _args
      );
    } else if (block.type === 'FunctionNode') {
      const _args: any[] = [];
      for (let i = 0; i < block.args!.length; i += 1) {
        const arg = block.args![i];
        const _ctx: any = {};
        this._block2Node(arg, _ctx);
        if (_ctx.node) {
          _args[i] = _ctx.node;
        } else {
          ctx.node = null;
          return;
        }
      }
      ctx.node = new (window as any).math.FunctionNode(
        (block.fn as { name: string }).name,
        _args
      );
    } else {
      // 正常情况下不会走到这里
      ctx.node = null;
    }
  }

  private _evaluate() {
    if (!this.expression) this.result = '';

    const scope = _getScope(this.variables);

    this.result = (window as any).math.evaluate(this.expression, scope);
  }

  private _getBlock() {
    if (this.blocks.length !== 1) return null;
    return this.blocks[0];
  }

  private _getExpression(block: MathNode) {
    const ctx: any = {};
    this._block2Node(block, ctx);
    // console.log(ctx.node)
    if (ctx.node) {
      return ctx.node.toString();
    }
    return '';
  }

  private _generateExpression() {
    // 获取 block
    const block = this._getBlock();
    if (!block) {
      this.expression = '';
    } else {
      this.expression = this._getExpression(block);
    }

    this._evaluate();
  }

  private _findNodeAndParent(
    blocks: MathNode[],
    id: string,
    parent: MathNode | null = null
  ): { node: MathNode | null; parent: MathNode | null } {
    for (let i = 0; i < blocks.length; i += 1) {
      const block = blocks[i];
      if (block.uuid === id) {
        return { node: block, parent };
      }
      if (['OperatorNode', 'FunctionNode'].includes(block.type)) {
        const { node, parent: _parent } = this._findNodeAndParent(
          block.args!,
          id,
          block
        );
        if (node && _parent) return { node, parent: _parent };
      }
    }

    return { node: null, parent: null };
  }

  private _init() {
    // math
    if (!(window as any).math) {
      _loadScript('https://unpkg.com/mathjs@11.8.0/lib/browser/math.js').then(
        () => {
          // eslint-disable-next-line no-console
          console.log('---- math loaded', !!(window as any).math);

          if (!this.expression) return;

          const node = (window as any).math.parse(this.expression);
          this.blocks = _node2Blocks(node);

          this._evaluate();
        }
      );
    }
  }

  private _triggerUpdate() {
    // 在列表前面插入一个 UNKNOWN, setTimeout后再删除
    this.blocks = [
      {
        type: 'ConstantNode',
        value: 'U',
        uuid: uuidv4(),
        isUnknown: true,
        // path: 'args[0]',
        // index: 0,
      },
      ...this.blocks,
    ];
    // 手动触发更新
    // this.requestUpdate();
    setTimeout(() => {
      this.blocks = this.blocks.filter((_, i) => i !== 0);
      // 手动触发更新
      // this.requestUpdate();

      // 表达式
      this._generateExpression();
    });
  }

  private _changedHandler(e: CustomEvent) {
    e.preventDefault();

    // console.log("---- changed handler");
    // console.log(e.target);

    const { sourceId, targetId } = e.detail;
    const { node: sourceNode, parent: sourceParent } = this._findNodeAndParent(
      this.blocks,
      sourceId
    );
    const { node: targetNode, parent: targetParent } = this._findNodeAndParent(
      this.blocks,
      targetId
    );

    // console.log({ sourceNode, sourceParent, targetNode, targetParent })
    const { path, index } = sourceNode!;
    // console.log({ path, index })

    sourceNode!.path = targetNode!.path;
    sourceNode!.index = targetNode!.index;
    // console.log(targetNode!.path, targetNode!.index)
    targetParent!.args!.splice(targetNode!.index!, 1, sourceNode!);

    if (sourceParent) {
      sourceParent!.args!.splice(index!, 1, {
        type: 'ConstantNode',
        value: 'U',
        uuid: uuidv4(),
        isUnknown: true,
        path,
        index,
      });
    } else {
      this.blocks = this.blocks.filter(
        block => block.uuid !== sourceNode!.uuid
      );
    }

    // console.log(JSON.stringify(this.blocks, null, 2))

    // 下面的代码是为了手动触发更新
    this._triggerUpdate();
  }

  private _deleteBlock(index: number) {
    return () => {
      this.blocks = this.blocks.filter((_, i) => i !== index);
      // 手动触发更新
      // this.requestUpdate();

      // 表达式
      this._generateExpression();
    };
  }

  private _addConstantNode() {
    let { value }: { value: boolean | number | string } = this.input;
    if (!value) return;

    if (value === 'true') {
      value = true;
    } else if (value === 'false') {
      value = false;
    } else if (!Number.isNaN(Number(value))) {
      value = Number(value);
    }

    const block = {
      type: 'ConstantNode',
      value,
      uuid: uuidv4(),
    };

    this.blocks = [block, ...this.blocks];

    this.input.value = '';

    // 表达式
    this._generateExpression();
  }

  private _addOperatorNode(name: string) {
    return () => {
      let block: MathNode;
      if (name === 'not') {
        block = {
          uuid: uuidv4(),
          implicit: false,
          isPercentage: false,
          op: name,
          fn: operatorMap.get(name),
          args: [
            {
              type: 'ConstantNode',
              value: 'U',
              uuid: uuidv4(),
              isUnknown: true,
              path: 'args[0]',
              index: 0,
            },
          ],
          type: 'OperatorNode',
        };
      } else {
        block = {
          uuid: uuidv4(),
          implicit: false,
          isPercentage: false,
          op: name,
          fn: operatorMap.get(name),
          args: [
            {
              type: 'ConstantNode',
              value: 'U',
              uuid: uuidv4(),
              isUnknown: true,
              path: 'args[0]',
              index: 0,
            },
            {
              type: 'ConstantNode',
              value: 'U',
              uuid: uuidv4(),
              isUnknown: true,
              path: 'args[1]',
              index: 1,
            },
          ],
          type: 'OperatorNode',
        };
      }

      this.blocks = [block, ...this.blocks];

      // 表达式
      this._generateExpression();
    };
  }

  private _addFunctionNode(name: string) {
    return () => {
      const block = {
        uuid: uuidv4(),
        implicit: false,
        isPercentage: false,
        fn: {
          name,
        },
        args: [
          {
            type: 'ConstantNode',
            value: 'U',
            uuid: uuidv4(),
            isUnknown: true,
            path: 'args[0]',
            index: 0,
          },
          {
            type: 'ConstantNode',
            value: 'U',
            uuid: uuidv4(),
            isUnknown: true,
            path: 'args[1]',
            index: 1,
          },
        ],
        type: 'FunctionNode',
      };

      this.blocks = [block, ...this.blocks];

      // 表达式
      this._generateExpression();
    };
  }

  private _addSymbolNode(name: string) {
    return () => {
      const block = {
        type: 'SymbolNode',
        name,
        uuid: uuidv4(),
      };

      this.blocks = [block, ...this.blocks];

      // 表达式
      this._generateExpression();
    };
  }

  connectedCallback() {
    super.connectedCallback();
    that = this;
    this._init();
    this.addEventListener('keydown', _handleKeydown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', _handleKeydown);
  }

  render() {
    return html`
      <div
        class=${this.hiddenlocalepicker
          ? 'hidden local-picker'
          : 'local-picker'}
      >
        <locale-picker></locale-picker>
      </div>
      <div class=${this.hiddenexpression ? 'hidden expression' : 'expression'}>
        <span class="block">${this.expression}</span>
        <span class="equal">=</span>
        <span class="block">${this.result}</span>
      </div>
      <div class="tools">
        <input id="newconstant" placeholder=${msg('Enter a constant')} />
        <button @click=${this._addConstantNode}>${msg('Add constant')}</button>
        <span class="split-group"></span>
        ${map(
          this.operators.filter(operator => operatorMap.has(operator.name)),
          operator => html`
            <button @click=${this._addOperatorNode(operator.name)}>
              ${msg(operator.name)}
            </button>
          `
        )}
        <span class="split-group"></span>
        ${map(
          this.funcs.filter(func => funcMap.has(func.name)),
          func => html`
            <button @click=${this._addFunctionNode(func.name)}>
              ${msg(func.name)}
            </button>
          `
        )}
        <span class="split-group"></span>
        ${map(
          this.variables,
          variable => html`
            <button @click=${this._addSymbolNode(variable.name)}>
              ${variable.name} = ${variable.test}
            </button>
          `
        )}
      </div>
      <div
        class="expression-visualizer"
        droppable="true"
        .ondragover=${_handleDragOver}
        .ondrop=${_handleDrop}
      >
        ${map(this.blocks, (block, index) => {
          if (block.isUnknown) {
            return html``;
          }
          return html`
            <tree-component
              @changed=${this._changedHandler}
              .block=${block}
            ></tree-component>
            <button style="height: 26px;" @click=${this._deleteBlock(index)}>
              ${msg('Delete')}
            </button>
            <br />
          `;
        })}
      </div>
    `;
  }
}
