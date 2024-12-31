import { AutoWorkerInterface } from "./auto-worker-interface";
import { Automation } from "../automation";
import { AutoWorkerState } from "./auto-worker-state";
import { Game } from "../../game/game";
import { JobCategoryItem } from "../../game/job-list/job-category-item";
import { AutoWorkerJobCategory } from "./auto-worker-job-category";
import { AutoWorkerJobRatio } from "./auto-worker-job-ratio";
import { JobItem } from "../../game/job-list/job-item";

export class AutoWorker extends Automation<AutoWorkerState> {
    protected LOCAL_STORAGE_KEY: string = "auto-worker";

    // List of jobs that require special handling
    private foodJobs = ['civ-farmer', 'civ-hunter'];

    protected state: AutoWorkerState = {
        unlocked: false,
        enabled: false,
        jobCategories: []
    }

    tick(): void {
        if (!this.state.enabled) {
            return;
        }

        let foodProducerTarget = this.getFoodProducerTarget();
        
        let availableWorkers = Game.Resources.getCount(Game.Resources.populationResourceId);
        availableWorkers -= foodProducerTarget.value;
        
        let otherJobTargets = this.getJobTargets(availableWorkers);
        
        let targetWorkers: { jobId: string, value: number }[] = [foodProducerTarget, ...otherJobTargets];
        
        this.assignJobs(targetWorkers);
    }

    private getFoodProducerTarget(): { jobId: string, value: number } {
        let config = this.state.jobCategories.flatMap(x => x.jobs).filter(x => x.jobId === 'civ-farmer' || x.jobId === 'civ-hunter');

        // Find out which food producer is currently active
        let jobElement: JobItem;
        let jobConfig: AutoWorkerJobRatio;
        for (const configItem of config) {
            let configItemJob = Game.JobList.getJob(configItem.jobId);
            if (configItemJob.isActive) {
                jobElement = configItemJob;
                jobConfig = configItem;
                break;
            }
        }

        if (jobConfig === undefined) {
            console.log('No active food producer found');
            return undefined;
        }

        switch (jobConfig.jobId) {
            case 'civ-farmer': // Farmer
                return this.getFarmerTarget(jobElement, jobConfig);
            case 'civ-hunter': // Hunter
                return this.getHunterTarget(jobElement, jobConfig);
            default:
                throw new Error(`Unknown food producer [${jobConfig.jobId}]`);
        }
    }

    private getFarmerTarget(jobElement: JobItem, config: AutoWorkerJobRatio): { jobId: string, value: number } {
        let targetFoodRate = config.value; // In case of auto-farmer, config.value is the target food rate

        let foodRate = Game.Resources.getProduction('resFood');

        // Calculate food per farmer (ignore farm effect for now)

        let totalFoodRate = Game.Resources.getTotalProduction('resFood');
        let currentFarmers = jobElement.count;

        if (foodRate < targetFoodRate && currentFarmers === 0) { // Avoid dividing by zero
            return { jobId: config.jobId, value: 1 };
        }

        let foodPerFarmer = totalFoodRate / currentFarmers;

        // Calculate how many farmers are required to reach target food rate
        let consumption = totalFoodRate - foodRate;
        let farmersNeeded = Math.ceil((consumption + targetFoodRate) / foodPerFarmer);

        return { jobId: config.jobId, value: farmersNeeded };
    }

