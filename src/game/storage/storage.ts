import { StorageAssignmentItem } from "./storage-assignment-item";
import { StorageItem } from "./storage-item";

export class Storage {
    /**
     * List of available items to increase storage
     */
    public static get storageItems(): StorageItem[] {
        // Collect all elements in storage tab that are buyable in the header
        let elements = Array.from(document.querySelectorAll<HTMLElement>('#resStorage #createHead > div'));

        // Names of storage items are the first class in class list (for some reason)
        let names = elements.map((element) => element.classList.item(0));

        let storageItems = names.map((name) => StorageItem.fromName(name)); // Create storage items from names

        // Filter out storage items that are not visible (e.g. those that are unlocked by researches)
        storageItems = storageItems.filter((item) => item.visible);

        return storageItems;
    }

    /**
     * Gets a single storage item by its name
     * @param name 
     */
    static getStorageItem(name: string) {
        return StorageItem.fromName(name);
    }

    /**
     * Attempts to buy a storage item
     * @param storageItem 
     */
    static tryBuyStorageItem(storageItem: StorageItem) {
        let prevCount = storageItem.count;
        storageItem.buyButton.dispatchEvent(new Event('click'));
        return prevCount !== storageItem.count;
    }

    /**
     * Extends storage of a resource by assigning a storage item
     * @param storageItem 
     * @param resource 
     */
    static addStorageItem(assignment: StorageAssignmentItem) {
        assignment.addButton.dispatchEvent(new Event('click'));
    }

    static removeStorageItem(assignment: StorageAssignmentItem) {
        assignment.subButton.dispatchEvent(new Event('click'));
    }
}