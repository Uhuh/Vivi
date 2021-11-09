import ViviBot from './bot';
import { LogService } from './services/logService';

const Vivi = new ViviBot();

Vivi.start().catch((e) => {
  LogService.logError(`Encountered an error when trying to start up.`);
  LogService.logError(e);
});