    private getHunterTarget(jobElement: JobItem, config: AutoWorkerJobRatio): { jobId: string, value: number } {
        let targetSpoilage = config.value; // In case of auto-hunter, config.value is the target spoilage

        // The spoilage will always try to balance out production and consumption,
        // so having production be above consumption by target spoilage amount is all we need to do here

        let foodTotalProduction = Game.Resources.getTotalProduction('resFood');
        let consumptionBreakdown = Game.Resources.getConsumptionBreakdown('resFood');

        let consumption = 0; // This will be negative number
        if (consumptionBreakdown.length > 1) { // If spoilage exists, skip it because first item under breakdown is spoilage, without it we get actual consumption
            for (let i = 1; i < consumptionBreakdown.length; i++) {
                consumption += consumptionBreakdown[i].amount;
            }
        } else { // No spoilage detected
            consumption = consumptionBreakdown[0].amount;
        }

        // Calculate how many hunters are required to reach target spoilage
        let foodPerHunter = foodTotalProduction / jobElement.count;
        let targetFoodProduction = -consumption + targetSpoilage; // Consumption is negative number
        let huntersNeeded = Math.ceil(targetFoodProduction / foodPerHunter);

        return { jobId: config.jobId, value: huntersNeeded };
    }

    private getJobTargets(numWorkers: number): { jobId: string, value: number }[] {
        // Divide citizens by ratios
        let jobCategories = Game.JobList.Categories;

        // Build a massive object connecting categories and their configs, and jobs that are visible in each category
        let categories: { gameCategory: JobCategoryItem, categoryConfig: AutoWorkerJobCategory, enabledJobs: AutoWorkerJobRatio[] }[] = [];
        for (let i = 0; i < jobCategories.length; i++) {
            for (let j = 0; j < this.state.jobCategories.length; j++) {
                if (jobCategories[i].id === this.state.jobCategories[j].id) { // Found matching config for this category
                    let jobs = jobCategories[i].jobs;
                    let jobConfigs = []; // Collect config for available jobs in this category

                    for (let k = 0; k < jobs.length; k++) {
                        for (let l = 0; l < this.state.jobCategories[j].jobs.length; l++) {
                            if (jobs[k].id === this.state.jobCategories[j].jobs[l].jobId && !this.foodJobs.includes(jobs[k].id)) { // Found matching config for this job
                                // TODO: This might get stored in the config to reduce the megaobject complexity
                                jobConfigs.push(this.state.jobCategories[j].jobs[l]);
                            }
                        }
                    }

                    categories.push({ gameCategory: jobCategories[i], categoryConfig: this.state.jobCategories[j], enabledJobs: jobConfigs }); // Add this monstrosity to the list
                }
            }
        }

        // Divide by category to account for category caps
        let categoryRatios: number[] = [];
        let categoryCaps: number[] = [];

        for (let i = 0; i < categories.length; i++) { // Go through all categories
            let category = categories[i];

            let categoryRatio = this.getRatios(category.enabledJobs).reduce((a, b) => a + b, 0); // Sums up all ratios in available jobs in this category
            let categoryCap = category.gameCategory.countMax;

            categoryRatios.push(categoryRatio);
            categoryCaps.push(categoryCap);
        }

        let categoryWorkers = this.calculateRatiosWithCaps(numWorkers, categoryRatios, categoryCaps); // Calculate worker distribution based on ratios and caps

        // Now do the same per each category and collect the result
        let result: { jobId: string, value: number }[] = [];

        for (let i = 0; i < categories.length; i++) {
            let category = categories[i];

            let availableWorkers = categoryWorkers[i]; // Number of workers available for auto-ratio

            let jobRatios = category.enabledJobs.map(x => x.value);
            let jobCaps = category.gameCategory.jobs.filter(x => !this.foodJobs.includes(x.id)).map(x => x.countMax);

            let jobWorkers = this.calculateRatiosWithCaps(availableWorkers, jobRatios, jobCaps);

            for (let j = 0; j < jobWorkers.length; j++) {
                result.push({ jobId: category.enabledJobs[j].jobId, value: jobWorkers[j] });
            }
        }

        return result;
    }

