import { Message, TextChannel } from "discord.js";
import SetsuBot from "../../src/bot";
import { SET_REACT } from "../../src/setup_tables";

const reactmsg = {
  desc: ' Set a Reaction Role for a Message',
  name: 'reactmsg',
  args: '<Message ID> <Role ID> <Emoji> <Channel ID>',
  type: 'admin',
  run: async (message: Message, args: string[], client: SetsuBot) => {
    if (!message.guild || !message.member?.hasPermission(["MANAGE_GUILD"])) return;
    //msgID, RoleID, Emoji, channel id
    if (args.length < 4) return;

    const msgId = args[0];
    const roleId = args[1];
    let emojiId = args[2];
    const channelId = args[3];
    // Anounncements channel
    const channel = message.guild.channels.cache.get(channelId) as TextChannel;

    if (!channel) {
      return message.reply(`I can't find that channel, is the ID correct?`)
        .then(m => setTimeout(() => m.delete(), 5000));
    }

    const reactMessage = await channel.messages.fetch(msgId);

    if (!reactMessage) {
      // Delete after 5 seconds
      return message.reply(`I can't find that message, is the ID correct?`)
        .then(m => setTimeout(() => m.delete(), 5000));
    }

    /**
     * If it's a custom server emoji regex out the ID
     * and see if it's in the current server so the bot can use it.
     */
    const match = /:(\d+)>/.exec(emojiId);
    if (match) {
      const [, id] = match;
      if (!client.emojis.cache.get(id)) {
        return message.channel.send(`Couldn't find emoji ${emojiId}.`)
      }
      emojiId = id;
    }

    const role = message.guild.roles.cache.get(roleId);

    if (!role) {
      return message.reply(`I can't find that role, is the ID correct?`)
        .then(m => setTimeout(() => m.delete(), 5000));
    }

    SET_REACT(msgId, role.id, emojiId, channelId);

    client.reactRoles.set(msgId, { role_id: role.id, emoji: emojiId });

    return reactMessage.react(emojiId);
  }
}

export default reactmsg;