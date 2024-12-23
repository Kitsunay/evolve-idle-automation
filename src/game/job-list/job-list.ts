import { FoundryJobCategoryItem } from "./foundry/foundry-job-category-item";
import { JobCategoryItem } from "./job-category-item";
import { JobItem } from "./job-item";
import { UncategorizedJobCategoryItem } from "./uncategorized/uncategorized-job-category-item";

export class JobList {
    public static get Categories(): JobCategoryItem[] {
        return [new UncategorizedJobCategoryItem(), new FoundryJobCategoryItem()];
    }

    public static getJobs(): JobItem[] {
        return this.Categories.flatMap((category) => category.jobs);
    }

    public static getJob(jobId: string): JobItem {
        return JobItem.fromId(jobId);
    }

    public static addWorker(jobElement: JobItem): void {
        jobElement.addElement.dispatchEvent(new Event('click'));
    }

    public static removeWorker(jobElement: JobItem): void {
        jobElement.subElement.dispatchEvent(new Event('click'));
    }
}