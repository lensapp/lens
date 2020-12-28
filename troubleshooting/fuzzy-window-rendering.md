# Fuzzy window rendering on external 4K display

MacOS users can encouter visual bug with fuzzy lines appeared while connected to external 4K display https://www.forbes.com/sites/gordonkelly/2020/06/11/apple-macos-macbook-pro-google-chrome-display-problem/?sh=331ac27967b4. Same thing can happen with any of Electron applications or Chrome itself.

![fuzzy lines](https://user-images.githubusercontent.com/4453/78537270-80cc8e80-77ef-11ea-8a6e-0bc69cc28abe.png "Fuzzy lines on MacOS")

As a temporary workaround there is a possibility to disable Chromium GPU acceleration. To do this for Lens, you need to provide `LENS_DISABLE_GPU=true` env variable and relaunch app.

First, open `.bash_profile` file from your terminal

```
open -a TextEdit.app ~/.bash_profile
```

Then, add this line

```
export LENS_DISABLE_GPU=true
```

Save it and restart Lens.

*Original bug can be tracked here https://bugs.chromium.org/p/chromium/issues/detail?id=1068170.*
