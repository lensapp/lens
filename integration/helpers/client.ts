import { SpectronClient } from "spectron";

export async function click(client: SpectronClient, ...args: any[]): Promise<void> {
  console.debug("click", { args });

  await client.click(...args);
}

export async function waitUntilTextExists(client: SpectronClient, ...args: any[]): Promise<void> {
  console.debug("waitUntilTextExists", { args });

  await (client.waitUntilTextExists as any)(...args);
}

export async function waitForExist(client: SpectronClient, ...args: any[]): Promise<void> {
  console.debug("waitForExist", { args });

  await (client.waitForExist as any)(...args);
}

export async function waitForEnabled(client: SpectronClient, ...args: any[]): Promise<void> {
  console.debug("waitForEnabled", { args });

  await (client.waitForEnabled as any)(...args);
}

export async function waitForVisible(client: SpectronClient, ...args: any[]): Promise<void> {
  console.debug("waitForVisible", { args });

  await (client.waitForVisible as any)(...args);
}

export async function send(ipc: Electron.IpcRenderer, ...args: any[]): Promise<void> {
  console.debug("send", { args });

  await (ipc.send as any)(...args);
}
