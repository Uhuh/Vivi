import ViviBot from "../src/bot";
import * as fs from 'fs';

const commandHandler = (client: ViviBot) => {
  const helpCommands: string[] = [];
  const modCommands: string[] = [];
  fs.readdirSync("commands/general/").forEach(file =>
    helpCommands.push(file.slice(0, -3))
  );

  fs.readdirSync("commands/mod/").forEach(file =>
    modCommands.push(file.slice(0, -3))
  );

  for (const file of helpCommands) {
    const command = require(`./general/${file}`)
    client.commands.set(command.default.name.toLowerCase(), command.default)
  }

  for (const file of modCommands) {
    const command = require(`./mod/${file}`)
    client.commands.set(command.default.name.toLowerCase(), command.default)
  }
}

export default commandHandler;