import { AutoBuilding } from "./automation/auto-building/auto-building";
import { AutoResearch } from "./automation/auto-research/auto-research";
import { Automation } from "./automation/automation";

export class AutomationEngine {
    private static tickInterval: NodeJS.Timeout;
    private static tickCounter: number = 0;

    private static readonly TICK_INTERVAL: number = 1000;

    static tickIntervalToken: number;

    private static readonly AUTOMATIONS: Automation<any>[] = [new AutoBuilding(), new AutoResearch()];

    public static run(): void {
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

            console.debug('Automation Tick', this.tickCounter++);

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