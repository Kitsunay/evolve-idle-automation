import { Interface } from "../interface";
import { ResearchQueueItemInterface } from "./research-queue-item-interface";

export class ResearchQueueInterface {
    private static queueItemMutationObserver: MutationObserver = undefined;
    private static queueItemAddCallbacks = new Set<() => void>();
    private static queueItemRemovedCallbacks = new Set<() => void>();

    /**
     * Checks if the research queue interface element exists
     */
    public static get exists(): boolean {
        return !!this.rootElement;
    }

    /**
     * Returns the root HTML element
     */
    public static get rootElement(): HTMLElement {
        return document.querySelector<HTMLElement>(`#resQueue`);
    }

    /**
     * Returns current research queue items
     */
    public static get queueItems(): ResearchQueueItemInterface[] {
        let nodeList = this.queueListElement.querySelectorAll<HTMLElement>('li');
        return Array.from(nodeList).map(item => new ResearchQueueItemInterface(item))
    }

    private static get queueListElement(): HTMLElement {
        return this.rootElement.querySelector<HTMLElement>('.buildList');
    }
}