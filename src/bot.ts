import * as Discord from 'discord.js';
import * as dotenv from 'dotenv';
dotenv.config();
import msg from '../events/message';
import * as config from './vars'
import commandHandler from '../commands/commandHandler';
import { GET_REACTS, GET_WORDS, GET_USER_WARN, SET_WARN, GET_MUTES, REMOVE_MUTE } from './setup_tables';
import { MessageDelete, MessageEdit, UserJoin } from '../events/serverLogs';
import * as moment from 'moment';

interface Command {
  desc: string,
  name: string,
  args: string,
  type: string,
  run: Function
};

interface ReactRole {
  role_id: string;
  emoji: string;
};

export default class SetsuBot extends Discord.Client {
  config: any;
  commands: Discord.Collection<string, Command>;
  reactMessages: string[];
  bannedWords: RegExp[];
  bannedStrings: { id: string, word: string }[];
  mutes: Discord.Collection<string, NodeJS.Timeout>;
  caseCount: number = 0;
  muteRole = '732816563664715846';
  reactRoles: Discord.Collection<string, ReactRole>;
  constructor() {
    super();
    this.config = config;
    this.mutes = new Discord.Collection();
    this.commands = new Discord.Collection();
    this.reactRoles = new Discord.Collection();
    this.bannedWords = [];
    this.reactMessages = [];
    this.bannedStrings = [];
    commandHandler(this);
    this.once('ready', () => {
      console.info(`[Started]: ${new Date()}\n`);
      console.info('Setsu reporting for duty!');
      setInterval(() => this.randomPres(), 10000);
    })

    //CMD Handling
    this.on('message', message => {
      if (message.author?.bot) return;
      msg(this, message as Discord.Message);
      if(
        message.channel?.type !== 'dm' &&
        !message.member?.hasPermission('MANAGE_MESSAGES')
      ) {
        this.filterWords(message as Discord.Message);
      } else if (message.channel?.type === 'dm') {
        this.serverRoles(message as Discord.Message);
      }
    });
    this.on("messageReactionAdd", (reaction, user) => this.handleReaction(reaction, user, 'add'));
    this.on("messageReactionRemove", (reaction, user) => this.handleReaction(reaction, user, 'remove'));
    this.on("messageDelete", message => {
      try {
        if (message.author?.bot || message.channel?.type === 'dm') return;
        MessageDelete(this, message);
      } catch {
        console.error(`Error on message delete!`);
      }
    });
    this.on("messageUpdate", (oldMsg, newMsg) => {
      try {
        if (oldMsg.author?.bot || oldMsg.channel?.type === 'dm') return;
        MessageEdit(this, oldMsg, newMsg);
        if(
          newMsg.channel?.type !== 'dm' && 
          !newMsg.author?.bot &&
          !newMsg.member?.hasPermission('MANAGE_MESSAGES')
        ) {
          this.filterWords(newMsg as Discord.Message);
        }
      } catch {
        console.error(`Error on message update!`);
      }
    });
    this.on("guildMemberAdd", member => UserJoin(member));
  }

