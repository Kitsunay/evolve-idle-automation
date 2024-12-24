import { ResearchItemInterface } from "./research-item-interface";
import { ResearchQueueInterface } from "./research-queue-interface";

export class ResearchInterface {
    public static readonly ResearchQueueInterface = ResearchQueueInterface;
    //public static readonly CompletedResearchInterface = CompletedResearchInterface;

    private static researchRefreshMutationObserver: MutationObserver = undefined;
    private static researchRefreshListeners = new Map<string, () => void>();

    private static researchBuyMutationObserver: MutationObserver = undefined;
    private static researchBuyListeners = new Map<string, (researchId: string) => void>();

    private static previousResearches: string[] = [];

    private static get tabElement(): HTMLElement {
        return document.querySelector<HTMLElement>('#mTabResearch');
    }

    private static get tabPanelElement(): HTMLElement {
        return this.tabElement.querySelector<HTMLElement>('#tech');
    }

    public static get researchItems(): ResearchItemInterface[] {
        return Array.from(this.tabPanelElement.querySelectorAll<HTMLElement>('[id^="tech-"]')).map(researchElement => new ResearchItemInterface(researchElement));
    }

    public static get completedResearchItems(): ResearchItemInterface[] {
        return Array.from(document.querySelectorAll<HTMLElement>('#oldTech [id^="tech-"].action')).map(researchElement => new ResearchItemInterface(researchElement));
    }

    /**
     * Adds a callback to be called when the research tab is fully refreshed, which happens when an item is added/removed
     * from research queue.
     * @param callback function to be called when the research tab is refreshed
     * @param callbackId unique id for the callback to avoid duplicates, if specified, new callback will always replace the old one, otherwise only callbacks with the same code will not be duplicated
     */
    public static addOnResearchRefreshListener(callback: () => void, callbackId?: string) {
        if (!this.researchRefreshMutationObserver) {
            this.researchRefreshMutationObserver = new MutationObserver((mutationList, observer) => {
                console.debug('Research tab refreshed');
                this.researchRefreshListeners.forEach(callback => callback());
            });

            this.researchRefreshMutationObserver.observe(this.tabElement, { childList: true });
        }

        if (!callbackId) {
            callbackId = callback.toString(); // In case callback id was not provided, callback's actual code can be used as unique id
        }

        this.researchRefreshListeners.set(callbackId, callback);
    }

    /**
     * Adds a callback to be called when a research is bought
     * @param callback function to be called when a research is bought, with id of the research as a parameter
     * @param callbackId unique id for the callback to avoid duplicates, if specified, new callback will always replace the old one, otherwise only callbacks with the same code will not be duplicated
     */
    public static addOnResearchBuyListener(callback: (resourceId: string) => void, callbackId?: string) {
        if (!this.researchBuyMutationObserver) {
            this.researchBuyMutationObserver = new MutationObserver((mutationList, observer) => {
                // It is possible to determine what research was bought by comparing previously available and currently completed researches
                let completedResearches = this.completedResearchItems.map(research => research.id);

                for (const candidate of this.previousResearches) {
                    if (completedResearches.includes(candidate)) {
                        console.debug(`Research [${candidate}] bought`);
                        this.researchBuyListeners.forEach(callback => callback(candidate));
                    }
                }

                // Update previous researches for next observation
                this.previousResearches = this.researchItems.map(research => research.id);
            });

            this.researchBuyMutationObserver.observe(this.tabPanelElement, { childList: true });
        }

        if (!callbackId) {
            callbackId = callback.toString(); // In case callback id was not provided, callback's actual code can be used as unique id
        }

        if (this.previousResearches.length === 0) { // Initialize available researches
            this.previousResearches = this.researchItems.map(research => research.id);
        }

        this.researchBuyListeners.set(callbackId, callback);
    }
}