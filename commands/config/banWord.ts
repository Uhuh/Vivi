import { Message } from 'discord.js';
import ViviBot from '../../src/bot';
import {
  GET_BANNED_WORDS,
  NEW_BANNED_WORD,
  REMOVE_BANNED_WORD,
} from '../../src/database/database';

export const word = {
  desc: 'Add or remove a word or list of words for the banned list. Everything added will be case sensitive.\n',
  name: 'banword',
  args: '<add | remove> <list of words seperated by comma>',
  alias: ['bw'],
  type: 'config',
  run: async (message: Message, args: string[], client: ViviBot) => {
    if (!message.guild || !message.member?.permissions.has(['MANAGE_GUILD']))
      return;

    const { guild } = message;

    if (!args.length) {
      return message.reply(
        `you need to tell me if you're adding or deleting and what words!`
      );
    }

    const wordType = args.shift()?.toLowerCase();
    const plural = args.length > 1 ? 's' : '';

    switch (wordType) {
      case 'add':
        NEW_BANNED_WORD(guild.id, args.join('').split(',')).then(async () => {
          client.bannedWords.set(
            message.guild!.id,
            await GET_BANNED_WORDS(guild.id)
          );
        });
        message.reply(
          `successfully added the word${plural} to the banned list.`
        );
        break;
      case 'remove':
        REMOVE_BANNED_WORD(guild.id, args.join('').split(',')).then(
          async () => {
            message.channel.send(`Successfully removed the word${plural}.`);
            client.bannedWords.set(guild.id, await GET_BANNED_WORDS(guild.id));
          }
        );
        break;
    }
    return;
  },
};