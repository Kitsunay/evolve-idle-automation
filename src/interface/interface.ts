/**
 * Collection of classes that provide convenience methods for modifying the game's UI
 */
export class Interface {
    static createChildElementFromString(childHtml: string, parent: Element, childIndex?: number): Element {
        // Prepare an element
        let element = this.createElementFromString(childHtml);

        if (childIndex >= 0 && childIndex < parent.children.length) {
            parent.insertBefore(element, parent.children.item(childIndex));
        } else {
            parent.appendChild(element);
        }

        return element;
    }

    static createSiblingElementFromString(siblingHtml: string, sibling: Element, insertPosition: InsertPosition = "afterend"): Element {
        let element = this.createElementFromString(siblingHtml);

        sibling.insertAdjacentElement(insertPosition, element);

        return element;
    }

    private static createElementFromString(elementHtml: string): Element {
        let element: Element = document.createElement('div'); // Create any element
        element.innerHTML = elementHtml; // Put the expected string inside the temp element
        element = element.firstElementChild; // Pull the element object from the temp element

        return element;
    }
}