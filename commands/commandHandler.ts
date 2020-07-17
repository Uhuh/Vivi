import BowBot from "../src/bot";
import * as fs from 'fs';

const commandHandler = (client: BowBot) => {
  const helpCommands: string[] = []
  fs.readdirSync("commands/general/").forEach(file =>
    helpCommands.push(file.slice(0, -3))
  )

  for (const file of helpCommands) {
    const command = require(`./general/${file}`)
    client.commands.set(command.default.name.toLowerCase(), command.default)
  }
}

export default commandHandler;