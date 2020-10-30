import { Message } from 'discord.js';
import ViviBot from '../src/bot';

const msg = (client: ViviBot, message: Message) => {
  // Ignore bots
  if (message.author.bot) return;

  // If the guild doesn't exist it's a DM from a user. Default to v. as the prefix.
  const prefix = client.guildPrefix.get(message.guild?.id || '') || 'v.';

  if (message.content.toLowerCase().startsWith(prefix)) {
    // + 1 for the damn space.
    const [command, ...args] =
      message.content.substring(prefix.length).match(/\S+/g) || [];

    if (!command) return;
    //If the command isn't in the big ol' list.
    const clientCommand = client.commands.get(command.toLowerCase());
    if (!clientCommand) return;

    try {
      // Find the command and run it.
      clientCommand.run(message, args, client);
    } catch (e) {
      message.reply('something went wrong!', e);
      console.error(e);
    }
  }
};

export default msg;
