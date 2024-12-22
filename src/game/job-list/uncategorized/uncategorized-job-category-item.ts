import { JobCategoryItem } from "../job-category-item";
import { JobItem } from "../job-item";

export class UncategorizedJobCategoryItem extends JobCategoryItem {
    private static readonly ID = 'jobs';

    constructor() {
        super(UncategorizedJobCategoryItem.ID);
    }

    get jobs(): JobItem[] {
        let jobElements = this.element.querySelectorAll<HTMLElement>('.job:not([style^="display: none"])');

        let jobItems = [];

        for (let i = 0; i < jobElements.length; i++) {
            const element = jobElements[i];

            jobItems.push(JobItem.fromElement(element));
        }

        return jobItems;
    }

    public get count(): number {
        return undefined;
    }

    public get countMax(): number {
        return undefined;
    }
}