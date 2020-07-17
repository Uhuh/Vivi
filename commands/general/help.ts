import { Message, MessageEmbed } from "discord.js";
import BowBot from "../../src/bot";

const help = {
  desc: 'Sends a list of all available commands.',
  name: 'help',
  args: '',
  type: '',
  run: async function (message: Message, _args: string[], client: BowBot) {
    const embed = new MessageEmbed();

    const {user} = client;

    if(!user) return;

    embed
      .setTitle('**Commands**')
      .setDescription(`<> = required arguments, [] = optional.`)
      .setColor(16711684)
      .setAuthor(user.username, user.avatarURL() || "")
      .setThumbnail(user.avatarURL() || "")
      .setFooter(`Replying to: ${message.author.tag}`)
      .setTimestamp(new Date());


    for (const func of client.commands.values()) {
      if(func.type === 'owner' || (func.type === 'admin' && !message.member?.hasPermission(["MANAGE_GUILD"]))) continue;
      embed.addField(`**${client.config.PREFIX}${func.name} ${func.args}**`, `${func.desc === "" ? "No desciption" : func.desc}`);
    }

    message.channel.send({ embed });
  }
}

export default help;