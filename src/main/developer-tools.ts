/**
 * Installs Electron developer tools in the development build.
 * The dependency is not bundled to the production build.
 */
export const installDeveloperTools = async () => {
  if (process.env.NODE_ENV === 'development') {
    const { default: devToolsInstaller, REACT_DEVELOPER_TOOLS } = await import('electron-devtools-installer');

    return devToolsInstaller([REACT_DEVELOPER_TOOLS]);
  }
};
