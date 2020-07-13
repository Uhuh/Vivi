const Discord = require('discord.js');
const client  = new Discord.Client();

const {
    //'bb' styalized 'BB'
    prefix,
    token
} = require('./config.json');

client.once('ready', () => {
    console.log('Ready');
    client.user.setActivity('over Lovesick <3', {type: "WATCHING"});
});

client.login(token);

client.on('message', message => {
    if (message.author.id === '223194058288267264' || message.guild.id === '731977848251744267')
    //Only enable for myself and test serverwhile in dev
    {
        if (!message.content.toLowerCase().startsWith(prefix) || message.author.bot) return;

        const args = message.content.slice(prefix.length).split(' ');
        const command = args.shift().toLowerCase();
        
        switch (command)
        {
            case 'ping':
                message.channel.send('Pong!');
                break;
            
            case 'hey':
                message.channel.send(`Hi, ${message.author}!`);
                break;
            
            case 'members':
                message.channel.send(`Total Members (Minus Bots): ${message.guild.members.cache.filter(member => !member.user.bot).size}`)
                break;
            
            case 'say':
            case 's':
                if (args.length > 0 && message.author.id === '223194058288267264')
                {
                    message.delete();
                    const toSay = args.join(' ');
                    message.channel.send(toSay);
                }
                break;
            
            case 'topic':
                const responses = [
                    'How tall are you?',
                    'What is your favorite game?',
                    'What is your opinion on math?',
                    'What is your favorite painting?',
                    'What is your favorite food?',
                    'What is something you think is really underappreciated?',
                    'Who is your favorite youtuber?',
                    'Start talking about bugs!'
                ];
                const randIndex = Math.floor(Math.random() * responses.length);

                message.delete();
                message.channel.send(responses[randIndex]);
                break;

            case 'dice':
            case 'd':
                let [numRolls, diceSize] = [1, 6];

                if (args.length > 0)
                {
                    if (args.length === 2)
                    {
                        [numRolls, diceSize] = [args[0], args[1]]
                    } else if (args.length === 1)
                    {
                        [numRolls, diceSize] = args[0].split('d');
                    }
                }

                let str = "";
                for (let i = 0; i < numRolls; i++)
                {
                    str = str + (Math.floor(Math.random() * diceSize) + 1) + ' ';
                }
                message.channel.send(numRolls + "d" + diceSize + ": " + str);
                

                break;
        }
    }
});

//TODO
/*
    * Mod Mail
    * Wholesomeness
    * Bonk Horny People
    * React to "senpai"
*/