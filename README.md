# evolve-idle-automation
## Description
An attempt to write unlockable automations for Evolve Idle, a very slow game that requires way too much user interaction.

This is not an auto-play script. You will have to unlock, enable and configure your automations in order to make them work. This serves as a higher-level gameplay compared to the vanilla experience. The expected game-flow with this add-on is thus: unlock a new mechanic in the game -> use the mechanic manually to understand it -> unlock automation for the mechanic, using your experience to configure it properly.

Disclaimer: this is a personal project that will evolve very slowly as I progress through the game. 

Latest milestone: Unlocked plasmids (13.12.2024)

## Motivation
Since I like playing incremental-style games with tons of automations that unlock as I make progress, I would like to see such a thing in this game, too. And I'm not seeing any signs that automations do exist within the game. Because of this, I am now attempting to step up my automation game and write them myself.

## How to Install
This extension is not available in official FireFox extension store, as it barely does anything.

## How to Run in Local Environment
This is a TypeScript Firefox extension. As such, it must be built before installation.
Project's package.json contains packages and commands required to build and also run the extension (although in a new window). In order to build it, you need the latest LTS node.js installed (currently v22.12).
You can build the extension from the command line with command "npm run build" and run it with command "npm run start". Both commands are are scripts defined in package.json.

## Game Configuration Pre-requisites
The game prefers to keep hardware load to a minimum and completely destroys elements on tabs that are not visible. However, the extension simulates user interaction and mouse clicks, and as such, it requires buttons to exist, even if they are not visible. This is achievable by accessing the game's settings and making sure option "Preload Tab Content" is on.