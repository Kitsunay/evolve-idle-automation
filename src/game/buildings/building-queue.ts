import { BuildingQueueItem } from "./building-queue-item";

export class BuildingQueue {
    /**
     * Checks if the building queue interface element exists
     */
    public static get exists(): boolean {
        return !!this.rootElement;
    }

    /**
     * Returns the root HTML element
     */
    private static get rootElement(): HTMLElement {
        return document.querySelector<HTMLElement>(`#buildQueue`);
    }

    /**
     * Returns current building queue items
     */
    public static get queueItems(): BuildingQueueItem[] {
        let nodeList = this.queueListElement.querySelectorAll<HTMLElement>('li');
        return Array.from(nodeList).map(item => new BuildingQueueItem(item))
    }

    private static get queueListElement(): HTMLElement {
        return this.rootElement.querySelector<HTMLElement>('.buildList');
    }
}