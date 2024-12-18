# evolve-idle-automation
## Description
An attempt to write unlockable automations for Evolve Idle, a very slow game that requires way too much user interaction.

This is not supposed to become an auto-play script. Players will have to unlock, enable and configure their automations in order to make them work. They are, however, pretty dumb, so playing actively is still going to result in faster progress. This serves as a higher-level gameplay compared to the vanilla experience, that eliminates unnecessary mindless clicking. The expected game-flow with this add-on is thus: unlock a new mechanic in the game -> use the mechanic manually to understand it -> unlock automation for the mechanic, using your experience to configure it properly.

Disclaimer: this is a personal project that will evolve very slowly as I progress through the game. 

Latest milestone: Unlocked plasmids (13.12.2024)

## Motivation
Since I like playing incremental-style games with tons of automations that unlock as I make progress, I would like to see such a thing in this game, too. And I'm not seeing any signs that automations do exist within the game. Because of this, I am now attempting to step up my automation game and write them myself.

## How to Install
This extension is not available in official Firefox extension store, as it barely does anything.

## How to Run in Local Environment
This is a TypeScript Firefox extension. As such, it must be built before installation.
Project's package.json contains packages and commands required to build and also run the extension (although in a new window). In order to build it, you need the latest LTS node.js installed (currently v22.12).
The extension can be built from the command line with command "npm run build" and run it with command "npm run start". Both commands are scripts defined in package.json.

## Game Configuration Pre-requisites
The game prefers to keep hardware load to a minimum and completely destroys elements on tabs that are not visible. However, this extension simulates user interaction and mouse clicks, and as such, it requires buttons to exist, even if they are not visible. This is achievable by accessing the game's settings and making sure option "Preload Tab Content" is on.

## Content
### Auto-Building
Purchases buildings as soon as they can be bought.
TODO: Unlock automation after building queue is researched, unlock for each building when amount of that building reaches 10-15 (TBD)

### Auto-Research
Researches the first thing that is researchable. Will auto-research only technologies that have already been manually researched in previous resets to prevent accidentally unlocking new mechanics.
TODO: Unlock if plasmids exist (after first reset) and research queue is researched

## TODO:
- Auto-Workers - requires management of farmers so citizens don't starve
- Auto-Building auto-discovers new buildings and assigns them to a proper category (standard, with food upkeep (civilian and military), with resource upkeep, with energy upkeep)
- Auto-Building unlocks after building queue is researched, each building unlocks when amount of that building reaches 10-15 (TBD)
- Auto-Research unlocks if plasmids exist (after first reset) and research queue is researched for the second time
- Auto-Storage - purchase crates only if resource reaches cap/configurable percentage
- Auto-Market - uses only trade routes to not break balance, requires auto-sell/auto-buy managment, player defines priorities (what has high priority to buy, what has high priority to sell)
- Auto-Building for buildings with upkeep costs
- Auto-Industry - ???
- Auto-Building for buildings with energy upkeep
- Auto-Battle - just click the battle button whenever all soldiers are ready
- Auto-Energy - Simple priority list???
- Auto-Building shouldn't purchase if building queue is not empty (to allow for manual priritization)
- Auto-Research shouldn't purchase if research queue is not empty (to allow for manual priritization)
- Automation progression, to inform players what they need to do to unlock the next automation + information about how the automations work should be available within the game window