import { Interface } from "../interface";

export abstract class Component<CONFIG_OBJECT> {
    public readonly parentElement: Element;
    public readonly componentId: string;

    protected abstract getComponentIdPrefix(): string;
    protected abstract readonly rootElementString: string;
    protected rootElement: Element;

    protected abstract defaultConfig: CONFIG_OBJECT;
    private config: CONFIG_OBJECT;

    constructor(componentId: string, parentElement: Element) {
        this.componentId = this.getComponentIdPrefix() + componentId;
        this.parentElement = parentElement;

        this.rootElement = parentElement.querySelector<HTMLElement>(`#${componentId}`);
    }

    public get exists(): boolean {
        return !!this.rootElement;
    }

    public create(config: CONFIG_OBJECT): void {
        if (this.exists) {
            this.destroy();
        }

        this.rootElement = Interface.getOrCreate({ elementId: this.componentId, parentElement: this.parentElement, elementString: this.rootElementString });
        this.rootElement.id = this.componentId;

        this.update(config);
    }

    public update(config: CONFIG_OBJECT): void {
        this.config = config ?? this.defaultConfig;
        this.render();
    }

    public render(): void {
        this.renderComponent(this.config, this.rootElement);
    }

    protected abstract getInnerString(config: CONFIG_OBJECT): string;
    protected abstract renderComponent(config: CONFIG_OBJECT, rootElement: Element): void;

    public destroy(): void {
        this.rootElement.remove();
    }
}