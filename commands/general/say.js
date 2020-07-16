const say = {
    desc: ">:)",
    name: "say",
    args: "",
    type: "owner",
    run: (message, args) => {
        if (args.length > 0 && message.author == 223194058288267264)
        {
            message.delete();
            const toSay = args.join(' ');
            message.channel.send(toSay);
        }
    }
}

module.exports = say