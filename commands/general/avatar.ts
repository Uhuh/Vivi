import { Message, MessageEmbed } from 'discord.js';
import { getUserId } from '../../utilities/functions/getUserId';
import { missingPerms } from '../../utilities/functions/missingPerm';

export const avatar = {
  desc: 'Grabs users avatar link.',
  name: 'avatar',
  args: '[user: mention/id]',
  alias: ['ava', 'a'],
  type: 'general',
  run: (message: Message, args: string[]) => {
    const userId = getUserId(message, args) || message.author.id;

    // Ensure the user is in the guild
    const memberMention = message.guild?.members.cache.get(userId);

    const embed = new MessageEmbed();
    const user = memberMention?.user || message.member?.user;

    if (!user) return;

    embed.setDescription(
      `[Link to Avatar](${user.avatarURL({
        dynamic: true,
        size: 2048,
      })})`
    );
    embed.setImage(user.avatarURL({ dynamic: true, size: 2048 }) || '');

    message.channel
      .send({ embeds: [embed] })
      .catch(() => missingPerms(message, 'embed'));
  },
};
