import { Message } from 'discord.js';
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
      return;

    try {
      // Find the command and run it.
      //console.log(args);
      clientCommand.run(message, args, client);
    } catch(e) {
      message.reply('something went wrong!', e);
      console.error(e);
    }
  }
};
  
export default msg;