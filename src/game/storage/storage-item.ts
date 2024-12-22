import { StorageAssignmentItem } from "./storage-assignment-item";

export class StorageItem {
    public readonly name: string;
    public readonly element: HTMLElement;

    public get visible(): boolean {
        return this.element.querySelector<HTMLElement>('button').style.display !== 'none';
    }

    public get buyButton(): HTMLElement {
        return this.element.querySelector<HTMLElement>('button');
    }

    /**
     * Amount of purchased storage items
     */
    public get count(): number {
        return this.assignedCount + this.freeCount;
    }

    /**
     * Amount of storage items that are not assigned to a resource
     */
    public get freeCount(): number {
        let countText = document.querySelector<HTMLElement>(`#cnt${this.name[0].toUpperCase()}${this.name.slice(1)}s`).textContent;
        let countString = countText.split('/')[0].trim(); // Remove max count from string

        return parseInt(countString);
    }

    /**
     * Amount of assigned storage items
     */
    public get assignedCount(): number {
        let count = 0;
        let assignments = this.assignments;

        for (const assignment of assignments) {
            count += assignment.count;
        }

        return count;
    }

    /**
     * Maximum purchasable amount of this storage item
     */
    public get maxCount(): number {
        let countString = document.querySelector<HTMLElement>(`#cnt${this.name[0].toUpperCase()}${this.name.slice(1)}s`).textContent;
        let maxCountString = countString.split('/')[1].trim(); // Get max count from string

        let maxCount = parseInt(maxCountString); // Convert to number

        // Add assigned count to max count (because the game doesn't do this)
        let assignments = this.assignments;
        for (const assignment of assignments) {
            maxCount += assignment.count;
        }

        return maxCount;
    }

    public get assignments(): StorageAssignmentItem[] {
        // Collect elements with storage item counts per each resource
        let resourceRows = Array.from(document.querySelectorAll<Element>('#resStorage .market-item:not([style="display: none;"])[id^="stack-"]'));
        let resourceIds = resourceRows.map((element) => element.id); // I can build object for each resource

        let assignments: StorageAssignmentItem[] = [];

        for (const resourceId of resourceIds) {
            let storageAssignmentItem = new StorageAssignmentItem(this.name, resourceId);

            assignments.push(storageAssignmentItem);
        }

        return assignments;
    }

    getResourceAssignment(resource: string): StorageAssignmentItem {
        return new StorageAssignmentItem(this.name, resource);
    }

    public static fromName(name: string): StorageItem {
        return new StorageItem(name);
    }

    constructor(name?: string, element?: HTMLElement) {
        if (element) {
            this.element = element;
            this.name = element.classList.item(0);
            return;
        }

        if (name) {
            this.name = name;
            this.element = document.querySelector<HTMLElement>(`#resStorage #createHead > div.${name}`);
            return;
        }
    }
}