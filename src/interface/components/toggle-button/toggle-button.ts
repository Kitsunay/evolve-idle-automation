import { Interface } from "../../interface";

/**
 * Class for convenient creation of toggle buttons
 */
export class ToggleButton {
    public get isToggled(): boolean { return this.toggled; }
    public set isToggled(value: boolean) {
        if (this.toggled !== value) {
            this.toggle();
        }
    }

    public readonly buttonElement: Element;
    public readonly iconElement: Element;

    public set onToggle(onToggle: () => void) {
        if (this.buttonElementIsNew) { // Add listeners only if the button is new, avoid duplicate listeners on existing buttons
            this.buttonElement.addEventListener('click', onToggle);
        }
    }

    private textContent: { on: string, off: string } = undefined;
    private iconStyleClass: { on: string, off: string } = undefined;
    private toggled: boolean = false;
    private buttonElementIsNew: boolean = false;

    /**
     * Checks if toggle button exists and creates it if it doesn't. Requires a button ID and a parent element.
     * @param buttonId unique id of the button to check for existence (TODO: would be nice if it wasn't required)
     * @param parentElement where to create the button if it doesn't exist
     * @param textContent button text content for toggled and untoggled states
     * @returns 
     */
    public static getOrCreate(buttonId: string, parentElement: Element, config?: { styleClass?: string, iconStyleClass?: { on: string, off: string }, textContent?: { on: string, off: string }, position?: number }): ToggleButton {
        return new ToggleButton(buttonId, parentElement, config);
    }

    public static get(buttonId: string): ToggleButton | null {
        let toggleButton = new ToggleButton(buttonId);

        return toggleButton.buttonElement ? toggleButton : null;
    }

    protected constructor(buttonId: string, parentElement?: Element, config?: { styleClass?: string, iconStyleClass?: { on: string, off: string }, toggledStyleClass?: string, textContent?: { on: string, off: string }, position?: number }) {
        // Try to get existing button
        this.buttonElement = parentElement ? parentElement.querySelector<Element>(`#${buttonId}`) : document.querySelector<Element>(`#${buttonId}`);
        this.iconElement = this.buttonElement?.querySelector<HTMLElement>('.icon');

        // Create button if it doesn't exist yet and config was provided
        if (parentElement) {
            if (!this.buttonElement) {
                this.buttonElement = Interface.createChildElementFromString(`<div id="${buttonId}" class="toggle-button${config?.styleClass ? " " + config?.styleClass : ""}">${config?.iconStyleClass ? `<span class="icon"></span>` : ""}${config?.textContent ? `<span class="toggle-button-text"></span>` : ""}</div>`, parentElement, config?.position);
                this.iconElement = this.buttonElement.querySelector<HTMLElement>('.icon');

                this.buttonElementIsNew = true;
            }

            this.textContent = config?.textContent ?? this.textContent;
            this.iconStyleClass = config?.iconStyleClass ?? this.iconStyleClass;


            this.render();
        }
    }

    public destroy() {
        this.buttonElement?.remove();
    }

    /**
     * Update element properties based on button state
     */
    private render(): void {
        if (this.textContent) {
            this.buttonElement.querySelector('.toggle-button-text').textContent = this.isToggled ? this.textContent.on : this.textContent.off;
        }

        if (this.buttonElement.classList.contains('on') !== this.isToggled) {
            this.buttonElement.classList.toggle('on');
        }

        if (this.iconStyleClass) {
            if (this.isToggled) {
                // Get rid of old classes
                this.iconElement.classList.remove(...this.iconStyleClass.off.split(' '));

                // Add new classes
                this.iconElement.classList.add(...this.iconStyleClass.on.split(' '));
            } else {
                // Do the same
                this.iconElement.classList.remove(...this.iconStyleClass.on.split(' '));
                this.iconElement.classList.add(...this.iconStyleClass.off.split(' '));
            }
        }
    }

    /**
     * Change button state and render
     */
    private toggle(): void {
        this.toggled = !this.toggled;
        this.render();
    }
}