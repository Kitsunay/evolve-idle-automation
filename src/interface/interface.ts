export class Interface {
    static createElementFromString(childHtml: string, parent: Element, childIndex?: number): Element {
        // Prepare an element
        let element: Element = document.createElement('div'); // Create any element
        element.innerHTML = childHtml; // Put the expected string inside the temp element
        element = element.firstElementChild; // Pull the element object from the temp element

        if (childIndex >= 0 && childIndex < parent.children.length) {
            parent.insertBefore(element, parent.children.item(childIndex));
        } else {
            parent.appendChild(element);
        }

        return element;
    }
}