import * as Discord from 'discord.js';
import ViviBot from '../../src/bot';

export const evalFunction = {
  desc: '',
  name: 'eval',
  args: '',
  alias: ['e'],
  type: 'owner',
  //@ts-ignore
  run: async (message: Discord.Message, args: string[], client: ViviBot) => {
    if (message.author.id !== '125492204234997761') return;

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

      message.channel.send(clean(evaled), { code: 'xl' });
    } catch (err) {
      message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
    }
  },
};

export default evalFunction;
