import { Game } from "../../game";
import { Observer } from "../../common/observer";

export class ResearchBuyObserver extends Observer<(resourceId: string) => void> {
    protected observedElement: HTMLElement = document.querySelector<HTMLElement>('#tech');
    protected observerConfig: MutationObserverInit = { childList: true };

    private previousResearches: string[] = [];

    protected onMutation(mutationList: MutationRecord[], observer: MutationObserver, listeners: Map<string, (resourceId: string) => void>): void {
        // It is possible to determine what research was bought by comparing previously available and currently completed researches
        let completedResearches = Game.Research.completedResearches.map(research => research.id);

        for (const candidate of this.previousResearches) {
            if (completedResearches.includes(candidate)) {
                console.debug(`Research [${candidate}] bought`);
                listeners.forEach(callback => callback(candidate));
            }
        }

        // Update previous researches for next observation
        this.previousResearches = Game.Research.availableResearches.map(research => research.id);
    }

    protected init(): void {
        if (this.previousResearches.length === 0) { // Initialize available researches
            this.previousResearches = Game.Research.availableResearches.map(research => research.id);
        }
    }
}