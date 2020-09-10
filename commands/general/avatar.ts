import { Message, MessageEmbed } from 'discord.js'

export default {
  desc: 'Grabs users avatar link.',
  name: 'avatar',
  args: '[user: mention/id]',
  type: 'general',
  run: (message: Message, args: string[]) => {
    
    /**
     * If they mention the user then use that otherwise they should've sent the user id
     * args.shift() returns the first element and pops it out of the array.
     */
    const userId = message.mentions.members?.first()?.id || args.shift();

    // Ensure the user is in the guild
    const user = message.guild?.members.cache.get(userId || '');

    const embed = new MessageEmbed();
    const m = user  || message.member;

    if (!m)
      throw new Error("Somehow user doesn't exist");

    embed.setDescription(`[Link to Avatar](${m.user.avatarURL({ dynamic: true, size: 2048 })})`);
    embed.setImage(m.user.avatarURL({ dynamic: true, size: 2048 }) || "");

    message.channel.send(embed);
  }
}