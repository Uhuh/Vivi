import { Message } from 'discord.js';

export default {
  desc: 'Clear messages in a channel.',
  name: 'purge',
  args: '<amount>',
  type: 'mod',
  run: (message: Message, args: string[]) => {
    let amount = Number(args[0]);
    const { member } = message;

    const channel = message.channel;

    if (!member?.hasPermission('MANAGE_MESSAGES')) {
      return message.react('👎');
    }
    if (Number.isNaN(amount)) {
      return message.reply(`Pass the amount of messages you want to purge.`);
    }

    // Delete the message sent
    message.delete();
    channel
      .bulkDelete(amount)
      .then(() => {
        console.log(`Bulk deleted ${amount}`);
      })
      // So Discord;s bulkdelete wont delete anything older than 14 days. So we gotta manually delete it.
      .catch(() => {
        for (; amount > 0; amount--) {
          const m = channel.lastMessage;
          if (!m) continue;
          m.delete();
        }
      });

    return;
  },
};
