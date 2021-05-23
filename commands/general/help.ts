import { Message, MessageEmbed } from 'discord.js';
import ViviBot from '../../src/bot';
import { INVITE_URL } from '../../src/vars';
import { missingPerms } from '../../utilities/functions/missingPerm';
import {
  Category,
  CategoryStrings,
  COLOR,
} from '../../utilities/types/commands';

export const help = {
  desc: 'Sends a list of all available commands.',
  name: 'help',
  args: '',
  alias: ['cmds', 'h', 'commands'],
  type: '',
  run: async function (message: Message, args: string[], client: ViviBot) {
    const embed = new MessageEmbed();

    const key = (args[0]?.toLowerCase() || '') as CategoryStrings;

    if (args.length && !(key in Category)) return;

    const { user } = client;
    if (!user) return;

    const prefix = client.guildPrefix.get(message.guild?.id || '') || 'v.';

    embed
      .setTitle('**Commands**')
      .setColor(COLOR.AQUA)
      .setURL(INVITE_URL)
      .setAuthor(user.username, user.avatarURL() || '')
      .setThumbnail(user.avatarURL() || '')
      .setFooter(`Replying to: ${message.author.tag}`)
      .setTimestamp(new Date());

    /**
     * If no category is specified then list all categories.
     */
    if (!args.length) {
      embed.setTitle('**Command Categories**');
      embed.addField(`**General**`, `Try out \`${prefix}help general\``);
      if (message.member?.hasPermission('MANAGE_MESSAGES')) {
        embed.addField(
          `**Config**`,
          `Try out \`${prefix}config help\`\nAll config commands require MANAGE_GUILD permissions.`
        );
        embed.addField(`**Mod**`, `Try out \`${prefix}help mod\``);
      }
    } else if (key) {
      // If they specify a list type (general, config, etc) show those respective commands
      embed.setTitle(`**${key.toUpperCase()} commands**`);

      const hasPerm = message.member?.hasPermission('MANAGE_MESSAGES');
      client.commands
        .filter((c) => c.type === key)
        .filter((func) => !(func.type === Category.mod && !hasPerm))
        .forEach((func) =>
          embed.addField(`**${prefix}${func.name} ${func.args}**`, func.desc)
        );

      embed.setDescription('***<> = required arguments, [] = optional.***\n\n');
    }

    message.channel.send({ embed }).catch(() => missingPerms(message, 'embed'));
  },
};
