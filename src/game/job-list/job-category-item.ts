import { JobItem } from "./job-item";

export abstract class JobCategoryItem extends JobItem {
    abstract get jobs(): JobItem[];

    constructor(id: string) {
        super(id);
    }

    public get itemId(): string {
        return this.id;
    }

    public get isDefault(): boolean {
        return false;
    }

    public get isVisible(): boolean {
        return this.element && this.element.style.display !== 'none' && this.element.childElementCount > 0;
    }

    public get subElement(): HTMLElement {
        return undefined;
    }

    public get addElement(): HTMLElement {
        return undefined;
    }
}