const Discord = require('discord.js');
const {
    prefix,
    token
} = require('./config.json');

let coins = require('../coins.json');
const fs = require('fs');
const handle_packet = require('../events/raw_packet');
const reactRoles = require('../reactRoles.json');

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

const commandHandler = require('../commands/commandHandler');
const msg = require('../events/message');

class BowBot extends Discord.Client {
    prefix;
    commands;
    constructor() {
        super();

        this.commands = new Map();
        this.prefix = prefix;
        commandHandler(this);
        this.once('ready', () => {
            console.log(`[Started]: ${new Date()}\n`);
            console.log('Bow-Bot is ready!');
            setInterval(() => this.randomPres(), 10000);
        })
        
        //CMD Handling
        
        this.on('message', message => {
            //this.gainCoins(message); //Turned off for now
            msg(this, message);
        });

        this.on("raw", packet => handle_packet(packet, this));

        this.on("messageReactionAdd", (reaction, user) => this.handleReaction(reaction, user, 'add'));
        this.on("messageReactionRemove", (reaction, user) => this.handleReaction(reaction, user, 'remove'));
    }

    handleReaction = (reaction, user, type) => {
      try {
        if (!reaction) return;
        const msg = reactRoles[reaction.message.id];
        // If DNE ignore
        if (!msg) return;
  
        const { emoji } = reaction;
        const emojiId = emoji.id || emoji.name;
        
        if (emojiId === msg.emoji) {
          const member = reaction.message.guild.members.cache.get(user.id);
          if (!member) throw new Error(`Member not found: ${user.username} - ${user.id}`);
  
          switch (type) {
            case 'add':
              member.roles.add(msg.roleId)
                .catch(() => console.error(`Could not give user role : ${msg.roleId}`));
              break;
            case 'remove':
              member.roles.remove(msg.roleId)
                .catch(() => console.error(`Could not remove user role : ${msg.roleId}`));
          }
        }
      } catch(e) {
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
          { activity: {
            name: presArr[Math.floor(Math.random()*presArr.length)],
            type: "WATCHING"
          },
          status: "online"})
        .catch(console.error);
    };

    gainCoins = (message) => {
    //Coin Handling
      if (message.author.bot) return;
      if (!coins[message.author.id])
      {
          coins[message.author.id] = {
              coins: 0
          };
      }
      
      let coinAmt = Math.floor(Math.random() * 50) + 1;
      let baseAmt = Math.floor(Math.random() * 50) + 1;
      //console.log(`${message.author.username} : ${coinAmt} ; ${baseAmt}`);

      if (coinAmt === baseAmt)
      {
        coins[message.author.id] = {
          coins: coins[message.author.id].coins + coinAmt
        };
        fs.writeFile("./coins.json", JSON.stringify(coins), (err) => {
          if (err) console.log(err);
        });

        let coinMSG = `**${message.author.username}**\n💰${coinAmt} Bow-Bucks Acquired! You now have ${coins[message.author.id].coins}`;

        message.channel.send(coinMSG)
          .then(msg => {
            msg.delete({ timeout: 5000 } )
          });
        }
    };

    async start() {
        await this.login(token);
    }
}

module.exports = BowBot;