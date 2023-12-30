# Minecraft Mod Updater
A Minecraft mod update tool based on Node.js

## Installation
### Using npm
```bash
npm install -g minecraft-mod-updater
```

## Example
```bash
mcmu -h
mcmu -i "./MyModPack/manifest.json" -o "./MyModPack" -k "xxxxxxxxxxxxxxxxxxxxxx" -f
```

## Parameter
```text
Options:
  -V, --version             output the version number
  -i, --file <path>         path to the manifest file
  -o, --outDir <path>       path to the output
  -k, --apiKey <text>       api key
  -f, --forceDownload       force download
  -h, --help                display help for command
```