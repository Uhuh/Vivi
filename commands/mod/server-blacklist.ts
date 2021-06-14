import * as Discord from 'discord.js';
import ViviBot from '../../src/bot';
import { PURGE_BANNED_WORDS } from '../../src/database/database';
import { BOT_OWNER } from '../../src/vars';

export const blacklist = {
  desc: '',
  name: 'blacklist',
  args: '',
  alias: ['e'],
  type: 'owner',
  run: async (message: Discord.Message, args: string[], client: ViviBot) => {
    if (message.author.id !== BOT_OWNER) return;

    PURGE_BANNED_WORDS(args[0]).then(() =>
      message.reply(`purged the banned words for that server.`)
    );
    client.bannedWords.delete(args[0]);
  },
};
