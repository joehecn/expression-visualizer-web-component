export type MathNode = {
  uuid?: string;
  isUnknown?: boolean; // 用于标记 UNKNOWN
  type: string;
  name?: string;
  value?: boolean | number | string;
  op?: string;
  fn?: string | { name: string };
  args?: MathNode[];
  content?: MathNode;
  path?: string;
  index?: number;
  implicit?: boolean;
  isPercentage?: boolean;
};
