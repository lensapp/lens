# Using Extensions

The features that Lens includes out-of-the-box are just the start.
Lens extensions let you add new features to your installation to support your workflow.
Rich extensibility model lets extension authors plug directly into the Lens UI and contribute functionality through the same APIs used by Lens itself.
The start using Lens Extensions go to **File** (or **Lens** on macOS) > **Extensions** in the application menu.
This is the `Extensions` management page where all the management of the extensions you want to use is done.

![Extensions](images/extensions.png)

## Installing an Extension

There are three ways to install extensions.
If you have the extension as a `.tgz` file then dragging and dropping it in the extension management page will install it for you.
If it is hosted on the web, you can paste the URL and click `Install` and Lens will download and install it.
The third way is to move the extension into your `~/.k8slens/extensions` (or `C:\Users\<user>\.k8slens\extensions`) folder and Lens will automatically detect it and install the extension.

## Enabling or Disabling an Extension

Go to the extension management page and click either the `Enable` or `Disable` buttons.
Extensions will be enabled by default when you first install them.
A disabled extension is not loaded by Lens and is not run.

## Uninstalling an Extension

If, for whatever reason, you wish to remove the installation of an extension simple click the `Uninstall` button. This will remove all the files that Lens would need to run the extension.
