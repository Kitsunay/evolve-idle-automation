import { Game } from "../../game/game";
import { ToggleButton } from "../../interface/components/toggle-button/toggle-button";
import { Interface } from "../../interface/interface";
import { AutoEnergyState } from "./auto-energy-state";
import { EnergyConsumer } from "./energy-consumer";

export class AutoEnergyInterface {
    static update(state: AutoEnergyState, onEnabledToggle: () => void, onDrop: (buildingIds: string[], newGroupBetween: { min: number, max: number }, newPriority: number) => void) {
        // Add a toggle button for using auto-energy's active energy distribution vs. the game's legacy energy distribution
        let buttonId = "auto-energy-button";
        let button = ToggleButton.getOrCreate(
            buttonId,
            document.querySelector<Element>(`#powerGrid`),
            {
                textContent: {
                    on: "Active Distribution",
                    off: "Legacy Distribution"
                },
                position: 0,
                styleClass: "auto-energy"
            }
        );

        button.isToggled = state.enabled;
        button.onToggle = onEnabledToggle;

        // Create an element for each resource that can be electrified
        for (const energyConsumer of state.energyConsumers) {
            this.tryDestroyAndCreateEnergyConsumerElement(energyConsumer, onDrop);
        }

        // Finalize the container element by adding/removing empty divs between categories to allow moving elements between them, creating new categories as needed
        this.finalizeContainerElement(onDrop);

        // Change visibility of auto-energy interface and legacy interface based on whether the auto-energy is enabled or not
        this.updateVisibility(state.enabled);
    }

    static updateVisibility(enabled: boolean) {
        // Get main element
        let powerGridlement = document.querySelector<Element>(`#powerGrid`);

        // Child 1 is the auto-energy container
        let containerElement = powerGridlement.children[1];
        this.setVisibility(enabled, containerElement);

        // All the other children are the legacy interface
        for (let i = 2; i < powerGridlement.children.length; i++) {
            this.setVisibility(!enabled, powerGridlement.children[i]);
        }
    }

    private static setVisibility(visible: boolean, element: Element) {
        if (visible) {
            element.removeAttribute('style');
        } else {
            element.setAttribute('style', 'display: none;');
        }
    }

    static destroyInterface() {
        let containerId = "auto-energy-container";
        let containerElement = document.querySelector<Element>(`#${containerId}`);

        if (containerElement) {
            containerElement.remove();
        }
    }

    /**
     * Builds the root interface element of this automation
     * @returns 
     */
    private static getOrCreateContainerElement() {
        let containerId = "auto-energy-container";
        let containerElement = document.querySelector<Element>(`#${containerId}`);

        if (!containerElement) {
            let parent = document.querySelector<Element>(`#powerGrid`);
            let elementString = `<div id="${containerId}"></div>`;
            containerElement = Interface.createChildElementFromString(elementString, parent, 1); // Have it be after the button
        }

        return containerElement;
    }

    /**
     * Builds an element for a specific energy consumer, including a container for its priority if it doesn't exist
     * @param energyConsumer 
     */
    private static tryDestroyAndCreateEnergyConsumerElement(energyConsumer: EnergyConsumer, onDrop: (buildingIds: string[], newGroupBetween: { min: number, max: number }, newPriority: number) => void) {
        let containerElement = this.getOrCreateEnergyConsumerGroupElement(energyConsumer.priority, onDrop);

        let elementId = `auto-energy-${energyConsumer.id}`;
        let element = document.querySelector<Element>(`#${elementId}`);

        if (element) {
            element.remove(); // Remove the element if it already exists
        }

        let building = Game.PowerGrid.getBuilding(energyConsumer.id);

        let elementString = `<div id="${elementId}"${building.isVisible && building.isElectrified ? '' : ' class="inactive"'} draggable="true"><div class="label">${building.fullName}</div><div class="inactive-count">${building.inactiveCount}</div><div class="active-count">${building.activeCount}</div></div>`;
        element = Interface.createChildElementFromString(elementString, containerElement);
        this.initDraggableElement(element);
    }

    /**
     * Builds an element that groups together energy consumers with the same priority
     * @param priority 
     */
    static getOrCreateEnergyConsumerGroupElement(priority: number, onDrop: (buildingIds: string[], newGroupBetween: { min: number, max: number }, newPriority: number) => void) {
        let containerId = `auto-energy-group-priority-${priority}`;
        let containerElement = document.querySelector<Element>(`#${containerId}`);

        if (!containerElement) {
            let parent = this.getOrCreateContainerElement();
            let elementString = `<div id="${containerId}" class="auto-energy-group" draggable="true"><div class="label">${priority !== undefined ? priority : 'New'}</div><div class="content"></div></div>`;

            // Container with undefined priority should be the last child
            if (priority === undefined) {
                containerElement = Interface.createChildElementFromString(elementString, parent);
            } else {
                // Count how many child elements have higher priority than this one
                let lowerPriorityCount = 0;
                let siblings = parent.children;
                for (let i = 0; i < siblings.length; i++) {
                    const sibling = siblings[i];

                    let siblingPriorityString = sibling.id.replace("auto-energy-group-priority-", "");

                    if (sibling.classList.contains('auto-energy-separator') || siblingPriorityString !== undefined && parseInt(siblingPriorityString) < priority) {
                        lowerPriorityCount++;
                    } else {
                        break; // We've hit lower priority elements
                    }
                }

                containerElement = Interface.createChildElementFromString(elementString, parent, lowerPriorityCount);
            }

            this.initDraggableElement(containerElement);
            this.initDropZoneElement(containerElement, onDrop);
        }

        return containerElement.querySelector('.content');
    }