    assignJobs(targetWorkers: { jobId: string; value: number; }[]) {
        // Validity check - targets can not be undefined, null or NaN
        for (const workerTarget of targetWorkers) {
            let targetValue = workerTarget.value;
            if (targetValue === undefined || targetValue === null || isNaN(targetValue)) {
                throw new Error(`Invalid target value [${targetValue}] for auto-worker [${workerTarget.jobId}]`);
            }
        }

        let population = Game.Resources.getCount(Game.Resources.populationResourceId); // Available workers
        let assignedWorkers = 0; // Total workers assigned to jobs

        for (let i = 0; i < targetWorkers.length; i++) { // Go through all jobs
            let jobId = targetWorkers[i].jobId;

            let jobElement = Game.JobList.getJob(jobId);

            assignedWorkers += jobElement.count;
        }

        let freeWorkers = population - assignedWorkers; // Number of free workers available to work. Insufficient number of workers means removing workers has a high priority

        // Account for extra workers on default job
        for (let i = 0; i < targetWorkers.length; i++) {
            let jobId = targetWorkers[i].jobId;

            let jobElement = Game.JobList.getJob(jobId);

            if (jobElement.isDefault) {
                freeWorkers += jobElement.count - targetWorkers[i].value; // Make the automator think that there are free workers available (this is ok since the game believes the default workers to be a free worker pool as well)
                break;
            }
        }

        // Try to find the first difference and move towards it. Add if worker is available, remove anytime
        for (let i = 0; i < targetWorkers.length; i++) {
            let jobId = targetWorkers[i].jobId;
            let jobElement = Game.JobList.getJob(jobId);

            if (jobElement.isDefault) { // Skip the default job, it serves as worker pool and it increases/decreases when other jobs change
                continue;
            }

            let targetJobWorkers = targetWorkers[i].value;
            let currentJobWorkers = jobElement.count;

            if (currentJobWorkers > targetJobWorkers) { // Removing has priority because of farmers
                Game.JobList.removeWorker(jobElement);
                return; // Only one worker change per tick for sub-optimal results
            } else if (currentJobWorkers < targetJobWorkers && freeWorkers > 0) {
                Game.JobList.addWorker(jobElement);
                return; // Only one worker change per tick for sub-optimal results
            }
        }
    }

    updateUI(): void {
        // Auto-Discovery: Before full UI update, check if there are any new jobs to automate
        // TODO: Trigger auto-discovery only after research/building purchase?
        this.runJobAutoDiscovery();

        // Render the button that enables/disables auto-worker automation, with a label
        AutoWorkerInterface.refreshEnableButton(this.state.enabled, () => {
            this.state.enabled = !this.state.enabled;
            this.saveState();
            this.updateUI();
        });

        // Render number input for job ratios
        AutoWorkerInterface.refreshJobRatios(this.state.jobCategories.flatMap(x => x.jobs), () => { this.saveState(); });
    }

    private runJobAutoDiscovery() {
        // TODO: Improve performance with Map<>???
        let categories = Game.JobList.Categories;
        for (const category of categories) {
            // Auto-Discovery of categories
            let categoryConfig = this.state.jobCategories.find(x => x.id === category.id);

            if (!categoryConfig) {
                categoryConfig = { id: category.id, jobs: [] };
                this.state.jobCategories.push(categoryConfig);
            }

            let jobs = category.jobs;

            for (const job of jobs) {
                // Auto-Discovery of jobs
                let jobConfig = categoryConfig.jobs.find(x => x.jobId === job.id);

                if (!jobConfig) {
                    jobConfig = { jobId: job.id, value: 0 };
                    categoryConfig.jobs.push(jobConfig);
                }
            }
        }
    }

