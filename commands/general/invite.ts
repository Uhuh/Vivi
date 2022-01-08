import { Message, MessageEmbed } from 'discord.js';
import ViviBot from '../../src/bot';
import { AVATAR_URL, INVITE_URL, SUPPORT_URL, VOTE_URL } from '../../src/vars';
import { missingPerms } from '../../utilities/functions/missingPerm';
import { Category } from '../../utilities/types/commands';
import { COLOR } from '../../utilities/types/global';

export const invite = {
  desc: 'Get links related to Vivi like invite/support.',
  name: 'info',
  args: '',
  alias: ['i'],
  type: Category.general,
  run: (message: Message, _args: string[], client: ViviBot) => {
    const embed = new MessageEmbed();

    embed
      .setTitle('General info for Vivi')
      .setColor(COLOR.AQUA)
      .setDescription(
        `
Thanks for using Vivi! If you'd like to support her more use her in more servers, vote for her or even leave feedback in the support server!

Server count: ${client.guilds.cache.size} servers.
Latency is ${
          Date.now() - message.createdTimestamp
        }ms. API Latency is ${Math.round(client.ws.ping)}ms.

[Click to invite Vivi!](${INVITE_URL})
[Click to Vote!](${VOTE_URL})
[Join the support server!](${SUPPORT_URL})
`
      )
      .setThumbnail(AVATAR_URL);

    message.channel
      .send({ embeds: [embed] })
      .catch(() => missingPerms(message, 'embed'));
  },
};
