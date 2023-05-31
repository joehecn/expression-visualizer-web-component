import { html, TemplateResult } from 'lit';
// import '../src/expression-visualizer-web-component.js';
import '../src/helper/demo-helper.js';

export default {
  title: 'ExpressionVisualizerWebComponent',
  component: 'expression-visualizer-web-component',
  argTypes: {
    locale: { control: 'text' },
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
  hiddenexpression?: boolean;
  expression?: string;
  operators?: Array<{ name: string }>;
  funcs?: Array<{ name: string }>;
  variables?: Array<{ name: string; test: any }>;
}

// <expression-visualizer-web-component
//     .locale=${locale}
//     .hiddenexpression=${hiddenexpression}
//     .expression=${expression}
//     .operators=${operators}
//     .funcs=${funcs}
//     .variables=${variables}
//   >
//   </expression-visualizer-web-component>
const Template: Story<ArgTypes> = () => html` <demo-helper></demo-helper> `;

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
