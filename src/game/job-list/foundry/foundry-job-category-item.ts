import { JobCategoryItem } from "../job-category-item";
import { JobItem } from "../job-item";

export class FoundryJobCategoryItem extends JobCategoryItem {
    private static readonly ID = 'foundry';

    constructor() {
        super(FoundryJobCategoryItem.ID);
    }
    
    public get jobs(): JobItem[] {
        let jobElements = this.element.querySelectorAll<HTMLElement>('.job > [id]'); // Select elements where id exists

        let jobItems = [];

        for (let i = 0; i < jobElements.length; i++) {
            const element = jobElements[i];

            jobItems.push(JobItem.fromElement(element));
        }

        return jobItems;
    }

    public get count(): number {
        // Count is in child element with class "foundry", then in element with class "count"
        let countString = this.element.querySelector<HTMLElement>('.job > :not([id]) .count').textContent;
        
        // If has max, return only count (e.g. from string 3 / 15 return only 3)
        if (countString.indexOf('/') > 0) {
            countString = countString.substring(0, countString.indexOf('/'));
        }
    
        return parseInt(countString);
    }

    public get countMax(): number {
        let countString = this.element.querySelector<HTMLElement>('.job > :not([id]) .count').textContent;
        
        // If has max, return only max (e.g. from string 3 / 15 return only 15), otherwise return undefined
        if (countString.indexOf('/') < 0) {
            return undefined;
        }
        
        countString = countString.substring(countString.indexOf('/') + 1);
        return parseInt(countString);
    }
}