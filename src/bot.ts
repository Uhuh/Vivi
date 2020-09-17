import * as Discord from 'discord.js';
import * as dotenv from 'dotenv';
dotenv.config();
import msg from '../events/message';
import * as config from './vars'
import commandHandler from '../commands/commandHandler';
import { GET_WORDS, GET_USER_WARN, SET_WARN, GET_MUTES, REMOVE_MUTE, NEW_CASE, GET_NEW_CASE, GET_LAST_WARN } from './setup_tables';
import { MessageDelete, MessageEdit, UserJoin } from '../events/serverLogs';
import * as moment from 'moment';

interface Command {
  desc: string,
  name: string,
  args: string,
  type: string,
  run: Function
};

export default class SetsuBot extends Discord.Client {
  config: any;
  commands: Discord.Collection<string, Command>;
  bannedWords: RegExp[];
  bannedStrings: { id: string, word: string }[];
  mutes: Discord.Collection<string, NodeJS.Timeout>;
  caseCount: number = 0;
  muteRole = '732816563664715846';
  constructor() {
    super();
    this.config = config;
    this.mutes = new Discord.Collection();
    this.commands = new Discord.Collection();
    this.bannedWords = [];
    this.bannedStrings = [];
    commandHandler(this);
    this.once('ready', () => {
      console.info(`[Started]: ${new Date()}\n`);
      console.info('Setsu reporting for duty!');
      setInterval(() => this.randomPres(), 10000);
    })

    //CMD Handling
    this.on('message', message => {
      if(message.channel?.id === config.VERIFY_CH) {
        return this.verifyChannel(message as Discord.Message);
      }
      if (message.author?.bot) return;
      msg(this, message as Discord.Message);
      // Verify user message into the server.
      if(
        message.channel?.type !== 'dm' &&
        !message.member?.hasPermission('MANAGE_MESSAGES')
      ) {
        this.filterWords(message as Discord.Message);
      }

      return;
    });
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

  verifyChannel = async (message: Discord.Message) => {
    const words = message.content.split(' ').join('').toLowerCase();

    message.delete()
      .catch(() => console.error(`Issue deleting verification message`));

    // If the user didn't send the verify message, ignore.
    if (!words.startsWith('bbverify')) return;
    
    const { guild } = message;

    if(!guild) return;
    
    let member = guild.members.cache.get(message.author.id);
    
    if (!member) {
      console.log(`Failed to get member from cache for verification. Going to fetch and retry....`);
      await guild.members.fetch(message.author.id);
      member = guild.members.cache.get(message.author.id);
    }

    if (!member) return console.error(`Issue getting member for verification.`);

    // Verify user into the server
    return member.roles.add(config.STUDENT_ROLE)
      .catch(() => console.error(`Issues verifying member.`));
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

  logIssue = (type: string, reason: string, mod: Discord.User, user: Discord.User | string) => {
    const channel = this.guilds.cache.get(this.config.GUILD)?.channels.cache.get(this.config.MOD_LOGS);
    const embed = new Discord.MessageEmbed();

    const modCase = GET_NEW_CASE() || { id: 0 };

    let color = 15158332;
    switch(type.toLowerCase()) {
      case 'ban': color = 15158332; break;
      case 'mute': color = 15844367; break;
      case 'unmute': case 'unban': color = 3066993; break;
    }

    embed.setTitle(`${type} | Case #${modCase.id + 1}`)
      .addField(`**User**`, `${(typeof user === 'string' ? user : user?.tag) } (<@${(typeof user === 'string' ? user : user.id)}>)`, true)
      .addField(`**Moderator**`, mod?.tag === '' ? 'Unknown' : mod.tag, true)
      .addField(`**Reason**`, reason === '' ? `Mod please do \`bbreason ${modCase.id+1} <reason>\`` : reason)
      .setColor(color)
      .setTimestamp(new Date());
    
    try {
      if(channel && channel instanceof Discord.TextChannel) {
        channel.send(embed)
          .then(m => {
            const warn = GET_LAST_WARN();
            NEW_CASE(mod.id, (typeof user === 'string' ? user : user.id), m.id, type, type === 'Warn' ? warn.id : 'null');
          });
      }
    } catch {
      console.error(`Issue when trying to write log case`)
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
          this.mutes.delete(mute.user_id);
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
    this.loadBannedWords();
    this.loadMutes();
  }
}
