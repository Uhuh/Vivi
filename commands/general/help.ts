import {
  Message,
  MessageActionRow,
  MessageEmbed,
  MessageSelectMenu,
} from 'discord.js';
import ViviBot from '../../src/bot';
import { INVITE_URL, SUPPORT_URL } from '../../src/vars';
import { missingPerms } from '../../utilities/functions/missingPerm';
import { Category, CategoryStrings } from '../../utilities/types/commands';
import { COLOR, Emojis } from '../../utilities/types/global';

export const help = {
  desc: 'Sends a list of all available commands.',
  name: 'help',
  args: '',
  alias: ['cmds', 'h', 'commands'],
  type: '',
  run: async function (message: Message, args: string[], client: ViviBot) {
    const embed = new MessageEmbed();

    const { user } = client;
    if (!user) return;

    const selectMenu = new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId('select-help')
        .setPlaceholder('Pick a category')
        .addOptions([
          {
            label: 'Configure server settings',
            description:
              'Change bot settings for the server. Requires MANAGE_SERVER permissions.',
            value: `help-${Category.config}`,
          },
          {
            label: 'Mod commands',
            description: `Commands for server moderation. Requires moderation role.`,
            value: `help-${Category.mod}`,
          },
          {
            label: 'General commands',
            description: 'Basic commands everyone can use!',
            value: `help-${Category.general}`,
          },
        ])
    );

    embed
      .setTitle('Command Help')
      .setColor(COLOR.AQUA)
      .setURL(INVITE_URL)
      .setAuthor(user.username, user.avatarURL() || '')
      .setThumbnail(user.avatarURL() || '')
      .setFooter(`Replying to: ${message.author.tag}`)
      .setTimestamp(new Date());

    embed.setDescription(
      `${
        Emojis.vivilove
      } Thanks for bringing me aboard! The dropdown menus will tell you what you need, whether its general user commands or commands specific to a role.${''}\n\nIf you need more specific help, please join the [support server](${SUPPORT_URL}).`
    );

    message
      .reply({ embeds: [embed], components: [selectMenu] })
      .catch(() => missingPerms(message, 'embed'));
  },
};