    /**
     * Finalizes the container element by adding/removing empty divs between categories to allow moving elements between them, creating new categories as needed
     */
    private static finalizeContainerElement(onDrop: (buildingIds: string[], newGroupBetween: { min: number, max: number }, newPriority: number) => void) {
        let containerElement = this.getOrCreateContainerElement();

        let separatorClass = "auto-energy-separator";
        let separatorString = `<div class="${separatorClass}"></div>`;

        let children = containerElement.children;

        // The first and last cildren must be separators
        if (!children[0].classList.contains(separatorClass)) {
            let element = Interface.createChildElementFromString(separatorString, containerElement, 0);
            this.initDropZoneElement(element, onDrop);
        }

        if (!children[children.length - 1].classList.contains(separatorClass)) {
            let element = Interface.createChildElementFromString(separatorString, containerElement);
            this.initDropZoneElement(element, onDrop);
        }

        let prevWasSeparator = false; // Keep track of whether the previous element was a separator or not
        for (let i = 0; i < children.length; i++) {
            const child = children[i];

            // Empty containers must be destroyed
            if (!child.classList.contains(separatorClass) && child.querySelector('.content').children.length === 0) {
                child.remove(); // Remove the empty container
                i--;
                continue;
            }

            // There can not be two separators in a row
            if (child.classList.contains(separatorClass) && prevWasSeparator) {
                child.remove(); // Remove the separator
                i--;
                continue;
            }

            // There can not be two non-separator elements in a row
            if (!child.classList.contains(separatorClass) && !prevWasSeparator) {
                let element = Interface.createChildElementFromString(separatorString, containerElement, i);
                this.initDropZoneElement(element, onDrop);

                i++;
                continue;
            }

            // Cache whether the previous element was a separator or not
            prevWasSeparator = child.classList.contains(separatorClass);
        }
    }

    private static initDraggableElement(element: Element): Element {
        element.addEventListener("dragstart", (event: DragEvent) => {
            event.dataTransfer.setData("text/plain", element.id); // Transfer dragged element id
            // Stop propagation
            event.stopPropagation();
        });

        return element;
    }

    private static initDropZoneElement(element: Element, onDrop: (buildingIds: string[], newGroupBetween: { min: number, max: number }, newPriority: number) => void): Element {
        let counter = 0;

        // Add/remove .active class for drop-zone highlighting
        element.addEventListener("dragenter", (event) => {
            if (!element.classList.contains('active')) {
                element.classList.add('active');
            }

            counter++; // Gotta count children...
        });

        element.addEventListener("dragleave", (event) => {
            counter--; // Gotta remove children...

            if (counter <= 0 && element.classList.contains('active')) {
                element.classList.remove('active');
            }
        });

        // On drop, fire event that priorities have changed
        element.addEventListener("drop", (event: DragEvent) => {
            counter = 0; // Get rid of all children

            if (element.classList.contains('active')) {
                element.classList.remove('active');
            }

            let draggedElementId = event.dataTransfer.getData("text/plain");
            let draggedElement = document.querySelector<Element>(`#${draggedElementId}`);

            this.onDrop(draggedElement, element, onDrop);
        });

        // Without this magic, the 'drop' event won't fire?? Because... reasons?? wtf
        element.addEventListener('dragover', (event) => {
            event.preventDefault();
        });

        return element;
    }

    private static onDrop(draggedElement: Element, dropzoneElement: Element, onDrop: (buildingIds: string[], newGroupBetween: { min: number, max: number | undefined }, newPriority: number) => void) {
        let buildingIds: string[];

        // Differentiate between dragging a building and a full category
        if (draggedElement.classList.contains('auto-energy-group')) {
            buildingIds = Array.from(draggedElement.querySelector('.content').children).map((child) => child.id.substring(12)); // Remove 'auto-energy-' prefix
        } else {
            buildingIds = [draggedElement.id.substring(12)]; // Remove 'auto-energy-' prefix
        }

        // Differentiate between targeting an existing group or creating a new one
        let targetPriority: number = undefined;
        let newGroupBetween: { min: number, max: number } = undefined;
        if (dropzoneElement.classList.contains('auto-energy-group')) {
            // Add building/group to existing group
            let targetPriorityString = dropzoneElement.id.replace("auto-energy-group-priority-", ""); // Remove 'auto-energy-group-priority-' prefix
            targetPriority = targetPriorityString === 'undefined' ? undefined : parseInt(targetPriorityString);
        } else if (dropzoneElement.classList.contains('auto-energy-separator')) {
            // Create new group between existing groups
            let prevPriorityString = dropzoneElement.previousElementSibling?.id?.replace("auto-energy-group-priority-", ""); // Remove 'auto-energy-group-priority-' prefix
            let nextPriorityString = dropzoneElement.nextElementSibling?.id?.replace("auto-energy-group-priority-", ""); // Remove 'auto-energy-group-priority-' prefix
            newGroupBetween = { min: prevPriorityString === 'undefined' ? undefined : parseInt(prevPriorityString), max: nextPriorityString === 'undefined' ? undefined : parseInt(nextPriorityString) };
        }

        // Fire event that priorities have changed
        onDrop(buildingIds, newGroupBetween, targetPriority);
    }
}