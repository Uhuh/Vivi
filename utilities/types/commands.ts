export enum Category {
  general = 'general',
  config = 'config',
  mod = 'mod',
}

export type CategoryStrings = keyof typeof Category;

export interface Command {
  desc: string;
  name: string;
  args: string;
  alias: string[];
  type: Category;
  run: Function;
}