    private calculateRatiosWithCaps(value: number, ratios: number[], valueCaps: number[]): number[] {
        // Calculate result the standard way
        let intResult = this.calculateRatios(ratios, value);

        // Find indexes of values that overflow the cap
        let cappedIndexes: number[] = []; // Indexes of values that overflow the cap

        for (let i = 0; i < intResult.length; i++) {
            if (valueCaps[i] !== undefined && intResult[i] > valueCaps[i]) {
                cappedIndexes.push(i);
                intResult[i] = valueCaps[i];
            }
        }

        if (cappedIndexes.length === 0) { // No overflow, return the result
            //console.log(`expected ${value} total ${intResult.reduce((a, b) => a + b, 0)}`);
            return intResult;
        }

        // Cap overflow happened, rerun the calculation without the overflowed values in the arrays
        // Drop the dustributed value by capped values
        let newValue = value - cappedIndexes.map(x => intResult[x]).reduce((a, b) => a + b, 0);

        // Generate new arrays for ratios and caps without overflowed values in the arrays
        let newRatios = ratios.filter((x, i) => !cappedIndexes.includes(i));
        let newCaps = valueCaps.filter((x, i) => !cappedIndexes.includes(i));

        let subResult = this.calculateRatiosWithCaps(newValue, newRatios, newCaps);

        // Merge sub-result with the overflowed values
        for (let i = 0; i < cappedIndexes.length; i++) {
            subResult.splice(cappedIndexes[i], 0, intResult[cappedIndexes[i]]);
        }

        return subResult;
    }

    private calculateRatios(ratios: number[], value: number) {
        // Normalize the ratios first
        ratios = this.normalizeRatios(ratios);

        // Calculate result the standard way
        let floatResult = ratios.map((x) => x * value);

        // Find the closest whole number and calculate the remainder
        let intResult = floatResult.map((x) => Math.floor(x));
        let remainder = 0;
        for (let i = 0; i < intResult.length; i++) {
            remainder += floatResult[i] - intResult[i];
        }

        // Apply the remainder to the lowest difference
        let maxSortedIndexes: number[] = [];
        let maxSortedDiffs: number[] = [];
        for (let i = 0; i < intResult.length; i++) {
            let diff = floatResult[i] - intResult[i];

            // Insert value and keep the arrays sorted
            if (maxSortedDiffs.length === 0 || diff >= maxSortedDiffs[0]) {
                maxSortedIndexes.unshift(i);
                maxSortedDiffs.unshift(diff);
                continue;
            } else if (diff <= maxSortedDiffs[maxSortedDiffs.length - 1]) {
                maxSortedIndexes.push(i);
                maxSortedDiffs.push(diff);
                continue;
            }

            let left = 0;
            let right = maxSortedIndexes.length - 1;
            while (true) {
                let middle = Math.floor((left + right) / 2);

                if (middle === right || middle === left) {
                    if (diff > maxSortedDiffs[middle]) {
                        maxSortedIndexes.splice(middle, 0, i);
                        maxSortedDiffs.splice(middle, 0, diff);
                    } else {
                        maxSortedIndexes.splice(middle + 1, 0, i);
                        maxSortedDiffs.splice(middle + 1, 0, diff);
                    }

                    break;
                }

                if (diff > maxSortedDiffs[middle]) {
                    right = middle;
                } else if (diff < maxSortedDiffs[middle]) {
                    left = middle;
                } else {
                    maxSortedIndexes.splice(middle, 0, i);
                    maxSortedDiffs.splice(middle, 0, diff);
                    break;
                }
            }
        }

        // Apply the remainder by increments to int result, starting from the highest difference
        for (let i = 0; i < maxSortedIndexes.length; i++) {
            let index = maxSortedIndexes[i];

            remainder = Math.round(remainder); // Avoids float precision issues
            if (remainder <= 0) {
                break;
            }

            intResult[index] += 1;
            remainder -= 1;
        }

        return intResult;
    }

    private normalizeRatios(ratios: number[]) {
        let totalRatios = ratios.reduce((a, b) => a + b, 0);
        return ratios.map(x => {
            if (totalRatios === 0) {
                return 0;
            }

            return x / totalRatios;
        });
    }

    private getRatios(jobItems: AutoWorkerJobRatio[]): number[] {
        return jobItems.map(x => x.value || 0);
    }
}