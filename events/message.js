const msg = (client, message) => {
    // Ignore bots
    if (message.author.bot) return;
  
    if (message.content.toLowerCase().startsWith(client.prefix)) {
      // + 1 for the damn space.
      const [command, ...args] = message.content.substring(client.prefix.length).match(/\S+/g) || [];
  
      //If the command isn't in the big ol' list.
      const clientCommand = client.commands.get(command.toLowerCase());
      if (!clientCommand)
        return console.log("Command DNE");
  
      try {
        // Find the command and run it.
        //console.log(args);
        clientCommand.run(message, args, client);
      } catch(e) {
        message.reply('something went wrong!', e);
        console.error(e);
      }
    }
  };
  
  module.exports = msg;