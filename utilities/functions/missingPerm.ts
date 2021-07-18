import { Message } from 'discord.js';

export const missingPerms = (msg: Message, perm: string) => {
  console.error(
    `Appear to be missing some permission[${perm}] for guild[${
      msg.guild?.id || 'no guild found'
    }]`
  );

  msg.channel
    .send(
      `I seem to be missing ${perm} perms, please make sure I have it to be able to function properly.`
    )
    .catch(() => {
      msg.author.send(
        `I appear to be missing send message perms in that channel. <#${msg.channel.id}>`
      );
    });
};
