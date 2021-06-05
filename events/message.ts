import { Message } from 'discord.js';
import ViviBot from '../src/bot';
import { CLIENT_ID } from '../src/vars';
import { generateCaptcha } from '../utilities/functions/captcha';

const msg = (client: ViviBot, message: Message) => {
  // Ignore bots
  if (message.author.bot) return;

  if (message.content.includes('captcha')) {
    // For testing purposes.
    generateCaptcha(message);
  }
  // If the guild doesn't exist it's a DM from a user. Default to v. as the prefix.
  const prefix = client.guildPrefix.get(message.guild?.id || '') || 'v.';
  const prefixUsed = message.content.startsWith(prefix);
  const clientMention = message.mentions.members?.first()?.id;

  if (CLIENT_ID === clientMention || prefixUsed) {
    // If prefix is used get its length, otherwise they mentioned and there SHOULD be a space after the mention.
    const length = prefixUsed
      ? prefix.length
      : message.content.split(' ')[0].length;

    const [command, ...args] =
      message.content.substring(length).match(/\S+/g) || [];

    if (!command) return;
    //If the command isn't in the big ol' list.
    let clientCommand = client.commands.get(command.toLowerCase());
    // Possible alias was used instead
    if (!clientCommand) {
      clientCommand = client.commands.find((f) =>
        f.alias.includes(command.toLowerCase())
      );
    }
    if (!clientCommand) return;

    try {
      // Find the command and run it.
      clientCommand.run(message, args, client);
    } catch (e) {
      message.reply(
        'something went wrong! Please join the support server at discord.gg/C9skyMBn33 and report this issue.',
        e
      );
      console.error(e);
    }
  }
};

export default msg;
