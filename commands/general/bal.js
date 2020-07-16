const Discord = require('discord.js');
let coins = require('../../coins.json');

const bal = {
    desc: 'Check your Balance',
    name: 'bal',
    args: '[@user]',
    type: '',
    run: (message, args) => {
        if(!coins[message.author.id])
        {
            coins[message.author.id] = {
                coins: 0
            };
        }

        let uCoins = coins[message.author.id].coins;

        message.delete();
        message.channel.send(`${message.author}, You have **${uCoins}** Bow-Bucks!`)
            .then(msg => {
                msg.delete({ timeout: 5000 } )
            });
    }
}

module.exports = bal