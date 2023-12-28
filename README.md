# Minecraft Mods Updater
A Minecraft mod update tool based on Node.js

## Installation
### Using npm
```bash
npm install -g minecraft-mods-updater
```

## Example
```bash
mcmu -h
mcmu -mp "./MyModPack/manifest.json" -od "./MyModPack" -ak "xxxxxxxxxxxxxxxxxxxxxx" -fd
```

## Parameter
```text
Options:
  -V, --version               output the version number
  -mp, --manifestPath <path>  path to the manifest file
  -od, --outDir <path>        path to the output
  -ak, --apiKey <text>        api key
  -fd, --forceDownload        force download
  -h, --help                  display help for command
```