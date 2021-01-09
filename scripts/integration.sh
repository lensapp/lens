case $1 in
  mac)
    find ~/Library/Logs/Lens -type file -name *.log -delete
  ;;
  linux)
    find ~/.config/Lens -type file -name *.log -delete
  ;;
  win)
    find %APPDATA%/Lens -type file -name *.log -delete
  ;;
esac

yarn build:$1
DEBUG=true yarn integration-runner

if [ $? -ne 0 ]; then
  case $1 in
    mac)
      find ~/Library/Logs/Lens -type file -name *.log -exec cat {} \;
    ;;
    linux)
      find ~/.config/Lens -type file -name *.log -exec cat {} \;
    ;;
    win)
      find %APPDATA%/Lens -type file -name *.log -exec cat {} \;
    ;;
  esac
fi
