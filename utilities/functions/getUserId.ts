import { Message } from 'discord.js';
import { CLIENT_ID } from '../../src/vars';

/**
 * Get a users Id from a mention or from it being passed as a string
 * @param message Discord message object
 * @param args May contain a user ID if user was not mentioned.
 * @returns User Id.
 */
export function getUserId(message: Message, args: string[]) {
  return (
    message.mentions.members?.filter((u) => u.id !== CLIENT_ID).first()?.id ||
    args.shift()
  );
}
