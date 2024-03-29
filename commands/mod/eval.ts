import * as Discord from 'discord.js';
import ViviBot from '../../src/bot';
import { BOT_OWNER } from '../../src/vars';
import { Category } from '../../utilities/types/commands';
import { Emojis } from '../../utilities/types/global';

export const evalFunction = {
  desc: '',
  name: 'eval',
  args: '',
  alias: ['e'],
  type: Category.owner,
  //@ts-ignore
  run: async (message: Discord.Message, args: string[], client: ViviBot) => {
    if (message.author.id !== BOT_OWNER) return;

    const clean = (text: string) => {
      if (typeof text === 'string')
        return text
          .replace(/`/g, '`' + String.fromCharCode(8203))
          .replace(/@/g, '@' + String.fromCharCode(8203));
      else return text;
    };

    try {
      const code = args.join(' ');
      let evaled = eval(code);

      if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);

      message.channel.send(clean(evaled));
    } catch (err) {
      //@ts-ignore
      message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
    }
  },
};
