import { Message, MessageEmbed } from 'discord.js';
import { missingPerms } from '../../utilities/functions/missingPerm';
import { COLOR } from '../../utilities/types/global';

export const status = {
  desc: 'Gets the server info',
  name: 'status',
  args: '',
  alias: ['s'],
  type: 'general',
  run: async function (message: Message) {
    const embed = new MessageEmbed();
    const { guild } = message;
    let textC = 0;
    let voiceC = 0;
    if (message.channel.type === 'DM') {
      return;
    }

    if (!guild) return;

    for (const [, channel] of guild.channels.cache) {
      if (channel.type === 'GUILD_TEXT') {
        textC++;
      } else if (channel.type === 'GUILD_VOICE') {
        voiceC++;
      }
    }

    embed
      .setColor(COLOR.AQUA)
      .setThumbnail(guild.iconURL({ dynamic: true }) || '')
      .setDescription(`**Server information for _${guild.name}_**`);

    embed
      .addField(`**OwnerID**`, `\`${guild.ownerId}\``)
      .addField(`**Users**`, `\`${guild.memberCount}\``)
      .addField(`**Text Channels**`, `\`${textC}\``)
      .addField(`**Voice Channels**`, `\`${voiceC}\``);

    message.channel
      .send({ embeds: [embed] })
      .catch(() => missingPerms(message, 'embed'));
  },
};
