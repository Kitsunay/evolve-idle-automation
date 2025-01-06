import { Interface } from "../interface";

export abstract class Component<CONFIG_OBJECT> {
    public readonly parentElement: Element;
    public readonly componentId: string;

    /**
     * Id prefix to help identify the component
     */
    protected abstract getComponentIdPrefix(): string;
    /**
     * String to be used to create the root element, usually a wrapper div
     */
    protected abstract readonly rootElementString: string;
    protected rootElement: Element;
    protected isNew: boolean = false;

    protected abstract defaultConfig: CONFIG_OBJECT;
    private config: CONFIG_OBJECT;

    constructor(componentId: string, parentElement: Element) {
        this.componentId = this.getComponentIdPrefix() + componentId;
        this.parentElement = parentElement;

        this.rootElement = parentElement.querySelector<HTMLElement>(`#${this.componentId}`);
    }

    public get exists(): boolean {
        return !!this.rootElement;
    }

    public create(config: CONFIG_OBJECT): void {
        if (this.exists) {
            return;
        }

        this.isNew = true;

        this.rootElement = Interface.getOrCreate({ elementId: this.componentId, parentElement: this.parentElement, elementString: this.rootElementString });
        this.rootElement.id = this.componentId;

        this.config = config ?? this.defaultConfig;

        this.render();
    }

    public createOrUpdate(config: CONFIG_OBJECT): void {
        if (this.exists) {
            this.update(config);
        } else {
            this.create(config);
        }
    }

    public update(config: CONFIG_OBJECT): void {
        this.isNew = false;

        this.config = config ?? this.defaultConfig;
        this.render();
    }

    public render(): void {
        this.renderComponent(this.config, this.rootElement, this.isNew);
    }

    protected abstract renderComponent(config: CONFIG_OBJECT, rootElement: Element, isNew: boolean): void;

    public destroy(): void {
        this.rootElement.remove();
    }
}