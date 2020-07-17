import * as Discord from 'discord.js';
import * as dotenv from 'dotenv';
dotenv.config();
import msg from '../events/message';
import * as config from './vars'
import commandHandler from '../commands/commandHandler';
import { GET_REACTS } from './setup_tables';
import { handle_packet } from '../events/rawPacket';

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
  reactRoles: Discord.Collection<string, ReactRole>;
  constructor() {
    super();

    this.config = config;
    this.commands = new Discord.Collection();
    this.reactRoles = new Discord.Collection();
    this.reactMessages = [];
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
    });
    this.on("messageReactionAdd", (reaction, user) => this.handleReaction(reaction, user, 'add'));
    this.on("messageReactionRemove", (reaction, user) => this.handleReaction(reaction, user, 'remove'));
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

  loadReactRoles = () => {
    const reactRoles = GET_REACTS();
    console.log(reactRoles);
    this.reactMessages = reactRoles.map(r => r.message_id);
    for (const row of reactRoles) {
      this.reactRoles.set(row.message_id, { role_id: row.role_id, emoji: row.emoji })
    }
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
  }
}