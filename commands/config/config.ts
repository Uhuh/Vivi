import { Message, MessageEmbed, TextChannel } from 'discord.js';
import ViviBot from '../../src/bot';
import {
  ADD_CHANNEL_WHITELIST,
  ADD_JOIN_ROLE,
  GENERATE_GUILD_CONFIG,
  GET_BANNED_WORDS,
  GET_GUILD_CONFIG,
  GUILD_JOIN_ROLES,
  NEW_BANNED_WORD,
  REMOVE_BANNED_WORD,
  REMOVE_CHANNEL_WHITELIST,
  REMOVE_JOIN_ROLE,
  REMOVE_MUTE_ROLE,
  SET_BANNED_MSG,
  SET_GUILD_PREFIX,
  SET_MAX_WARNS,
  SET_MOD_CHANNEL,
  SET_MUTE_ROLE,
  SET_SERVER_CHANNEL,
  SET_WARN_EXPIRE,
} from '../../src/database/database';

const config = {
  desc: 'Show the servers current config',
  name: 'config',
  args: '[help]',
  alias: [],
  type: 'config',
  run: async (message: Message, args: string[], client: ViviBot) => {
    const { guild } = message;
    if (!guild || !message.member?.hasPermission(['MANAGE_GUILD'])) return;

    if (args.length && args[0].toLowerCase() === 'setup') {
      return setup.run(message);
    }

    const guildConfig = await GET_GUILD_CONFIG(guild.id);

    if (!guildConfig) {
      return message.reply(
        `I couldn't find a config for this guild. I might be broken, try running v.setup`
      );
    }

    if (args.length === 0) {
      const embed = new MessageEmbed();
      embed
        .setTitle(`Configuration for **${guild.name}**`)
        .setThumbnail(guild.iconURL() || '')
        .addField('Guild prefix:', `\`${guildConfig.prefix}\``, true)
        .addField(
          'Warns expire after:',
          `${guildConfig.warnLifeSpan} days`,
          true
        )
        .addField('Max warns before banning:', guildConfig.maxWarns, true)
        .addField(
          'Mod logging channel:',
          guildConfig.modLog ? `<#${guildConfig.modLog}>` : 'Not set!',
          true
        )
        .addField(
          'Server logging channel:',
          guildConfig.serverLog ? `<#${guildConfig.serverLog}>` : 'Not set!',
          true
        )
        .addField(
          'Mute role:',
          guildConfig.muteRole
            ? guild.roles.cache.get(guildConfig.muteRole)
            : 'Not set!',
          true
        )
        .addField(
          'Current amount of mod cases:',
          guildConfig.nextCaseId! - 1,
          true
        )
        .addField(
          'Amount of warns handed out:',
          guildConfig.nextWarnId! - 1,
          true
        )
        .addField(
          'Whitelisted channels:',
          guildConfig.serverLogWhitelist?.length
            ? guildConfig.serverLogWhitelist?.map((c) => `<#${c}>`)
            : 'None!'
        )
        .addField(
          'Ban message:',
          guildConfig.banMessage || `You've been banned from ${guild.name}.`
        );

      return message.channel.send(embed);
    }

    const configType = args.shift()?.toLowerCase();

    switch (configType) {
      case 'help':
        const embed = new MessageEmbed();
        embed
          .setTitle('**Config commands**')
          .setDescription(
            `All config commands require MANAGE_GUILD permissions.`
          )
          .setColor(16711684)
          .setAuthor(client.user?.username, client.user?.avatarURL() || '')
          .setThumbnail(client.user?.avatarURL() || '')
          .setFooter(`Replying to: ${message.author.tag}`)
          .setTimestamp(new Date());

        for (const func of configFuncs) {
          embed.addField(
            `**${guildConfig.prefix}config ${func.name} ${func.args}**`,
            func.desc
          );
        }

        message.channel.send(embed);

        break;
      case 'prefix':
        prefix.run(message, args, client);
        break;
      case 'word':
        word.run(message, args, client);
        break;
      case 'banmsg':
        banMsg.run(message, args);
        break;
      case 'logs':
        logs.run(message, args);
        break;
      case 'mute':
        mute.run(message, args);
        break;
      case 'warnexpire':
        warnExpire.run(message, args);
        break;
      case 'maxwarns':
        warnsMax.run(message, args);
        break;
      case 'whitelist':
        whitelist.run(message, args);
        break;
      case 'listwords':
        listWords.run(message);
        break;
      case 'join':
        joinRole.run(message, args, client);
        break;
      default:
        message.reply(
          `invalid config type! Run the config help command to see the list.`
        );
    }

    return;
  },
};

