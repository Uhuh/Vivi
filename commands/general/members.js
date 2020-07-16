const members = {
    desc: "Shows Current Member Count",
    name: "members",
    args: "",
    type: '',
    run: (message) => {
        message.channel.send(`Total Members (Minus Bots): ${message.guild.members.cache.filter(member => !member.user.bot).size}`);
    }
}

module.exports = members