const Discord = require('discord.js');
const fs = require('fs');
let reputation = require('../../reputation.json');

const giverep = {
    desc: '(ADMIN) Give rep to user',
    name: 'giverep',
    args: '<@user> <Rep>',
    type: 'admin',
    run: (message, args) => {
        if (!message.guild || !message.member?.hasPermission(["MANAGE_GUILD"])) return;
        const userArg = message.mentions?.members?.last();
        if (args.length < 1 || Number.isNaN(Number(args[1])) || !userArg || message.author.id === userArg.id ) return;
        let uRep = (args[1] > 0 ? Math.ceil(args[1]) : 1);

        if(!reputation[userArg.id])
        {
            reputation[userArg.id] = {
                repu: Math.min(uRep, 4294967296)
            };
        } else
        {
            reputation[userArg.id] = {
                repu: Math.min(reputation[userArg.id].repu + uRep, 4294967296)
            };
        }

        fs.writeFile("./reputation.json", JSON.stringify(reputation), (err) => {
            if (err) console.log(err);
        });

        message.channel.send(`${message.author} gave ${userArg} ${uRep}!`);

        /*const repRoles = [
            { id: "", repThresh: 0},
            { id: "", repThresh: 0}
        ];
      
        const member = message.guild?.members.cache.get(userArg.id);
        for(const role of repRoles) {
            if(reputation[userArg.id].repu >= role.repThresh) {
                member?.roles.add(role.id);
            }
        }*/
    }
}

module.exports = giverep