const joinRole = {
  desc: 'Add, remove or list the guilds join roles.',
  name: 'join',
  args: '<add | remove | list> <Role name | Role ID>',
  alias: ['j'],
  type: 'config',
  run: async (message: Message, args: string[], client: ViviBot) => {
    if (
      !message.guild ||
      !message.member?.hasPermission(['MANAGE_GUILD']) ||
      args.length === 0
    )
      return;

    const command = args.shift()?.toLowerCase();
    const roleId = args.join(' ');
    switch (command) {
      case 'add':
      case 'remove':
        if (!roleId) {
          return message.reply(`you need to include the role name or ID.`);
        }

        const role = message.guild.roles.cache.find(
          (r) => r.id === roleId || r.name.toLowerCase() === roleId
        );

        if (!role) {
          return message.reply(`couldn't find a role with that name or ID`);
        }

        const clientMember = message.guild.members.cache.find(
          (m) => m.id === client.user?.id
        );

        if (!clientMember) {
          return console.error(
            `Join command - I don't know why the client member was unfindable.`
          );
        }

        if (
          role.position >
          Math.max(...clientMember.roles.cache.map((r) => r.position))
        ) {
          return message.reply(
            `the role you're trying to add is higher in the role hierarchy so I can't give it out. Put it below my role or give me a role that's above it.`
          );
        }
        if (command === 'add') {
          ADD_JOIN_ROLE(message.guild.id, role.id)
            .then(() =>
              message.reply(`successfully added the role to the join list.`)
            )
            .catch(() => {
              message.reply(`issue adding role. :(`);
            });
        } else {
          REMOVE_JOIN_ROLE(message.guild.id, role.id)
            .then(() =>
              message.reply(`successfully removed the role from the join list.`)
            )
            .catch(() => {
              message.reply(`issue removing role. :(`);
            });
        }
        break;
      case 'list':
        const roles = await GUILD_JOIN_ROLES(message.guild.id);
        if (!roles) {
          return message.reply(`no join roles!`);
        }
        const embed = new MessageEmbed();
        embed
          .setTitle(`Roles users get when joining`)
          .setColor(16580705)
          .setDescription(
            `${
              !roles.joinRoles?.length
                ? 'No join roles!'
                : roles.joinRoles.map((r) => `<@&${r}>`).join('\n')
            }`
          );

        message.channel.send(embed);
        break;
    }

    return;
  },
};

const prefix = {
  desc: 'Set the guilds prefix.',
  name: 'prefix',
  args: '<any prefix you want>',
  alias: ['p'],
  type: 'config',
  run: (message: Message, args: string[], client: ViviBot) => {
    if (
      !message.guild ||
      !message.member?.hasPermission(['MANAGE_GUILD']) ||
      args.length === 0
    )
      return;

    SET_GUILD_PREFIX(message.guild.id, args[0])
      .then(() => {
        message.reply(`successfully changed the guilds' prefix.`);
        client.guildPrefix.set(message.guild!.id, args[0]);
      })
      .catch(() => message.reply(`I failed to set the prefix to that!`));
  },
};

const word = {
  desc:
    'Add or delete a word or list of words for the banned list. Everything added will be case sensitive.\n',
  name: 'word',
  args: '<add | delete> <list of words seperated by comma>',
  alias: ['aw'],
  type: 'config',
  run: async (message: Message, args: string[], client: ViviBot) => {
    if (!message.guild || !message.member?.hasPermission(['MANAGE_GUILD']))
      return;

    if (!args.length) {
      return message.reply(
        `you need to tell me if you're adding or deleting and what words!`
      );
    }

    const wordType = args.shift()?.toLowerCase();

    switch (wordType) {
      case 'add':
        NEW_BANNED_WORD(message.guild.id!, args.join('').split(',')).then(
          async () => {
            client.bannedWords.set(
              message.guild!.id,
              await GET_BANNED_WORDS(message.guild!.id)
            );
          }
        );
        message.reply(`successfully added the words to the banned list.`);
        break;
      case 'delete':
        REMOVE_BANNED_WORD(message.guild.id!, args.join('').split(',')).then(
          async () => {
            message.channel.send(`Successfully removed the words.`);
            client.bannedWords.set(
              message.guild!.id,
              await GET_BANNED_WORDS(message.guild!.id)
            );
          }
        );
        break;
    }
    return;
  },
};

