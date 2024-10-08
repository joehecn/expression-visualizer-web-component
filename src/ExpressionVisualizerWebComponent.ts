import { v4 as uuidv4 } from 'uuid';
import { html, css, LitElement, PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { msg, localized } from '@lit/localize';
import { MathNode } from './type.js';

import { setLocale } from './localization.js';

import { loadScript } from './load-script.js';

import './tree-component.js';

const themeMap = new Map([
  [
    'light',
    {
      expressionVisualizerStyle: 'background-color: #fff;',
    },
  ],
  [
    'dark',
    {
      expressionVisualizerStyle: 'background-color: #000;',
    },
  ],
]);

const operatorMap = new Map([
  ['+', 'add'],
  ['-', 'subtract'],
  ['*', 'multiply'],
  ['/', 'divide'],
  ['>', 'larger'],

  ['<', 'smaller'],
  ['>=', 'largerEq'],
  ['<=', 'smallerEq'],
  ['==', 'equal'],
  ['!=', 'unequal'],

  ['and', 'and'],
  ['or', 'or'],
  ['xor', 'xor'],
  ['not', 'not'],
]);

const funcMap = new Map([
  ['equalText', true],
  ['belong', true],
  ['not belong', true],
  ['inrange', true],
  ['not inrange', true],
]);

/**
 * 自定义方法 判断数组中是否包含该值
 * @param val
 * @param arr
 * @returns
 */
function belong(val: any, str: string) {
  try {
    return str.split(',').includes(val);
  } catch (error) {
    return false;
  }
}

/**
 * 自定义方法 判断该数值是否在某个范围内
 * @param val
 * @param arr
 * @returns
 */
function inrange(val: number, arrStr: string) {
  let result = false;

  try {
    const arrs = arrStr.split('-');
    const [min, max] = arrs;
    result = val >= Number(min) && val <= Number(max);
  } catch (error: any) {
    result = false;
  }

  return result;
}
function _getScope(
  variables: {
    name: string;
    test: string | number | boolean;
    isExpression?: boolean | undefined;
    varib?: string | undefined;
    isHidden?: boolean | undefined;
    op?: string | undefined;
    isFn?: string | undefined;
  }[]
) {
  const scope: any = {};
  scope.belong = belong;
  scope.inrange = inrange;
  for (let i = 0; i < variables.length; i += 1) {
    const variable = variables[i];
    if (variable.isFn === 'belong' && typeof variable.test === 'string') {
      const [firstValue] = variable.test.split(',');
      scope[variable.name] = firstValue;
    } else if (variable.isFn === 'inrange') {
      if (typeof variable.test === 'string') {
        try {
          const arrs = JSON.parse(variable.test);
          const [min] = arrs;
          scope[variable.name] = min;
        } catch (error: any) {
          scope[variable.name] = -1;
        }
      }
    } else {
      scope[variable.name] = variable.test;
    }
  }

  return scope;
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

      if (['OperatorNode', 'FunctionNode'].includes(parentBlock.type)) {
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
  return blocks;
}

function _handleDragOver(e: DragEvent) {
  e.preventDefault();
  e.dataTransfer!.dropEffect = 'move';
}

async function _initMath() {
  // math
  if (!(window as any).math) {
    // await loadScript('https://unpkg.com/mathjs@11.8.0/lib/browser/math.js');
    await loadScript(
      'https://mega-automation.oss-cn-hongkong.aliyuncs.com/lib/unpkg.com_mathjs%4011.8.0_lib_browser_math.js'
    );
  }

  const hasMath = !!(window as any).math;

  return hasMath;
}
@localized()
export class ExpressionVisualizerWebComponent extends LitElement {
  static styles = css`
    html {
      color: #4e5969;
      font-family: SimSun, sans-serif;
    }
    .expression-visualizer {
      height: 200px;
      overflow-y: auto;
      padding: 20px;
    }
    .expression {
      display: flex;
      align-items: center;
    }
    .hidden.expression {
      display: none;
    }
    .hidden {
      display: none;
    }
    .tools {
      padding: 8px 0;
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

    .err-msg {
      color: red;
    }
    .title-name {
      display: inline-block;
      text-align: left;
      font-size: 14px;
      margin-right: 20px;
      width: 100px;
    }

    .optbtn {
      height: 20px;
      min-width: 20px;
      border-radius: 3px;
      background-color: #1bbef7;
      color: #fff;
      border: none;
      cursor: pointer;
    }
    .varbtn {
      height: 22px;
      border: none;
      cursor: pointer;
      color: #4e5969;
    }
    .varbtn:hover {
      border: 1px solid #1bbef7;
    }
    .delete-btn {
      color: #1bbef7;
      cursor: pointer;
      font-size: 14px;
    }
    .expression-cls {
      background-color: #f2f3f5;
      height: 32px;
      border: none;
      line-height: 32px;
    }

    .overall-style {
      border: 2px solid #eee;
      padding: 10px;
      border-radius: 10px;
    }
    .tox-editor-header {
      position: relative;
      background-color: #fff;
      border-bottom: none;
      box-shadow: 0 2px 2px -2px rgba(34, 47, 62, 0.1),
        0 8px 8px -4px rgba(34, 47, 62, 0.07);
      padding: 10px 8px 0px;
    }
    .tox-statusbar {
      align-items: center;
      background-color: #fff;
      border-top: 1px solid #e3e3e3;
      flex: 0 0 auto;
      font-size: 14px;
      font-weight: 400;
      min-height: 25px;
      overflow: hidden;
      padding: 0 8px;
      position: relative;
      text-transform: none;
      padding-top: 10px;
    }

    .expression-toolbar {
      display: flex;
      align-items: center;
      padding-top: 10px;
    }
  `;

  @property({ type: String }) theme: string = 'light';

  @property({ type: String }) locale = 'zh-Hant-HK';

  @property({ type: Boolean }) hiddenexpression = false;

  @property({ type: Boolean }) hiddenConstant = false;

  @property({ type: Array }) constantList: any[] = [];

  @property({ type: String }) expression = '';

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
  }[] = [
    { name: 'equalText' },
    { name: 'belong' },
    { name: 'inrange' },
    { name: 'not belong' },
    { name: 'not inrange' },
  ];

  @property({ type: Array }) variables: {
    name: string;
    test: string | number | boolean;
    isExpression?: boolean; // 是否是一个表达式
    varib?: string;
    isHidden?: boolean; // 是否隐藏该表达式
    op?: string;
    isFn?: string;
  }[] = [];

  @property({ type: String }) operatorMode:
    | 'default'
    | 'variable'
    | 'variableExpre' = 'default';

  @state()
  _curTheme = themeMap.get(this.theme);

  @state()
  _ss = '';

  @state()
  _hasMath = false;

  @state()
  _expression = '';

  @state()
  _blocks: MathNode[] = [];

  @state()
  _result: any = null;

  @state()
  _errMsg = '';

  @state()
  _variables: {
    name: string;
    test: string | number | boolean;
    isExpression?: boolean; // 是否是一个表达式
    varib?: string;
    isHidden?: boolean; // 是否隐藏该表达式
    op?: string;
    isFn?: string;
  }[] = [];

  @query('#newconstant-input')
  _input!: HTMLInputElement;

  private _expressionChanged() {
    const detail = {
      expression: this._expression,
      result: this._result,
      errMsg: this._errMsg,
    };
    const event = new CustomEvent('expression-changed', {
      detail,
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    this.dispatchEvent(event);
  }

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
    if (!this._expression) {
      this._result = '';
      return;
    }

    try {
      this._errMsg = '';
      const scope = _getScope(this.variables);
      this._result = (window as any).math.evaluate(this._expression, scope);
    } catch (error: any) {
      this._result = '';
      this._errMsg = error.message;
    }
  }

  private _getBlock() {
    if (this._blocks.length !== 1) return null;
    return this._blocks[0];
  }

  private _getExpression(block: MathNode) {
    const ctx: any = {};
    this._block2Node(block, ctx);

    if (ctx.node) {
      return ctx.node.toString();
    }

    return '';
  }

  private _generateExpression() {
    // 获取 block
    const block = this._getBlock();

    if (!block) {
      this._expression = '';
    } else {
      this._expression = this._getExpression(block);
    }

    this._evaluate();

    // 无论表达式有没有都要触发表达式改变方法
    this._expressionChanged();
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

  // 添加常量
  private _addConstantNode() {
    let { value }: { value: boolean | number | string } = this._input;
    if (!value) return;

    if (value === 'true') {
      value = true;
    } else if (value === 'false') {
      value = false;
    } else if (!Number.isNaN(Number(value))) {
      value = Number(value);
    }

    if (!this.constantList.includes(value)) {
      this.constantList.push(value);
      const event = new CustomEvent('variableList-changed', {
        detail: {
          constantList: this.constantList,
        },
        bubbles: true,
        composed: true,
        cancelable: true,
      });
      this.dispatchEvent(event);
    }

    const block = {
      type: 'ConstantNode',
      value,
      uuid: uuidv4(),
    };

    this._blocks = [block, ...this._blocks];

    this._input.value = '';

    // 表达式
    this._generateExpression();
  }

  // 从常数列表中添加常量
  private _addConstantNodeForm2List(constant: any) {
    return () => {
      let value: any;

      if (constant === undefined || constant === null) return;

      if (constant === 'true') {
        value = true;
      } else if (constant === 'false') {
        value = false;
      } else if (
        typeof constant !== 'boolean' &&
        !Number.isNaN(Number(constant))
      ) {
        value = Number(constant);
      } else {
        value = constant;
      }

      const block = {
        type: 'ConstantNode',
        value,
        uuid: uuidv4(),
      };

      this._blocks = [block, ...this._blocks];

      // 表达式
      this._generateExpression();
    };
  }

  private _handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      this._addConstantNode();
    }
  }

  // 添加运算符
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

      this._blocks = [block, ...this._blocks];

      // 表达式
      this._generateExpression();
    };
  }

  // 添加函数
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

      this._blocks = [block, ...this._blocks];

      // 表达式
      this._generateExpression();
    };
  }

  // 添加变量
  private _addSymbolNode(name: string) {
    return () => {
      const block = {
        type: 'SymbolNode',
        name,
        uuid: uuidv4(),
      };

      this._blocks = [block, ...this._blocks];

      // 表达式
      this._generateExpression();
    };
  }

  // 添加变量
  private _addSymbolNode2(variable: any) {
    return () => {
      let block: any;

      if (variable.isFn) {
        block = {
          args: [
            {
              type: 'SymbolNode',
              uuid: uuidv4(),
              path: 'args[0]',
              index: 0,
              name: variable.name,
            },
            {
              type: 'ConstantNode',
              value: variable.test,
              uuid: uuidv4(),
              path: 'args[1]',
              index: 1,
            },
          ],
          fn: {
            name: variable.isFn,
          },
          implicit: false,
          isPercentage: false,
          type: 'FunctionNode',
          uuid: uuidv4(),
        };
      } else {
        block = {
          uuid: uuidv4(),
          implicit: false,
          isPercentage: false,
          op: variable.op,
          fn: operatorMap.get(variable.op),
          args: [
            {
              type: 'SymbolNode',
              uuid: uuidv4(),
              path: 'args[0]',
              index: 0,
              name: variable.name,
            },
            {
              type: 'ConstantNode',
              value: variable.test,
              uuid: uuidv4(),
              path: 'args[1]',
              index: 1,
            },
          ],
          type: 'OperatorNode',
        };
      }

      this._blocks = [block, ...this._blocks];

      // 表达式
      this._generateExpression();
    };
  }

  // 添加变量
  private _addSymbolNode3(variable: any) {
    return () => {
      let block: any;

      if (variable.isFn) {
        block = {
          args: [
            {
              type: 'SymbolNode',
              uuid: uuidv4(),
              path: 'args[0]',
              index: 0,
              name: variable.name,
            },
            {
              type: 'ConstantNode',
              value: variable.test,
              uuid: uuidv4(),
              path: 'args[1]',
              index: 1,
            },
          ],
          fn: {
            name: variable.isFn,
          },
          implicit: false,
          isPercentage: false,
          type: 'FunctionNode',
          uuid: uuidv4(),
        };
      } else {
        let v1: any;
        let v2: any;
        // 如果是值为表达式 那么在所有表达式中寻找该表达式
        if (variable.isExpression) {
          const varib2 = this.variables.find(
            varib => variable.varib === varib.name
          )!;
          v1 = {
            type: 'SymbolNode',
            uuid: uuidv4(),
            path: 'args[0]',
            index: 0,
            name: variable.name,
          };
          v2 = {
            type: 'SymbolNode',
            uuid: uuidv4(),
            path: 'args[1]',
            index: 1,
            name: varib2.name,
          };
        } else {
          v1 = {
            type: 'SymbolNode',
            uuid: uuidv4(),
            path: 'args[0]',
            index: 0,
            name: variable.name,
          };
          v2 = {
            type: 'ConstantNode',
            value: variable.test,
            uuid: uuidv4(),
            path: 'args[1]',
            index: 1,
          };
        }
        block = {
          uuid: uuidv4(),
          implicit: false,
          isPercentage: false,
          op: variable.op,
          fn: operatorMap.get(variable.op),
          args: [v1, v2],
          type: 'OperatorNode',
        };
      }

      this._blocks = [block, ...this._blocks];

      // 表达式
      this._generateExpression();
    };
  }

  _addSymbolNodeIsMode(mode: string, variable: any) {
    if (mode === 'default') {
      return this._addSymbolNode(variable.name);
    }
    if (mode === 'variable') {
      return this._addSymbolNode2(variable);
    }
    if (mode === 'variableExpre') {
      return this._addSymbolNode3(variable);
    }
    return this._addSymbolNode(variable.name);
  }

  // 修改
  // 子组件上报事件
  // 拖拽一个表达式到另一个表达式的插槽
  private _handleChanged(e: CustomEvent) {
    e.preventDefault();

    const blocks: MathNode[] = JSON.parse(JSON.stringify(this._blocks));
    const { sourceId, targetId } = e.detail;
    const { node: sourceNode, parent: sourceParent } = this._findNodeAndParent(
      blocks,
      sourceId
    );
    const { node: targetNode, parent: targetParent } = this._findNodeAndParent(
      blocks,
      targetId
    );

    const { path, index } = sourceNode!;

    sourceNode!.path = targetNode!.path;
    sourceNode!.index = targetNode!.index;
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
      this._blocks = blocks;
    } else {
      this._blocks = blocks.filter(block => block.uuid !== sourceNode!.uuid);
    }

    // 表达式
    this._generateExpression();
  }

  // 修改
  // 拖拽表达式到画布空白处
  private _handleDrop() {
    return (e: DragEvent) => {
      e.preventDefault();

      if ((e.target as HTMLElement).className !== 'expression-visualizer')
        return;

      const blocks: MathNode[] = JSON.parse(JSON.stringify(this._blocks));

      const id = e.dataTransfer!.getData('text/plain');

      const { node, parent } = this._findNodeAndParent(blocks, id);

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
      this._blocks = [...blocks, node!];

      // 表达式
      this._generateExpression();
    };
  }

  // 删除 block
  private _deleteBlock(index: number) {
    return () => {
      this._blocks = this._blocks.filter((_, i) => i !== index);
      // 手动触发更新
      // this.requestUpdate();

      // 表达式
      this._generateExpression();
    };
  }

  // 将表达式字符串转换为 blocks
  private _setExpression(expression: string) {
    if (this._expression === expression) return;
    this._expression = expression;

    if (this._expression) {
      const node = (window as any).math.parse(this._expression);
      this._blocks = _node2Blocks(node);
      this._evaluate();
    }
  }

  connectedCallback() {
    super.connectedCallback();

    _initMath().then((hasMath: boolean) => {
      this._hasMath = hasMath;

      const detail = { hasMath };
      const event = new CustomEvent('expression-inited', {
        detail,
        bubbles: true,
        composed: true,
        cancelable: true,
      });
      this.dispatchEvent(event);
    });

    this.addEventListener('keydown', this._handleKeydown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this._handleKeydown);
  }

  willUpdate(changedProperties: PropertyValues<this>) {
    if (changedProperties.has('locale')) {
      setLocale(this.locale).then(() => {});
    }

    if (
      changedProperties.has('expression') ||
      changedProperties.has('_hasMath')
    ) {
      if (this._hasMath) {
        // 每当传入表达式字符串发生变化时，都会触发这个函数
        this._setExpression(this.expression);
      }
    }

    if (changedProperties.has('theme')) {
      this._curTheme = themeMap.get(this.theme);
    }

    if (changedProperties.has('variables')) {
      this._variables = this.variables.filter(varib => !varib.isHidden);
      const variableValue = this.variables.map(item => item.test);
      variableValue.forEach(constant => {
        if (!this.constantList.includes(constant)) {
          this.constantList.push(constant);
        }
      });
      // 如果math 还没有加载出来的话不执行计算表达式的方法
      if (this._hasMath) {
        this._generateExpression();
      }
      const event = new CustomEvent('variableList-changed', {
        detail: {
          constantList: this.constantList,
        },
        bubbles: true,
        composed: true,
        cancelable: true,
      });
      this.dispatchEvent(event);
    }
  }

  render() {
    return html`
      <div style="color:#4E5969" class="overall-style">
        <div class="tox-editor-header">
          <div
            class=${this.hiddenexpression ? 'hidden expression' : 'expression'}
          >
            <span class="title-name" style="margin-right:25px"
              >${msg('Expression')}:</span
            >
            <span class="block expression-cls">${this._expression}</span>
            <span class="equal">=</span>
            <span class="block expression-cls">${this._result}</span>
          </div>
          <div class="tools">
            <span class="title-name">${msg('Toolbar')}:</span>
            <input
              id="newconstant-input"
              class=${this.hiddenConstant ? 'hidden' : ''}
              placeholder=${msg('Enter a constant')}
            />
            <button
              id="addconstant-btn"
              style="color:#4E5969;"
              class=${this.hiddenConstant ? 'hidden' : ''}
              @click=${this._addConstantNode}
            >
              ${msg('Add constant')}
            </button>
            <span
              class=${this.hiddenConstant ? 'hidden' : 'split-group'}
            ></span>
            ${map(
              this.operators.filter(operator => operatorMap.has(operator.name)),
              operator => html`
                <button
                  class="optbtn"
                  .id=${`${operatorMap.get(operator.name)}-btn`}
                  @click=${this._addOperatorNode(operator.name)}
                >
                  ${operator.name}
                </button>
              `
            )}
            ${map(
              this.funcs.filter(func => funcMap.has(func.name)),
              func => html`
                <button
                  class="optbtn"
                  style="font-size: 12px"
                  .id=${`${func.name}-btn`}
                  @click=${this._addFunctionNode(func.name)}
                >
                  ${msg(func.name)}
                </button>
              `
            )}
            <div style="padding: 8px 0">
              <span class="title-name">${msg('Attribute List')}:</span>
              ${map(
                this._variables,
                variable => html`
                  <button
                    class="varbtn"
                    .id=${`${variable.name}-btn`}
                    @click=${this._addSymbolNodeIsMode(
                      this.operatorMode,
                      variable
                    )}
                  >
                    ${variable.name}
                    ${this.operatorMode === 'variable' ||
                    this.operatorMode === 'variableExpre'
                      ? variable.op
                      : '=='}
                    ${this.operatorMode === 'variableExpre'
                      ? variable.varib
                      : variable.test}
                  </button>
                `
              )}
            </div>
            <div
              class=${this.operatorMode === 'variable' ||
              this.operatorMode === 'variableExpre'
                ? 'hidden'
                : ''}
            >
              <span class="title-name">${msg('Constants List')}:</span>
              ${map(
                this.constantList,
                constant => html`
                  <button
                    class="varbtn"
                    .id=${`constbtn-${constant}`}
                    @click=${this._addConstantNodeForm2List(constant)}
                  >
                    ${constant}
                  </button>
                `
              )}
            </div>
          </div>
        </div>
        <div
          class="expression-visualizer"
          style=${this._curTheme!.expressionVisualizerStyle}
          droppable="true"
          .ondragover=${_handleDragOver}
          .ondrop=${this._handleDrop()}
        >
          ${map(this._blocks, (block, index) => {
            if (block.isUnknown) {
              return html``;
            }
            return html`
              <tree-component
                @changed=${this._handleChanged}
                .block=${block}
                .operatorMode=${this.operatorMode}
              ></tree-component>
              <button
                class="delete-btn"
                style="height: 26px; border: none; background-color: transparent"
                @click=${this._deleteBlock(index)}
              >
                ${msg('Delete')}
              </button>
              <br />
            `;
          })}
        </div>
        <div class="tox-statusbar">
          <div class="expression-toolbar">
            <span style="margin-right:25px">${msg('Expression')}:</span>
            <span class=${this._expression ? '' : 'hidden'}
              >${this._expression} = ${this._result}</span
            >
          </div>
          <span class="err-msg">${this._errMsg}</span>
        </div>
      </div>
    `;
  }
}

export { getLocale } from './localization.js';
export { allLocales } from './generated/locale-codes.js';
