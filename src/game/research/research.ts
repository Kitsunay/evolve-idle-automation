import { Game } from "../game";
import { ResearchBuyObserver } from "./observers/research-buy-observer";
import { ResearchTabRefreshObserver } from "./observers/research-tab-refresh-observer";
import { ResearchItem } from "./research-item";
import { ResearchQueue } from "./research-queue";

export class Research {
    public static ResearchQueue = ResearchQueue;

    public static readonly onResearchBuy = new ResearchBuyObserver();
    public static readonly onResearchTabRefresh = new ResearchTabRefreshObserver();

    private static get tabElement(): HTMLElement {
        return document.querySelector<HTMLElement>('#mTabResearch');
    }

    private static get tabPanelElement(): HTMLElement {
        return this.tabElement.querySelector<HTMLElement>('#tech');
    }

    /**
     * List of researches that are visible in the research tab.
     */
    public static get availableResearches(): ResearchItem[] {
        return Array.from(this.tabPanelElement.querySelectorAll<HTMLElement>('[id^="tech-"]')).map(researchElement => new ResearchItem(researchElement));
    }

    /**
     * List of researches that can be purchased.
     * @returns 
     */
    public static get purchasableResearches(): ResearchItem[] {
        return this.availableResearches.filter((research) => research.isPurchasable);
    }

    /**
     * List of researches that have been completed.
     */
    public static get completedResearches(): ResearchItem[] {
        return Array.from(document.querySelectorAll<HTMLElement>('#oldTech [id^="tech-"].action')).map(researchElement => new ResearchItem(researchElement));
    }

    /**
     * Attempt to purchase the research.
     * @param research research to purchase
     * @returns true if purchase was successful, false otherwise
     */
    static tryBuyResearch(research: ResearchItem): boolean {
        if (!research.isPurchasable) {
            return false;
        }

        let numPrevQueueItems = Game.Research.ResearchQueue.queueItems.length;
        research.buyButtonElement.dispatchEvent(new Event('click'));
        let numCurrQueueItems = Game.Research.ResearchQueue.queueItems.length;

        if (numPrevQueueItems === numCurrQueueItems) {
            return true;
        }

        // If purchase failed and added a queue item, remove the queue item from the queue
        console.error('Failed to buy research', research);
        Game.Research.ResearchQueue.queueItems[0].buttonElement.dispatchEvent(new Event('click'));
        return false;
    }

    private static researchBuyMutationObserver: MutationObserver = undefined;
    private static researchBuyListeners = new Map<string, (researchId: string) => void>();

    private static previousResearches: string[] = [];

    /**
     * Adds a callback to be called when a research is bought
     * @param callback function to be called when a research is bought, with id of the research as a parameter
     * @param callbackId unique id for the callback to avoid duplicates, if specified, new callback will always replace the old one, otherwise only callbacks with the same code will not be duplicated
     */
    public static addOnResearchBuyListener(callback: (resourceId: string) => void, callbackId?: string) {
        if (!this.researchBuyMutationObserver) {
            this.researchBuyMutationObserver = new MutationObserver((mutationList, observer) => {
                // It is possible to determine what research was bought by comparing previously available and currently completed researches
                let completedResearches = this.completedResearches.map(research => research.id);

                for (const candidate of this.previousResearches) {
                    if (completedResearches.includes(candidate)) {
                        console.debug(`Research [${candidate}] bought`);
                        this.researchBuyListeners.forEach(callback => callback(candidate));
                    }
                }

                // Update previous researches for next observation
                this.previousResearches = this.availableResearches.map(research => research.id);
            });

            this.researchBuyMutationObserver.observe(this.tabPanelElement, { childList: true });
        }

        if (!callbackId) {
            callbackId = callback.toString(); // In case callback id was not provided, callback's actual code can be used as unique id
        }

        if (this.previousResearches.length === 0) { // Initialize available researches
            this.previousResearches = this.availableResearches.map(research => research.id);
        }

        this.researchBuyListeners.set(callbackId, callback);
    }
}