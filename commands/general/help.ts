import { Message, MessageEmbed } from "discord.js";
import SetsuBot from "../../src/bot";

const help = {
  desc: 'Sends a list of all available commands.',
  name: 'help',
  args: '',
  type: '',
  run: async function (message: Message, args: string[], client: SetsuBot) {
    const embed = new MessageEmbed();

    const {user} = client;

    if(!user) return;

    embed
      .setTitle('**Commands**')
      .setColor(16711684)
      .setAuthor(user.username, user.avatarURL() || "")
      .setThumbnail(user.avatarURL() || "")
      .setFooter(`Replying to: ${message.author.tag}`)
      .setTimestamp(new Date());

    if(!args.length) {
      embed.setTitle('**Command Categories**')
      embed.addField(`**General**`, `Try out \`${client.config.PREFIX}help general\``)
      if (message.member?.hasPermission("MANAGE_MESSAGES"))
        embed.addField(`**Admin**`, `Try out \`${client.config.PREFIX}help admin\``);
    } else if(args.length === 1) {
      args[0] = args[0].toLowerCase();
      if(args[0] !== 'general' &&  args[0] !== 'admin') {
        return;
      }
      embed.setTitle(`**${args[0].toUpperCase()} commands**`);
      let commands = `***<> = required arguments, [] = optional.***\n\n`;
      for (const func of client.commands.values()) {
        if(func.type === args[0]) {
          if(func.type === 'admin' && !message.member?.hasPermission("MANAGE_MESSAGES")) continue;
          commands += `**${client.config.PREFIX}${func.name} ${func.args}** - ${func.desc}\n`;
        }
      }
      embed.setDescription(commands);
    }

    message.channel.send({ embed });
  }
}

export default help;