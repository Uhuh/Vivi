export enum Category {
  general,
  config,
  mod,
  owner,
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
