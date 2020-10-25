import { Message } from 'discord.js';

const hug = {
  desc: 'Hug a user.',
  name: 'hug',
  args: '<user mention>',
  type: 'general',
  run: (message: Message) => {
    const user = message.mentions.members?.first();
    message.delete();

    if (!user) {
      return message.reply(`It's kinda lonely...`);
    } else if (user === message.member) {
      return message.reply(`do you think this is funny?`);
    }
    return message.reply(`you hugged <@${user.id}>`);
  },
};

export default hug;
