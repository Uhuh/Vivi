const Discord = require('discord.js');
let reputation = require('../../reputation.json');

const rep = {
    desc: 'Check Your, or Another Users Rep',
    name: 'rep',
    args: '[@user]',
    type: '',
    run: (message, args) => {
        let userArg = (args.length === 0 ? message.author : message.mentions.members.last());
        let uRep = 0;

        if (!userArg) return;

        if(!reputation[userArg.id])
        {
            reputation[userArg.id] = {
                repu: 0
            };
        }
        uRep = reputation[userArg.id].repu;

        message.channel.send(`${userArg} has ${uRep} repuation points!`);
            //.then(msg => {
            //    msg.delete({ timeout: 10000 } )
            //});
    }
}

module.exports = rep