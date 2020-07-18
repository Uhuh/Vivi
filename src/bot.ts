import * as Discord from 'discord.js';
import * as dotenv from 'dotenv';
dotenv.config();
import msg from '../events/message';
import * as config from './vars'
import commandHandler from '../commands/commandHandler';
import { GET_REACTS, GET_WORDS, GET_USER_WARN, SET_WARN } from './setup_tables';
import { handle_packet } from '../events/rawPacket';
import { MessageDelete, MessageEdit } from '../events/serverLogs';

//TODO
/*
    * Mod Mail
    * Wholesomeness
    * Bonk Horny People
    * React to "senpai"
    * Easy Reaction Role Setup
    * Kicking/Banning + Track User
    * Custom Anon Embeds
    * Logging / Basic Auto Mod
    * 
    * Fun User Features:
    *   Economy
    *   Level System
    * 
    * INTEGRATE REP SYSTEM WITH STUDENT ROLES
    * Make rep system usable only by moderators
*/

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

export default class BowBot extends Discord.Client {
  config: any;
  commands: Discord.Collection<string, Command>;
  reactMessages: string[];
  bannedWords: string[];
  caseCount: number = 0;
  muteRole = '732816563664715846';
  reactRoles: Discord.Collection<string, ReactRole>;
  constructor() {
    super();

    this.config = config;
    this.commands = new Discord.Collection();
    this.reactRoles = new Discord.Collection();
    this.reactMessages = [];
    this.bannedWords = [];
    commandHandler(this);
    this.once('ready', () => {
      console.log(`[Started]: ${new Date()}\n`);
      console.log('Bow-Bot is ready!');
      setInterval(() => this.randomPres(), 10000);
    })

    //CMD Handling
    this.on("raw", packet => handle_packet(packet, this));
    this.on('message', message => {
      //this.gainCoins(message); //Turned off for now
      msg(this, message as Discord.Message);
      if(
        message.channel?.type !== 'dm' && 
        !message.author?.bot &&
        !message.member?.hasPermission('MANAGE_MESSAGES')
      ) {
        this.filterWords(message as Discord.Message);
      }
    });
    this.on("messageReactionAdd", (reaction, user) => this.handleReaction(reaction, user, 'add'));
    this.on("messageReactionRemove", (reaction, user) => this.handleReaction(reaction, user, 'remove'));
    this.on("messageDelete", message => {
      if (message.author?.bot) return;
      MessageDelete(this, message);
    });
    this.on("messageUpdate", (oldMsg, newMsg) => {
      if (oldMsg.author?.bot) return;
      MessageEdit(this, oldMsg, newMsg);
      this.filterWords(newMsg as Discord.Message);
    });
  }

  handleReaction = (reaction: Discord.MessageReaction, user: Discord.User | Discord.PartialUser, type: string) => {
    try {
      if (!reaction) return;
      const msg = this.reactRoles.get(reaction.message.id);
      // If DNE ignore
      if (!msg) return;

      const { message, emoji } = reaction;

      if (!message || !message.guild) return;

      const emojiId = emoji.id || emoji.name;

      if (emojiId === msg.emoji) {
        const member = message.guild.members.cache.get(user.id);
        if (!member) throw new Error(`Member not found: ${user.username} - ${user.id}`);

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
      `over Lovesick <3`,
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

  filterWords = (message: Discord.Message) => {
    let userWarnings = GET_USER_WARN(message.author.id)

    if(!userWarnings) userWarnings = [];

    let numWarns = userWarnings.length;

    /**
     * Loop through all the users words, check if they're in the banned list
     */
    for(const word of message.content.split(' ')) {
      if(this.bannedWords.includes(word.toLowerCase())) {
        switch (numWarns) {
          case 3: // If they're at three strikes they get banned on the 4th :)
            message.channel.send(`Banned ${message.author.username} for getting more than 3 strikes.`);
            message.delete().catch(() => console.error(`Issues deleting the message!`));
            message.member?.ban().catch(() => message.channel.send(`Issues banning user.`));
            this.logIssue('AutoMod: Ban', `Strike! You're out!`, this.user!, message.author)
            return;
          default:
            message.reply(`warning. You gained a strike. You have ${++numWarns}/3 strikes.`);
            SET_WARN(message.author.id, `Saying a banned word.`);
            this.logIssue('AutoMod: Warn', `Warned for saying a banned word.`, this.user!, message.author);
            message.author.send(`You have been warned!\n**Reason:** Warned for saying a banned word.`)
            .catch(() => console.error(`Can't DM user, probably has friends on.`));
            message.delete().catch(() => console.error(`Issues deleting the message!`));
        }
      }
    }
  }

  logIssue = (type: string, reason = 'No reason provided.', mod: Discord.User, user: Discord.User) => {
    const channel = this.guilds.cache.get(this.config.GUILD)?.channels.cache.get(this.config.MOD_LOGS);
    const embed = new Discord.MessageEmbed();
    embed.setTitle(`${type}`)
      .addField(`**User**`, `${user.tag} (<@${user.id}>)`, true)
      .addField(`**Moderator**`, mod.tag, true)
      .addField(`**Reason**`, reason)
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
    console.log(reactRoles);
    this.reactMessages = reactRoles.map(r => r.message_id);
    for (const row of reactRoles) {
      this.reactRoles.set(row.message_id, { role_id: row.role_id, emoji: row.emoji })
    }
  }

  loadBannedWords = () => {
    const words = GET_WORDS();
    console.log(words);
    this.bannedWords = words.map(w => w.word) || [];
  }

/* This is disabled for now
  gainCoins = (message: Discord.Message) => {
    //Coin Handling
    if (message.author.bot) return;
    if (!coins[message.author.id]) {
      coins[message.author.id] = {
        coins: 0
      };
    }

    let coinAmt = Math.floor(Math.random() * 50) + 1;
    let baseAmt = Math.floor(Math.random() * 50) + 1;
    //console.log(`${message.author.username} : ${coinAmt} ; ${baseAmt}`);

    if (coinAmt === baseAmt) {
      coins[message.author.id] = {
        coins: coins[message.author.id].coins + coinAmt
      };
      fs.writeFile("./coins.json", JSON.stringify(coins), (err) => {
        if (err) console.log(err);
      });

      let coinMSG = `**${message.author.username}**\n💰${coinAmt} Bow-Bucks Acquired! You now have ${coins[message.author.id].coins}`;

      message.channel.send(coinMSG)
        .then(msg => {
          msg.delete({ timeout: 5000 })
        });
    }
  };*/

  async start() {
    await this.login(this.config.TOKEN);
    this.loadReactRoles();
    this.loadBannedWords();
  }
}