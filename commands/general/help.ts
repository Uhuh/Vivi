import { Message, MessageEmbed } from 'discord.js';
import ViviBot from '../../src/bot';

const help = {
  desc: 'Sends a list of all available commands.',
  name: 'help',
  args: '',
  alias: ['cmds', 'h', 'commands'],
  type: '',
  run: async function (message: Message, args: string[], client: ViviBot) {
    const embed = new MessageEmbed();

    const { user } = client;

    if (
      args.length &&
      args[0] !== 'general' &&
      args[0] !== 'mod' &&
      args[0] !== 'config'
    )
      return;

    if (!user) return;

    const prefix = client.guildPrefix.get(message.guild?.id || '') || 'v.';

    embed
      .setTitle('**Commands**')
      .setColor(16711684)
      .setAuthor(user.username, user.avatarURL() || '')
      .setThumbnail(user.avatarURL() || '')
      .setFooter(`Replying to: ${message.author.tag}`)
      .setTimestamp(new Date());

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
    } else if (args.length === 1) {
      args[0] = args[0].toLowerCase();
      embed.setTitle(`**${args[0].toUpperCase()} commands**`);
      let commands = `***<> = required arguments, [] = optional.***\n\n`;
      for (const func of client.commands.values()) {
        if (args[0] === func.type) {
          if (
            func.type === 'mod' &&
            !message.member?.hasPermission('MANAGE_MESSAGES')
          )
            continue;
          embed.addField(`**${prefix}${func.name} ${func.args}**`, func.desc);
        }
      }
      embed.setDescription(commands);
    }

    message.channel.send({ embed });
  },
};

export default help;
