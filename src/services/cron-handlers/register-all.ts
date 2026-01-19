import { registerCronHandler } from './index';
import { publishPostHandler } from './publish-post';
import { publishAdvHandler } from './publish-adv';

export function registerAllCronHandlers() {
  registerCronHandler('publish_post', publishPostHandler);
  registerCronHandler('publish_adv', publishAdvHandler);
}
