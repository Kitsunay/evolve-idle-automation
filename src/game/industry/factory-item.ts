import { IndustryItem } from "./industry-item";

export class FactoryItem extends IndustryItem {
    public get resourceId(): string {
        return this.textContentElement.parentElement.firstElementChild.classList.item(0).toLowerCase();
    }
}