  handleReaction = async (reaction: Discord.MessageReaction, user: Discord.User | Discord.PartialUser, type: string) => {
    try {
      if (!reaction) return;
      const msg = this.reactRoles.get(reaction.message.id);
      // If DNE ignore
      if (!msg) return;

      const { message, emoji } = reaction;

      if (!message || !message.guild) return;

      const emojiId = emoji.id || emoji.name;

      if (emojiId === msg.emoji) {
        let member = message.guild.members.cache.get(user.id);
        if (!member) {
          console.log(`Role ${type} - Failed to get member from cache. Going to fetch and retry....`);
          await message.guild.members.fetch(user.id);
          member = message.guild.members.cache.get(user.id);
        }

        // If they're still not there after forcing cache throw error
        if (!member) {
          throw new Error(`Member not found: ${user.username} - ${user.id}`);
        }

        switch (type) {
          case 'add':
            member.roles.add(msg.role_id)
              .catch(() => console.error(`Could not give user role : ${msg.role_id}`));
            break;
          case 'remove':
            member.roles.remove(msg.role_id)
              .catch(() => console.error(`Could not remove user role : ${msg.role_id}`));
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  randomPres = () => {
    const user = this.user;
    if (!user) return console.log("Client dead?");

    const presArr = [
      `over LoveLetter <3`,
      `out for senpai`,
      `Waiting to be loved`
    ];

    user.setPresence(
      {
        activity: {
          name: presArr[Math.floor(Math.random() * presArr.length)],
          type: "WATCHING"
        },
        status: "online"
      })
      .catch(console.error);
  };

  serverRoles = async (message: Discord.Message) => {
    const words = message.content.split(' ').join('').toLowerCase();
    const guild = this.guilds.cache.get(this.config.GUILD);
    if(!guild) return;
    let member = await guild.members.cache.get(message.author.id);
    if (!member) {
      console.log(`Failed to get member from cache for DMs. Going to fetch and retry....`);
      await guild.members.fetch(message.author.id);
      member = guild.members.cache.get(message.author.id);
    }

    if (!member) 
      return message.reply(`Sorry! I had issues getting you from the LoveLetter server. Please alert a mod of admin of this.`);

    const now = moment();
    const userJoinTime = moment(member.joinedTimestamp);

    if (now.diff(userJoinTime, 'minutes') < 10) {
      return message.reply(`You still have ${10-now.diff(userJoinTime, 'minutes')} minutes to go before you can claim any roles!`)
        .catch(() => console.error('Issues DMing user verification wait time.'));
    }

    /**
     * Because people are stupid and can't read just give them roles if the start 
     * of their message has any of these. Sigh.
     */

    if (words.startsWith('bbverify')) {
      // Verify user into the server
      const studentId = '729709012253278268';
      if (member.roles.cache.has(studentId)) {
        return;
      }
      member.roles.add(studentId)
        .then(() => message.reply(`Congrats! You now have access to the server`))
        .catch(() => message.reply(`You should already have access! If this isn't true show this to a mod or admin.`));
    } else if (words.startsWith('bbgame')) {
      // Give game updates role
      const gameId = '733758723406692393';
      if (!member.roles.cache.has(gameId)) {
        member.roles.add(gameId)
          .then(() => message.reply(`Congrats! You will now be updated about the game!`))
          .catch(() => message.reply(`I encountered an issue, show this to a mod or admin to add the game role.`));
      } else {
        member.roles.remove(gameId)
          .then(() => message.reply(`I removed the game updates role for you.`))
          .catch(() => message.reply(`I encountered an issue, show this to a mod or admin to remove the game role.`));
      }
    } else if (words.startsWith('bbserver')) {
      // Give server updates role
      const serverId = '733758719992791051';
      if (!member.roles.cache.has(serverId)) {
        member.roles.add(serverId)
          .then(() => message.reply(`Congrats! You will now be updated about the server!`))
          .catch(() => message.reply(`I encountered an issue, show this to a mod or admin to add the server role.`));
      } else {
        member.roles.remove(serverId)
          .then(() => message.reply(`I removed the server updates role for you.`))
          .catch(() => message.reply(`I encountered an issue, show this to a mod or admin to remove the server role.`));
      }
    }
  }

  filterWords = async (message: Discord.Message) => {
    let userWarnings = GET_USER_WARN(message.author.id)

    if(!userWarnings) userWarnings = [];

    const WEEK_OLD = moment().subtract(8, 'days').startOf('day');
    let activeWarns = 0;

    for (const warn of userWarnings) {
      if (moment.unix(warn.date).isBefore(WEEK_OLD)) continue;
      activeWarns++;
    }

    /**
     * Loop through all the users words, check if they're in the banned list
     */
    const content = message.content.toLowerCase();
    for(const reg of this.bannedWords) {
      const match = reg.exec(content);
      if(match) {
        const [, id] = match;
        activeWarns++;
        if (activeWarns > 3) {
          message.channel.send(`Banned ${message.author.username} for getting more than 3 strikes.`);
          message.delete().catch(() => console.error(`Issues deleting the message!`));
          SET_WARN(message.author.id, `Saying a banned word. ${id}`, this.user?.id || '731987022008418334');
          await message.member?.send(
`
Your account has been terminated from our server automatically by me!
If you would like to appeal your account's termination, you may do so at \`https://forms.gle/vUNc5jDAGRopchFf6\`.

= = = Warn list = = =
${userWarnings.map(w => `  - ID: ${w.id} | Reason: ${w.reason}\n`).join('')}

Thank you for your understanding,
  -LLMTF Staff
`
            ).catch(() => console.error('Issue sending ban appeal message to user. Oh well?'));
          message.member?.ban().catch(() => message.channel.send(`Issues banning user.`));
          this.logIssue('AutoMod: Ban', `Strike! You're out! (Banned word: ||${id}||)`, this.user!, message.author);
          return;
        } else {
          message.reply(`warning. You gained a strike. You have ${activeWarns}/3 strikes.`);
          SET_WARN(message.author.id, `Saying a banned word. ${id}`, this.user?.id || '731987022008418334');
          this.logIssue('AutoMod: Warn', `Warned for saying a banned word. ||${id}||`, this.user!, message.author);
          message.author.send(`You have been warned!\n**Reason:** Warned for saying a banned word. ${id}`)
            .catch(() => console.error(`Can't DM user, probably has friends on.`));
          message.delete().catch(() => console.error(`Issues deleting the message!`));
        }
      }
    }
  }

  logIssue = (type: string, reason = 'No reason provided.', mod: Discord.User, user: Discord.User | string) => {
    const channel = this.guilds.cache.get(this.config.GUILD)?.channels.cache.get(this.config.MOD_LOGS);
    const embed = new Discord.MessageEmbed();
    embed.setTitle(`${type}`)
      .addField(`**User**`, `${(typeof user === 'string' ? user : user?.tag) } (<@${(typeof user === 'string' ? user : user.id)}>)`, true)
      .addField(`**Moderator**`, mod?.tag === '' ? 'Unknown' : mod.tag, true)
      .addField(`**Reason**`, reason === '' ? 'No reason provided' : reason)
      .setColor(15158332)
      .setTimestamp(new Date());
    
    try {
      if(channel && channel instanceof Discord.TextChannel) {
        channel.send(embed);
      }
    } catch {
      console.error(`Issue when trying to write log case`)
    }
  }

  loadReactRoles = () => {
    const reactRoles = GET_REACTS();
    this.reactMessages = reactRoles.map(r => r.message_id);
    for (const row of reactRoles) {
      this.reactRoles.set(row.message_id, { role_id: row.role_id, emoji: row.emoji })
    }
  }

  loadBannedWords = () => {
    const words = GET_WORDS();
    this.bannedWords = words.map(w => new RegExp(`(${w.word})`, 'g')) || [];
    this.bannedStrings = words || [];
  }

  loadMutes = async () => {
    const muteId = '733341358693285979';
    const mutes = GET_MUTES();
    const now = moment().unix();
    const guild = this.guilds.cache.get(this.config.GUILD);
    for(const mute of mutes) {
      
      let member = await guild?.members.cache.get(mute.user_id);
      if (!member) {
        console.log(`Failed to get member from cache for MUTE. Going to fetch and retry....`);
        await guild?.members.fetch(mute.user_id)
          .catch(() => console.error(`Error fetching user. Most likely not in the server.`))
        member = guild?.members.cache.get(mute.user_id);
      }

      this.mutes.set(
        mute.user_id,
        setTimeout(() => {
          REMOVE_MUTE(mute.user_id);
          this.logIssue('AutoMod: Unmute', `Time's up`, this.user!, member ? member.user : mute.user_id);

          if (member) {
            member.roles.remove(muteId)
              .catch(() => console.error(`Unable to remove mute role from member. Maybe they left?`));
          }
        }, (Number(mute.unmute_date)-now)*1000)
      );
    }
  }

  async start() {
    await this.login(this.config.TOKEN);
    this.loadReactRoles();
    this.loadBannedWords();
    this.loadMutes();
  }
}