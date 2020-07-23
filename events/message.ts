import { Message, MessageEmbed, TextChannel } from 'discord.js';
import BowBot from '../src/bot';

const msg = (client: BowBot, message: Message) => {
  // Ignore bots
  if (message.author.bot) return;

  if (message.content.toLowerCase().startsWith(client.config.PREFIX)) {
    // + 1 for the damn space.
    const [command, ...args] = message.content.substring(client.config.PREFIX.length).match(/\S+/g) || [];

    if(!command) return;
    //If the command isn't in the big ol' list.
    const clientCommand = client.commands.get(command.toLowerCase());
    if (!clientCommand)
      return console.log("Command DNE");

    try {
      // Find the command and run it.
      //console.log(args);
      clientCommand.run(message, args, client);
    } catch(e) {
      message.reply('something went wrong!', e);
      console.error(e);
    }
  } else {
    const suggestionId = '729665823605522493';
    const popularId = '735710411382456360';
    if (message.channel.id === suggestionId) {
      message.react('⭐');
      const filter = (react: any) => react.emoji.name === '⭐';

      message.awaitReactions(filter, { time: 600000 })
        .then(collected => {
          if (collected.size >= 35) {
            const channel = message.guild?.channels.cache.get(popularId) as TextChannel;
            const embed = new MessageEmbed();
            embed.setTitle(`Popular suggestion. ${collected.size}⭐`)
              .setAuthor(message.author.tag)
              .setThumbnail(message.author.avatarURL({ dynamic: true }) || '')
              .setDescription(message.content)
              .setTimestamp(new Date());

            channel.send(embed);
          }
        })
        .catch(() => console.error(`Issues collecting reactions for popular.`))
    }
  }
};
  
export default msg;