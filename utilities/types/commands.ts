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

// Discord embed sidebar colors.
export enum COLOR {
  DEFAULT = 15158332,
  RED = 16711684,
  YELLOW = 15844367,
  GREEN = 3066993,
}
