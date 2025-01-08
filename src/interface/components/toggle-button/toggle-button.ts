import { Interface } from "../../interface";
import { Component } from "../component";
import { ToggleButtonConfig } from "./toggle-button-config";

/**
 * Class for convenient creation of toggle buttons
 */
export class ToggleButton extends Component<ToggleButtonConfig> {
    protected rootElementString: string = '<toggle-button class="toggle-button"></div>';
    protected defaultConfig: ToggleButtonConfig = {};

    protected getComponentIdPrefix(): string {
        return 'toggle_button_';
    }

    protected renderComponent(config: ToggleButtonConfig, rootElement: Element, isNew: boolean): void {
        // Inner HTML
        if (!rootElement.innerHTML) {
            let innerHTML = `<span class="toggle-button-text"></span>`;
            rootElement.innerHTML = innerHTML;
        }

        // Toggled state
        if (config?.isToggled !== undefined) {
            this._toggled = config.isToggled;
        }

        // Root class
        rootElement.className = `toggle-button${config?.styleClass ? " " + config?.styleClass : ""}`;

        // Icon
        let iconElement = rootElement.querySelector<HTMLElement>('.icon');

        if (iconElement && config?.iconStyleClass) {
            iconElement.className = config?.iconStyleClass ? `icon ${this.isToggled ? config?.iconStyleClass.on : config?.iconStyleClass.off}` : '';
        } else if (iconElement && !config?.iconStyleClass) {
            iconElement.remove();
        } else if (!iconElement && config?.iconStyleClass) {
            Interface.createChildElementFromString(`<span class="icon ${this.isToggled ? config?.iconStyleClass.on : config?.iconStyleClass.off}"></span>`, rootElement, 0);
        }

        // Content
        if (config.textContent) {
            this.rootElement.querySelector('.toggle-button-text').textContent = this.isToggled ? config.textContent.on : config.textContent.off;
        }

        // Toggled class
        if (this.rootElement.classList.contains('toggled') !== this.isToggled) {
            this.rootElement.classList.toggle('toggled');
        }

        // Listeners
        if (isNew) {
            this.rootElement.addEventListener('click', () => {
                this.toggle;
                config.onToggle(this.isToggled);
            });
        };
    }

    private _toggled: boolean = false;

    public get isToggled(): boolean { return this._toggled; }
    public set isToggled(value: boolean) {
        if (this._toggled !== value) {
            this.toggle();
        }
    }

    /**
     * Change button state and render
     */
    private toggle(): void {
        this._toggled = !this._toggled;
        this.render();
    }
}