import { AutoBuilding } from "./automation/auto-building/auto-building";

export class AutomationEngine {
    private static tickInterval: NodeJS.Timeout;
    private static tickCounter: number = 0;

    private static readonly TICK_INTERVAL: number = 1000;

    static tickIntervalToken: number;

    public static run(): void {
        AutoBuilding.init();

        if (this.tickInterval) clearInterval(this.tickInterval);

        // Generate a token for self-destruction in case the interval fails to unload
        let tickIntervalToken = Math.random();
        this.tickIntervalToken = tickIntervalToken;

        let tickInterval = setInterval(() => {
            console.log('Automation Tick', this.tickCounter++);

            let tickToken = tickIntervalToken;
            if (tickToken !== this.tickIntervalToken) {
                console.log('Attempting to destroy rogue tick interval.');
                clearInterval(tickInterval);
                return;
            }

            AutoBuilding.tick();
        }, this.TICK_INTERVAL);

        // On window unload, stop the interval to prevent unnecessary memory leaks
        window.addEventListener('beforeunload', () => {
            if (this.tickInterval) {
                clearInterval(this.tickInterval);
            }
        });
    }
}