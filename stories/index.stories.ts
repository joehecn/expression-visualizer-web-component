import { html, TemplateResult } from 'lit';
import '../src/expression-visualizer-web-component.js';

export default {
  title: 'ExpressionVisualizerWebComponent',
  component: 'expression-visualizer-web-component',
  argTypes: {
    locale: { control: 'text' },
    hiddenlocalepicker: { control: 'boolean' },
    hiddenexpression: { control: 'boolean' },
    expresstion: { control: 'text' },
    operators: { control: 'object' },
    funcs: { control: 'object' },
    variables: { control: 'object' },
  },
};

interface Story<T> {
  (args: T): TemplateResult;
  args?: Partial<T>;
  argTypes?: Record<string, unknown>;
}

interface ArgTypes {
  locale?: string;
  hiddenlocalepicker?: boolean;
  hiddenexpression?: boolean;
  expression?: string;
  operators?: Array<{ name: string }>;
  funcs?: Array<{ name: string }>;
  variables?: Array<{ name: string; test: any }>;
}

const Template: Story<ArgTypes> = ({
  locale = 'zh-Hant-HK',
  hiddenlocalepicker = false,
  hiddenexpression = false,
  expression = '',
  operators = [
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
  ],
  funcs = [{ name: 'equalText' }],
  variables = [
    { name: 'variable1', test: 1 },
    { name: 'variable2', test: true },
    { name: 'variable3', test: false },
    { name: 'variable4', test: 'abc' },
  ],
}: ArgTypes) => html`
  <expression-visualizer-web-component
    .locale=${locale}
    .hiddenlocalepicker=${hiddenlocalepicker}
    .hiddenexpression=${hiddenexpression}
    .expression=${expression}
    .operators=${operators}
    .funcs=${funcs}
    .variables=${variables}
  >
  </expression-visualizer-web-component>
`;

export const Regular = Template.bind({});

// export const CustomHeader = Template.bind({});
// CustomHeader.args = {
//   header: 'My header',
// };

// export const CustomCounter = Template.bind({});
// CustomCounter.args = {
//   counter: 123456,
// };

// export const SlottedContent = Template.bind({});
// SlottedContent.args = {
//   slot: html`<p>Slotted content</p>`,
// };
// SlottedContent.argTypes = {
//   slot: { table: { disable: true } },
// };
