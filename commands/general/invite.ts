import { Message, MessageEmbed } from 'discord.js';
import ViviBot from '../../src/bot';

export default {
  desc: 'Get links related to Vivi like invite/support.',
  name: 'info',
  args: '',
  alias: ['i'],
  type: 'general',
  run: (message: Message, _args: string[], client: ViviBot) => {
    const embed = new MessageEmbed();
    const avatarUrl =
      'https://images.discordapp.net/avatars/773437651780894722/fd951f54c1e0d73fe69fd99d3e17ec78.png?size=256';
    const voteUrl = 'https://top.gg/bot/773437651780894722/vote';
    const inviteUrl =
      'https://discord.com/oauth2/authorize?client_id=773437651780894722&scope=bot&permissions=67497190';
    const serverUrl = 'https://discord.gg/AJ58SKFBNf';

    embed
      .setTitle('General info for Vivi')
      .setColor('#1ABC9C')
      .setDescription(
        `
Thanks for using Vivi! If you'd like to support her more use her in more servers, vote for her or even leave feedback in the support server!

Server count: ${client.guilds.cache.size} servers.
Latency is ${
          Date.now() - message.createdTimestamp
        }ms. API Latency is ${Math.round(client.ws.ping)}ms.

[Click to invite Vivi!](${inviteUrl})
[Click to Vote!](${voteUrl})
[Join the support server!](${serverUrl})
`
      )
      .setThumbnail(avatarUrl);

    message.channel.send(embed);
  },
};
