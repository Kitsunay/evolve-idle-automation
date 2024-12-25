import { ResearchQueueItem } from "./research-queue-item";

export class ResearchQueue {
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
    public static get queueItems(): ResearchQueueItem[] {
        let nodeList = this.queueListElement.querySelectorAll<HTMLElement>('li');
        return Array.from(nodeList).map(item => new ResearchQueueItem(item))
    }

    private static get queueListElement(): HTMLElement {
        return this.rootElement.querySelector<HTMLElement>('.buildList');
    }
}