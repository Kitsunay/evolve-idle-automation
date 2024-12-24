import { ResearchQueueInterface } from "./research-queue-interface";

export class ResearchInterface {
    public static readonly ResearchQueueInterface = ResearchQueueInterface;

    private static researchRefreshMutationObserver: MutationObserver = undefined;
    private static researchRefreshListeners = new Map<string, () => void>();

    public static get tabElement(): HTMLElement {
        return document.querySelector<HTMLElement>('#mTabResearch');
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
}