const banMsg = {
  desc: `Set ban message. This will get DMd to a user right before they're banned.`,
  name: 'banmsg',
  args: '<words n stuff>',
  alias: ['bm'],
  type: 'config',
  run: (message: Message, args: string[]) => {
    if (!message.guild || !message.member?.hasPermission(['MANAGE_GUILD']))
      return;

    if (args.join(' ').length > 1020) {
      return message.reply(
        `the ban message can only be a max of 1020 characters.`
      );
    }

    return SET_BANNED_MSG(message.guild.id, args.join(' '))
      .then(() =>
        message.channel.send('I changed the ban message successfully.')
      )
      .catch(() => message.reply(`I failed to set that as the ban message.`));
  },
};

const logs = {
  desc: 'Set Mod or Server logging channels',
  name: 'logs',
  args: '<mod | server> <#channel | id>',
  alias: ['l'],
  type: 'config',
  run: async (message: Message, args: string[]) => {
    if (!message.guild || !message.member?.hasPermission(['MANAGE_GUILD']))
      return;
    let [type, id] = args;

    if (message.mentions.channels.size) {
      id = message.mentions.channels.first()?.id || id;
    }

    //const channel = message.guild.channels.resolve(id) as TextChannel;
    const channel = message.guild.channels.cache.get(id) as TextChannel;

    if (!channel) {
      return message.channel.send(
        'I failed to find any channel with that id. Check the id, or mention the channel. Make sure I have access to see it and send messages to it too.'
      );
    }

    switch (type.toLowerCase()) {
      case 'mod':
        SET_MOD_CHANNEL(message.guild.id, id);
        message.react('✅');
        channel.send(`I'm configured to send any mod actions here now! :tada:`);
        break;
      case 'server':
        SET_SERVER_CHANNEL(message.guild.id, id);
        message.react('✅');
        channel.send(`I'm configured to send server updates here now! :tada:`);
        break;
      default:
        message.reply(
          'incorrect log type. There are only `mod` and `server` so try again.'
        );
    }

    return;
  },
};

const mute = {
  desc: 'Set the mute role for the server',
  name: 'mute',
  args: '<@role | id | none>',
  alias: ['mr'],
  type: 'config',
  run: async (message: Message, args: string[]) => {
    if (!message.guild || !message.member?.hasPermission(['MANAGE_GUILD']))
      return;

    if (!args.length) {
      return message.reply(
        `you need to send either a role mention, id of 'none'.`
      );
    }

    if (args.length && args[0] === 'none') {
      const config = await GET_GUILD_CONFIG(message.guild.id);
      if (!config?.muteRole) {
        return message.reply(
          `the server doesn't have a mute role setup already!`
        );
      }

      REMOVE_MUTE_ROLE(message.guild.id);

      return message.reply(`successfully remove mute role.`);
    }

    const roleId = message.mentions.roles.first()?.id || args.shift();

    if (!roleId) {
      return message.reply(`did you not pass a role id or not mention a role?`);
    }

    SET_MUTE_ROLE(message.guild.id, roleId);

    return message.reply(`successfully set mute role.`);
  },
};

const warnExpire = {
  desc: 'Set how long it takes for a warn to expire.',
  name: 'warnexpire',
  args: '<number in days>',
  alias: ['we'],
  type: 'config',
  run: (message: Message, args: string[]) => {
    if (!message.guild || !message.member?.hasPermission(['MANAGE_GUILD']))
      return;

    const numDays = Number(args[0]);
    if (Number.isNaN(numDays)) {
      return message.reply(
        `you need to pass a number. The max I support up to is 30 days, and minimum 1,`
      );
    } else if (numDays > 30 || numDays < 1) {
      return message.reply(
        `The days cannot be greater than 30 nor less than 1.`
      );
    }

    return SET_WARN_EXPIRE(message.guild.id, numDays)
      .then(() =>
        message.reply(`successfully set warns to expire after ${numDays} days.`)
      )
      .catch(() =>
        message.reply(
          `I had an issue setting the warn expiration days configuration.`
        )
      );
  },
};

