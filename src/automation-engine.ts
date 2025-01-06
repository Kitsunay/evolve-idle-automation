import { AutoBuilding } from "./automation/auto-building/auto-building";
import { AutoEnergy } from "./automation/auto-energy/auto-energy";
import { AutoEvolution } from "./automation/auto-evolution/auto-evolution";
import { AutoIndustry } from "./automation/auto-industry/auto-industry";
import { AutoMarket } from "./automation/auto-market/auto-market";
import { AutoMilitary } from "./automation/auto-military/auto-military";
import { AutoResearch } from "./automation/auto-research/auto-research";
import { AutoStorage } from "./automation/auto-storage/auto-storage";
import { AutoWorker } from "./automation/auto-worker/auto-worker";
import { Automation } from "./automation/automation";
import { Game } from "./game/game";
import { Toast } from "./interface/components/toast/toast";

export class AutomationEngine {
    private static tickInterval: NodeJS.Timeout;
    private static tickCounter: number = 0;

    private static readonly TICK_INTERVAL: number = 1000;

    static tickIntervalToken: number;

    private static readonly AUTOMATIONS: Automation<any>[] = [
        new AutoBuilding(),
        new AutoResearch(),
        new AutoWorker(),
        new AutoStorage(),
        new AutoMarket(),
        new AutoMilitary(),
        new AutoEnergy(),
        new AutoIndustry(),
        new AutoEvolution(),
    ];

    public static run(): void {
        if (!Game.Settings.preloadTabContent) {
            // Notify the player that automations won't work unless game setting "Preload Tab Content" is set to on
            new Toast('<div id="preload_tab_content_error"><div class="icon icon-alert icon-color-danger icon-size-48"></div><div class="has-text-warning">Setting "Preload Tab Content" is set to off. In this state, automations can only affect currently open tab, or they might break completely. In order to make automations function on all tabs, please set "Preload Tab Content" on game "Settings" tab to on and reload the page.</div></div>');
        }

        for (const automation of this.AUTOMATIONS) {
            automation.init();
        }

        if (this.tickInterval) clearInterval(this.tickInterval);

        // Generate a token for self-destruction in case the interval fails to unload
        let tickIntervalToken = Math.random();
        this.tickIntervalToken = tickIntervalToken;

        let tickInterval = setInterval(() => {
            let tickToken = tickIntervalToken;
            if (tickToken !== this.tickIntervalToken) {
                console.log('Attempting to destroy rogue tick interval.');
                clearInterval(tickInterval);
                return;
            }

            //console.debug('Automation Tick', this.tickCounter++);

            for (const automation of this.AUTOMATIONS) {
                automation.tick();
            }
        }, this.TICK_INTERVAL);

        // On window unload, stop the interval to prevent unnecessary memory leaks
        window.addEventListener('beforeunload', () => {
            if (this.tickInterval) {
                clearInterval(this.tickInterval);
            }
        });
    }

    public static updateAllUI() {
        for (const automation of this.AUTOMATIONS) {
            automation.updateUI();
        }
    }
}