# Minecraft Mod Updater
### A Minecraft mod update tool based on Node.js

## Installation
### Using npm
```bash
npm install -g minecraft-mod-updater
```

## Command
### CLI (Command aliases)
```bash
minecraft-mod-updater-cli
mcmu-cli
mcmuc
```
### GUI (Command aliases)
```bash
minecraft-mod-updater-gui
mcmu-gui
mcmug
```


## Example
### CLI (Parameters are optional)
```bash
mcmuc -h
mcmuc -i "./MyModPack/manifest.json" -o "./MyModPack" -k "xxxxxxxxxxxxxxxxxxxxxx" -f
```
### GUI (Parameters are optional)
```bash
mcmug -h
mcmug -i "./MyModPack/manifest.json" -o "./MyModPack" -k "xxxxxxxxxxxxxxxxxxxxxx" -f
```

## Parameter (General parameters)
```text
Options:
  -V, --version             output the version number
  -i, --file <path>         path to the manifest file
  -o, --outDir <path>       path to the output
  -k, --apiKey <text>       api key
  -f, --forceDownload       force download
  -h, --help                display help for command
```