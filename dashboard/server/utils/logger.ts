import chalk from "chalk";
import * as ip from "ip"

const divider = chalk.gray('-----------------------------------');

export const logger = {
  // Called when express.js app starts on given port w/o errors
  appStarted: (port: string | number, title = 'Server started ') => {
    console.log(chalk.underline.bold(title) + ` ${chalk.green('✓')}`);
    console.log(`
    ${chalk.bold('Access URLs:')}
    ${divider}
    Localhost: ${chalk.magenta(`http://localhost:${port}`)}
    LAN: ${chalk.magenta(`http://${ip.address()}:${port}`)}
    ${divider}
    `);
  },

  error(message: string, error: any) {
    let errString = ""
    try {
      errString = JSON.stringify(error, null, 2);
    } catch (e) {
      errString = String(error);
    }
    console.error(chalk.bold.red(`[ERROR] -> ${message}`), errString);
  }
};

export function sanitizeHeaders(headers: { [name: string]: string }) {
  if (headers.Authorization) {
    const [authType, authToken] = headers.Authorization.split(" ");
    headers.Authorization = `${authType} *****`
  }
  return headers;
}
