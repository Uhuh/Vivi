const fs = require('fs');

const commandHandler = (client) => {
  const helpCommands = []
  fs.readdirSync("commands/general/").forEach(file =>
    helpCommands.push(file.slice(0, -3))
  )

  for (const file of helpCommands) {
    const command = require(`./general/${file}`)
    client.commands.set(command.name.toLowerCase(), command)
  }
}

module.exports = commandHandler