const warnsMax = {
  desc: 'Set the max warns a user can get before getting banned.',
  name: 'maxwarns',
  args: '<a number in the range [1, 10]>',
  alias: ['mw'],
  type: 'config',
  run: (message: Message, args: string[]) => {
    if (!message.guild || !message.member?.hasPermission(['MANAGE_GUILD']))
      return;

    const maxWarns = Number(args[0]);
    if (Number.isNaN(maxWarns)) {
      return message.reply(`you need to pass a number. The range is [1, 10].`);
    } else if (maxWarns > 30 || maxWarns < 1) {
      return message.reply(`That's not within the range [1, 10]`);
    }

    return SET_MAX_WARNS(message.guild.id!, maxWarns)
      .then(() => message.reply(`successfully set the max warns.`))
      .catch(() =>
        message.reply(`I failed to set the max warns for this guild.`)
      );
  },
};

const whitelist = {
  desc: 'Whitelist a channel to ignore server logs for.',
  name: 'whitelist',
  args: '<add | remove> <#channel | ID>',
  alias: ['wl'],
  type: 'config',
  run: (message: Message, args: string[]) => {
    if (!message.guild || !message.member?.hasPermission(['MANAGE_GUILD']))
      return;

    if (!args.length) {
      return message.reply(
        `please mention a channel or send its ID to whitelist it.`
      );
    }

    let [type, id] = args;

    if (message.mentions.channels.size) {
      id = message.mentions.channels.first()?.id || id;
    }

    const channel = message.guild.channels.cache.get(id) as TextChannel;

    if (!channel) {
      return message.channel.send(
        'I failed to find any channel with that id. Check the id, or mention the channel. Make sure I have access to see it and send messages to it too.'
      );
    }

    switch (type.toLowerCase()) {
      case 'add':
        ADD_CHANNEL_WHITELIST(message.guild.id, channel.id)
          .then(() => message.reply(`successfully whitelisted channel.`))
          .catch(() =>
            message.reply(`I had issues whitelisting that channel.`)
          );
        break;
      case 'remove':
        REMOVE_CHANNEL_WHITELIST(message.guild.id, channel.id)
          .then(() =>
            message.reply(`successfully removed the channel from whitelist.`)
          )
          .catch(() =>
            message.reply(`I had issues removing that channel from whitelist.`)
          );
        break;
      default:
        message.reply('you need to tell me if you want to `add` or `remove`.');
    }
    return;
  },
};

const listWords = {
  desc: 'List of currently banned words.',
  name: 'listwords',
  args: '',
  alias: ['lw'],
  type: 'config',
  run: async (message: Message) => {
    if (!message.guild || !message.member?.hasPermission(['MANAGE_GUILD']))
      return;

    const words = await GET_BANNED_WORDS(message.guild.id);

    message.channel.send(
      !words.length
        ? `There are no banned words.`
        : `Banned words: ||${words.join(', ')}||`
    );
  },
};

const setup = {
  desc: 'If Vivi failed to setup the server config, run this to fix it.',
  name: 'setup',
  args: '',
  alias: [],
  type: 'setup',
  run: async (message: Message) => {
    const { guild } = message;
    if (!guild || !message.member?.hasPermission(['MANAGE_GUILD'])) return;

    const guildConfig = await GENERATE_GUILD_CONFIG(guild.id);

    if (!guildConfig) {
      return message.reply(`I'm already configured for the server!`);
    }

    const embed = new MessageEmbed();

    embed
      .setTitle(`Configuration setup for **${guild.name}**`)
      .setThumbnail(guild.iconURL() || '')
      .addField('Guild prefix:', `\`${guildConfig.prefix}\``, true)
      .addField('Warns expire after:', `${guildConfig.warnLifeSpan} days`, true)
      .addField('Max warns before banning:', guildConfig.maxWarns, true)
      .addField(
        'Mod logging channel:',
        guildConfig.modLog ? `<#${guildConfig.modLog}>` : 'Not set!',
        true
      )
      .addField(
        'Server logging channel:',
        guildConfig.serverLog ? `<#${guildConfig.serverLog}>` : 'Not set!',
        true
      )
      .addField(
        'Mute role:',
        guildConfig.muteRole
          ? guild.roles.cache.get(guildConfig.muteRole)
          : 'Not set!',
        true
      )
      .addField(
        'Current amount of mod cases:',
        guildConfig.nextCaseId! - 1,
        true
      )
      .addField(
        'Amount of warns handed out:',
        guildConfig.nextWarnId! - 1,
        true
      )
      .addField(
        'Ban message:',
        guildConfig.banMessage || `You've been banned from ${guild.name}.`
      );

    return message.channel.send(embed);
  },
};

const configFuncs = [
  prefix,
  word,
  banMsg,
  joinRole,
  logs,
  mute,
  warnExpire,
  warnsMax,
  whitelist,
  listWords,
  setup,
];

export default config;
