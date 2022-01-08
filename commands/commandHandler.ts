import ViviBot from '../src/bot';
import * as configCommands from './config';
import * as modCommands from './mod';
import * as generalCommands from './general';

const commandHandler = (client: ViviBot) => {
  for (const cmd of Object.values(generalCommands)) {
    client.commands.set(cmd.name.toLowerCase(), cmd);
  }

  for (const cmd of Object.values(modCommands)) {
    client.commands.set(cmd.name.toLowerCase(), cmd);
  }

  for (const cmd of Object.values(configCommands)) {
    client.commands.set(cmd.name.toLowerCase(), cmd);
  }
};

export default commandHandler;
