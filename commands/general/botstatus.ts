import { Message, MessageEmbed } from 'discord.js';
import * as OS from 'os';
import ViviBot from '../../src/bot';
import { missingPerms } from '../../utilities/functions/missingPerm';
import { Category } from '../../utilities/types/commands';
import { COLOR } from '../../utilities/types/global';

export const botstatus = {
  desc: 'Gives a list of things about the bot',
  name: 'botstatus',
  args: '',
  alias: ['bs'],
  type: Category.general,
  run: async function (message: Message, _args: string[], client: ViviBot) {
    const { user } = client;

    if (!user) return;

    const embed = new MessageEmbed();
    let userCount = 0;
    let channelCount = 0;

    for (const [, g] of client.guilds.cache) {
      userCount += g.memberCount;
      channelCount += g.channels.cache.size;
    }

    embed
      .setColor(COLOR.AQUA)
      .setTitle(`**Bot Status**`)
      .setThumbnail(user.avatarURL() || '')
      .addField(`**Bot Developer:**`, `Panku#0721`, true)
      .addField(
        `**The bot is in:**`,
        `${client.guilds.cache.size} servers`,
        true
      )
      .addField(`**The bot is watching:**`, `${userCount} users`, true)
      .addField(`**The bot is watching:**`, `${channelCount} channels`, true)
      .addField(`**Bot OS:**`, `${OS.platform()}`, true);

    message.channel
      .send({ embeds: [embed] })
      .catch(() => missingPerms(message, 'embed'));
  },
};
