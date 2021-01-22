import { Message, TextChannel } from 'discord.js';

export default {
  desc: 'Clear messages in a channel.',
  name: 'purge',
  args: '<amount>',
  alias: ['p'],
  type: 'mod',
  run: (message: Message, args: string[]) => {
    let amount = Number(args[0]);
    const { member } = message;

    const channel = message.channel as TextChannel;

    if (!member?.hasPermission('MANAGE_MESSAGES')) {
      return message.react('👎');
    }
    if (Number.isNaN(amount)) {
      return message.reply(`Pass the amount of messages you want to purge.`);
    }
    // Delete the message sent
    message
      .delete()
      .then(() => {
        channel
          .bulkDelete(amount)
          // So Discord;s bulkdelete wont delete anything older than 14 days. So we gotta manually delete it.
          .catch(() => {
            for (; amount > 0; amount--) {
              const m = channel.lastMessage;
              if (!m) continue;
              m.delete();
            }
          });
      })
      .catch(() => message.reply(`I don't have manage message perms.`));

    return;
  },
};
