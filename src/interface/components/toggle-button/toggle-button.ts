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

    public buttonElement: Element;
    public set onToggle(onToggle: () => void) {
        if (this.buttonElementIsNew) { // Add listeners only if the button is new, avoid duplicate listeners on existing buttons
            this.buttonElement.addEventListener('click', onToggle);
        }
    }

    private textContent: { on: string, off: string } = { on: "ON", off: "OFF" };
    private toggled: boolean = false;
    private buttonElementIsNew: boolean = false;

    /**
     * Checks if toggle button exists and creates it if it doesn't. Requires a button ID and a parent element.
     * @param buttonId unique id of the button to check for existence (TODO: would be nice if it wasn't required)
     * @param parentElement where to create the button if it doesn't exist
     * @param textContent button text content for toggled and untoggled states
     * @returns 
     */
    public static createIfNotExists(buttonId: string, parentElement: Element, config?: { styleClass?: string, textContent?: { on: string, off: string }, position?: number}): ToggleButton {
        return new ToggleButton(buttonId, parentElement, config);
    }

    private constructor(buttonId: string, parentElement: Element, config?: { styleClass?: string, textContent?: { on: string, off: string }, position?: number}) {
        // Create button if it doesn't exist yet
        this.buttonElement = parentElement.querySelector<Element>(`#${buttonId}`);

        if (!this.buttonElement) {
            this.buttonElement = Interface.createChildElementFromString(`<div id="${buttonId}" class="toggle-button${config?.styleClass ? " " + config?.styleClass : ""}"><span class="toggle-button-text"></span></div>`, parentElement, config?.position);
            this.buttonElementIsNew = true;
        }

        this.textContent = config?.textContent ?? this.textContent;

        this.render();
    }

    /**
     * Update element properties based on button state
     */
    private render(): void {
        this.buttonElement.querySelector('.toggle-button-text').textContent = this.isToggled ? this.textContent.on : this.textContent.off;

        if (this.buttonElement.classList.contains('on') !== this.isToggled) {
            this.buttonElement.classList.toggle('on');
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