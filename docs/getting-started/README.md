# Getting Started

Lens is lightweight and simple to install. You'll be up and running in just a few minutes.


## System Requirements

Review the [System Requirements](../supporting/requirements.md) to check if your computer configuration is supported.


## macOS

1. [Download Lens](https://github.com/lensapp/lens/releases) for macOS.
2. Open the browser's download list and locate the downloaded archive.
3. Select the 'magnifying glass' icon to open the archive in Finder.
4. Double-click `Lens-{version}.dmg` and drag `Lens.app` to the `Applications` folder, making it available in the macOS Launchpad.
5. Add Lens to your Dock by right-clicking on the icon to bring up the context menu and choosing **Options**, **Keep in Dock**.


## Windows

1. Download the [Lens installer](https://github.com/lensapp/lens/releases) for Windows.
2. Once it is downloaded, run the installer `Lens-Setup-{version}.exe`. This will only take a minute.
3. By default, Lens is installed under `C:\users\{username}\AppData\Local\Programs\Lens`.


## Linux

See the [Download Lens](https://github.com/lensapp/lens/releases) page for a complete list of available installation options.

After installing Lens manually (not using a package manager file such as `.deb` or `.rpm`) the following will need to be done to allow protocol handling.
This assumes that your linux distribution uses `xdg-open` and the `xdg-*` suite of programs for determining which application can handle custom URIs.

1. Create a file called `lens.desktop` in either `~/.local/share/applications/` or `/usr/share/applications` (if you have permissions and are installing Lens for all users).
1. That file should have the following contents, with `<path/to/executable>` being the absolute path to where you have installed the unpacked `Lens` executable:
    ```
    [Desktop Entry]
    Name=Lens
    Exec=<path/to/executable> %U
    Terminal=false
    Type=Application
    Icon=lens
    StartupWMClass=Lens
    Comment=Lens - The Kubernetes IDE
    MimeType=x-scheme-handler/lens;
    Categories=Network;
    ```
1. Then run the following command:
    ```
    xdg-settings set default-url-scheme-handler lens lens.desktop
    ```
1. If that succeeds (exits with code `0`) then your Lens install should be set up to handle `lens://` URIs.

### Snap

Lens is officially distributed as a Snap package in the [Snap Store](https://snapcraft.io/store):

[![Get it from the Snap Store](images/snap-store.png)](https://snapcraft.io/kontena-lens)

You can install it by running:

```bash
sudo snap install kontena-lens --classic
```

## Update Cadence

Lens releases a new version each month with new features and important bug fixes. Lens supports auto updating and you will be prompted to install the new release when it becomes available!

To stay current with the Lens features, you can review the [release notes](https://github.com/lensapp/lens/releases).


## Next Steps

- [Add clusters](../clusters/adding-clusters.md)
- [Watch introductory videos](./introductory-videos.md)
