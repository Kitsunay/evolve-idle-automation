import { Game } from "../../game/game";
import { GameMathRatios } from "../../game/game-math-ratios";
import { IndustryItem } from "../../game/industry/industry-item";
import { Automation } from "../automation";
import { AutoIndustryInterface } from "./auto-industry-interface";
import { AutoIndustryState } from "./auto-industry-state";

export class AutoIndustry extends Automation<AutoIndustryState> {
    protected LOCAL_STORAGE_KEY: string = "auto-industry";
    protected state: AutoIndustryState = { unlocked: false, enabled: false, smelterConfig: undefined, factoryConfig: undefined };

    tick(): void {
        this.runAutoIndustry();
    }

    private runAutoIndustry() {
        if (this.state.smelterConfig === undefined) {
            return;
        }

        if (!Game.Industry.Smelter.exists || Game.Industry.Smelter.count === 0) {
            return;
        }

        this.tryAdjustSmelterFuel(this.state.smelterConfig.preferredFuel);

        this.tryAdjustSmelterOutput(this.state.smelterConfig.productRatios);

        this.tryAdjustFactoryOptions(this.state.factoryConfig.productRatios);
    }

    private tryAdjustSmelterFuel(targetResourceId: string) {
        if (targetResourceId === undefined) {
            return;
        }

        // If target fuel is in negatives, try to revert to default fuel
        if (Game.Resources.getProduction(targetResourceId) < 0) {
            let fuelItem = Game.Industry.Smelter.fuelItems[0];
            Game.Industry.Smelter.addIndustryItem(fuelItem);
        }

        // If target fuel is in positive and can tank additional consumption by smelter, try to add it
        let targetFuelItem = Game.Industry.Smelter.fuelItems.find(x => x.resourceId === targetResourceId);

        if (!targetFuelItem) {
            return;
        }

        let consumptionPerSmelter = targetFuelItem.consumptionPerSmelter;

        if (Game.Resources.getProduction(targetResourceId) > consumptionPerSmelter) {
            Game.Industry.Smelter.addIndustryItem(targetFuelItem);
        }
    }

    /**
     * Add to output product if it would result in moving closer to target ratio.
     * @param ratios 
     */
    private tryAdjustSmelterOutput(ratios: { product: string, ratio: number }[]) {
        if (Game.Resources.getProduction('resIron') < 2) { // Do not start producing steel if there isn't enough iron
            return false;
        }

        let smelterItems = Game.Industry.Smelter.outputItems;

        if (!smelterItems || smelterItems.length === 0) { // Do not try to adjust the output if there is no output to adjust
            return false;
        }

        let extendedRatios = ratios.map(x => { // extend ratios with matching industry items
            return {
                product: x.product,
                ratio: x.ratio,
                industryItem: smelterItems.find(y => y.resourceId === x.product)
            };
        });

        if (this.tryRemoveZeroRatioOutputs(extendedRatios)) {
            return true;
        }


        if (this.tryAssertMinOutputCount(extendedRatios)) {
            return true;
        }

        // Ratios do not contain zero ratios and all outputs have a count of at least 1. Now we can calculate the next step.

        // Collect iron data
        let ironTotalProduction = Game.Resources.getTotalProduction('resIron');
        let ironSmelterConsumption = -(Game.Resources.getConsumptionBreakdown('resIron').find(x => x.name === 'Smelter').amount);
        let ironProduction = ironTotalProduction - ironSmelterConsumption;
        let ironSmelterBoost = Game.Resources.getProductionBreakdown('resIron').find(x => x.name === 'Smelter').amount;
        let numIronSmelter = extendedRatios.find(x => x.product === 'iron').industryItem.count;
        let ironBoostPerSmelter = ironSmelterBoost / numIronSmelter;
        let ironRawProduction = ironTotalProduction / (1 + ironSmelterBoost);

        // Collect steel data
        let steelProduction = Game.Resources.getTotalProduction('resSteel');
        let numSteelSmelter = extendedRatios.find(x => x.product === 'steel').industryItem.count;
        let steelProductionPerSmelter = steelProduction / numSteelSmelter;

        // Check which resource to add to
        let currentRatios = [ironProduction, steelProduction];
        currentRatios = GameMathRatios.normalizeRatios(currentRatios, extendedRatios.reduce((a, b) => a + b.ratio, 0));

        let ironRatio = currentRatios[0];
        let steelRatio = currentRatios[1];

        let ironTargetRatio = extendedRatios.find(x => x.product === 'iron').ratio;
        let steelTargetRatio = extendedRatios.find(x => x.product === 'steel').ratio;

        let simulateNumIronSmelter = numIronSmelter;
        let simulateNumSteelSmelter = numSteelSmelter;

        if (simulateNumIronSmelter === 0 || simulateNumSteelSmelter === 0) { // Never go below one smelter
            return false;
        }

        if (ironRatio <= ironTargetRatio) { // Simulate iron increase
            simulateNumIronSmelter++;
            simulateNumSteelSmelter--;
        } else { // Simulate steel increase
            simulateNumIronSmelter--;
            simulateNumSteelSmelter++;
        }

        let simulateIronProduction = ironRawProduction * (1 + ironBoostPerSmelter * simulateNumIronSmelter) - 2 * simulateNumSteelSmelter;
        let simulateSteelProduction = steelProductionPerSmelter * simulateNumSteelSmelter;

        let simulateRatios = GameMathRatios.normalizeRatios([simulateIronProduction, simulateSteelProduction], ratios.reduce((a, b) => a + b.ratio, 0));

        // If simulation is closer to target, apply the change
        let currDiff = Math.abs(ironRatio - ironTargetRatio) / ironTargetRatio + Math.abs(steelRatio - steelTargetRatio) / steelTargetRatio;
        let simDiff = Math.abs(simulateRatios[0] - ironTargetRatio) / ironTargetRatio + Math.abs(simulateRatios[1] - steelTargetRatio) / steelTargetRatio;

        if (simDiff < currDiff) {
            if (ironRatio <= ironTargetRatio) { // Simulated iron increase
                Game.Industry.Smelter.addIndustryItem(extendedRatios.find(x => x.product === 'iron').industryItem);
                return true;
            } else { // Simulated steel increase
                Game.Industry.Smelter.addIndustryItem(extendedRatios.find(x => x.product === 'steel').industryItem);
                return true;
            }
        }

        return false; // Somulation did not predict moving closer to the target

        /*
        direct calculation without simulation:
        x -> ironSmelter
        y -> steelSmelter
        iron: ironRaw * (1 + ironBoostPerSmelter * x) - 2y
        steel: steelPerSmelter * y

        ratio:
        2 iron = 3 steel
        2 * ironRaw * (1 + ironBoostPerSmelter * x) - 2y = 3 * steelPerSmelter * y
        2 * ironRaw * (1 + ironBoostPerSmelter * x) = 3 * steelPerSmelter * y + 2y
        2 * ironRaw * (1 + ironBoostPerSmelter * x) = (3 * steelPerSmelter + 2) * y
        y = (2 * ironRaw * (1 + ironBoostPerSmelter * x)) / (3 * steelPerSmelter + 2)
        

        2 * ironRaw * (1 + ironBoostPerSmelter * x) = 3 * steelPerSmelter * y
        2 * ironRaw * (1 + ironBoostPerSmelter * x) = 3 * steelPerSmelter * ((2 * ironRaw * (1 + ironBoostPerSmelter * x)) / (3 * steelPerSmelter))
        2 * ironRaw * (1 + ironBoostPerSmelter * x) = 2 * ironRaw * (1 + ironBoostPerSmelter * x)


        2 * ironRaw * (1 + ironBoostPerSmelter * x) - 2y + 3 * steelPerSmelter * y = 2 + 3
        2 * ironRaw * (1 + ironBoostPerSmelter * x) + (3 * steelPerSmelter - 2) * y = 5
        2 * ironRaw * (1 + ironBoostPerSmelter * x) + (3 * steelPerSmelter - 2) * (2 * ironRaw * (1 + ironBoostPerSmelter * x)) / (3 * steelPerSmelter + 2)) = 5
        simplification:
        a = 2 * ironRaw
        b = ironBoostPerSmelter
        c = 3 * steelPerSmelter
        a * (1 + b * x) + (c - 2) * y = 5
        a * (1 + b * x) + (c - 2) * (a * (1 + b * x)) / (c + 2)) = 5
        a + abx + (c - 2) * (a + abx) / (c + 2) = 5
        a + abx = 5 - (c - 2) * (a + abx) / (c + 2)
        a + abx - 5 = - (c - 2) * (a + abx) / (c + 2)
        (a + abx - 5) * (c + 2) = - (c - 2) * (a + abx)
        ac + abcx - 5c + 2a + 2abx - 10 = - (ac + abcx - 2a - 2abx)
        ac + abcx - 5c + 2a + 2abx - 10 = -ac - abcx + 2a + 2abx
        2ac + 2abcx - 5c - 10 = 0
        2abcx = 5c + 10 - 2ac
        x = (5c + 10 - 2ac) / (2abc)
        x = 5 / 2ab + 5 / abc - 1 / b
        idealIronSmelters = (ironRatioTarget + steelRatioTarget) / ((ironRatioTarget ** 2) * ironRaw) + 
                            (ironRatioTarget + steelRatioTarget) / (ironRatioTarget * ironRaw * ironBoostPerSmelter * steelRatioTarget * steelPerSmelter) -
                            1 / ironBoostPerSmelter
        holy shit that was nasty
        there is no way im implementing this as a generalized formula
        */
    }

    tryAdjustFactoryOptions(ratios: { product: string; ratio: number }[]) {
        // TODO: refactor to remove duplicate code
        // Ratio adjustment logic copied from auto-worker

        // Collect available factory items
        let factoryOutputs: IndustryItem[] = Game.Industry.Factory.outputItems;
        let factoryCap: number = Game.Industry.Factory.countMax;

        // Assign factory items to appropriate ratios
        let extendedRatios = factoryOutputs.map(x => {
            let ratio = ratios.find(y => y.product === x.resourceId);
            return {
                product: x.resourceId,
                ratio: ratio?.ratio ?? 0,
                industryItem: x
            };
        });

        // To appropriatelly calculate ratios, we need all non-zero ratios to have at least one producer active, to make the game reveal a per-factory production rate
        let numUsableFactories = factoryCap;

        for (const ratioItem of extendedRatios) {
            if (ratioItem.ratio === 0) { // Skip unwanted products
                continue;
            }

            let numActive = ratioItem.industryItem.count;

            if (ratioItem.ratio > 0 && numActive === 0) {
                Game.Industry.addIndustryItem(ratioItem.industryItem);
                return; // Keep max per-tick changes to 1
            }

            if (ratioItem.ratio > 0) { // Count usable factories, stop if the number of factories is not enough to cover all output products
                numUsableFactories--;

                if (numUsableFactories === 0) {
                    return;
                }
            }

            let totalProduction = Game.Resources.getTotalProduction(ratioItem.industryItem.resourceId);
            let productionPerFactory = totalProduction / numActive;

            ratioItem.ratio = ratioItem.ratio / productionPerFactory; // Adjust ratio to per-factory production, this way, configured ratio results in adjustments to achieve target ratio in output production rate, not in number of toggled factories
        }

        // Filter out ratios that are not available
        extendedRatios = extendedRatios.filter(x => x.industryItem !== undefined);

        let targetOutputs = this.getRatioTargets(extendedRatios, factoryCap);

        // Update factory outputs
        this.assignFactoryOutputs(targetOutputs);
    }

    private assignFactoryOutputs(targetOutputs: { productId: string, value: number, factoryOutput: IndustryItem }[]) {
        // Validity check - targets can not be undefined, null or NaN
        for (const productTarget of targetOutputs) {
            let targetValue = productTarget.value;
            if (targetValue === undefined || targetValue === null || isNaN(targetValue)) {
                throw new Error(`Invalid target value [${targetValue}] for auto-product [${productTarget.productId}]`);
            }
        }

        // Try to remove products if there are too many
        for (let i = 0; i < targetOutputs.length; i++) {
            let targetOutput = targetOutputs[i];

            if (targetOutput.factoryOutput.count > targetOutput.value) {
                Game.Industry.subIndustryItem(targetOutput.factoryOutput);
                break; // Keep max per-tick changes to 1 (subtraction only or change)
            }
        }

        // At least one item was removed, it should be possible to add back a different product
        for (let i = 0; i < targetOutputs.length; i++) {
            let targetOutput = targetOutputs[i];

            if (targetOutput.factoryOutput.count < targetOutput.value) {
                Game.Industry.addIndustryItem(targetOutput.factoryOutput);
                break; // Keep max per-tick changes to 1 (addition only or change)
            }
        }
    }

    private getRatioTargets(extendedRatios: { product: string; ratio: number; industryItem: IndustryItem }[], totalTarget: number): { productId: string, value: number, factoryOutput: IndustryItem }[] {
        let targetRatios = extendedRatios.map(x => x.ratio);
        let mins = targetRatios.map(x => x > 0 ? 1 : 0); // Ensure all non-zero ratios will have at least one producer active

        let targetIntegers = GameMathRatios.calculateIntRatios(targetRatios, totalTarget, mins); // Calculate integer distribution based on ratios and caps

        // In case a factory item with ratio receives 0,

        let result: { productId: string, value: number, factoryOutput: IndustryItem }[] = [];
        for (let i = 0; i < targetIntegers.length; i++) {
            let target = targetIntegers[i];
            let product = extendedRatios[i].product;
            let factoryOutput = extendedRatios[i].industryItem;

            result.push({ productId: product, value: target, factoryOutput: factoryOutput });
        }

        return result;
    }

    /**
     * Makes sure all outputs that have a ratio of 0 are not producing and remove the ratios from the list
     * @param ratios 
     * @returns true if action was taken, false otherwise
     */
    tryRemoveZeroRatioOutputs(ratios: { product: string; ratio: number; industryItem: IndustryItem }[]): boolean {
        for (let i = ratios.length - 1; i >= 0; i--) {
            let ratio = ratios[i];
            if (ratio.ratio === 0) {
                let outputItem = ratio.industryItem;
                if (outputItem.count > 0) {
                    Game.Industry.Smelter.subIndustryItem(outputItem);
                    return true;
                }

                ratios.splice(i, 1);
            }
        }

        return false;
    }

    /**
     * Ensures that all outputs have a count of at least 1.
     * @param ratios 
     * @returns true if action was taken, false otherwise
     */
    private tryAssertMinOutputCount(ratios: { product: string; ratio: number; industryItem: IndustryItem }[]): boolean {
        for (let i = ratios.length - 1; i >= 0; i--) {
            let ratio = ratios[i];
            if (ratio.ratio === 0) {
                throw new Error("All ratios should be > 0"); // We'll keep this check here, just in case
            }

            let outputItem = Game.Industry.Smelter.outputItems.find(x => x.resourceId === ratio.product);
            if (outputItem.count === 0) {
                Game.Industry.Smelter.addIndustryItem(outputItem);
                return true;
            }
        }

        return false;
    }

    updateUI(): void {
        AutoIndustryInterface.update(
            this.state,
            {
                smelter: {
                    onTogglePrefferedFuel: (resourceId: string) => { this.onTogglePrefferedFuel(resourceId); },
                    onRatioSub: (resourceId: string) => { this.onSmelterRatioSub(resourceId); },
                    onRatioAdd: (resourceId: string) => { this.onSmelterRatioAdd(resourceId); },
                },
                factory: {
                    onRatioSub: (resourceId: string) => { this.onFactoryRatioSub(resourceId); },
                    onRatioAdd: (resourceId: string) => { this.onFactoryRatioAdd(resourceId); },
                }
            }
        );
    }

    private onTogglePrefferedFuel(resourceId: string) {
        if (this.state.smelterConfig === undefined) {
            this.state.smelterConfig = { unlocked: false, enabled: false, preferredFuel: undefined, productRatios: undefined };
        }

        if (this.state.smelterConfig.preferredFuel === resourceId) {
            this.state.smelterConfig.preferredFuel = undefined;
        } else {
            this.state.smelterConfig.preferredFuel = resourceId;
        }

        this.saveState();
        this.updateUI();
    }

    private onSmelterRatioSub(resourceId: string) {
        this.initSmelterRatios();

        let ratioConfigItem = this.state.smelterConfig.productRatios.find((ratio) => ratio.product === resourceId);

        if (ratioConfigItem === undefined) {
            ratioConfigItem = { product: resourceId, ratio: 0 };
            this.state.smelterConfig.productRatios.push(ratioConfigItem);
        }

        if (ratioConfigItem.ratio > 0) {
            ratioConfigItem.ratio = ratioConfigItem.ratio - 1;
        }

        this.saveState();
        this.updateUI();
    }

    private onSmelterRatioAdd(resourceId: string) {
        this.initSmelterRatios();

        let ratioConfigItem = this.state.smelterConfig.productRatios.find((ratio) => ratio.product === resourceId);

        if (ratioConfigItem === undefined) {
            ratioConfigItem = { product: resourceId, ratio: 0 };
            this.state.smelterConfig.productRatios.push(ratioConfigItem);
        }

        ratioConfigItem.ratio = ratioConfigItem.ratio + 1;

        this.saveState();
        this.updateUI();
    }

    private initSmelterRatios() {
        if (this.state.smelterConfig === undefined) {
            this.state.smelterConfig = { unlocked: false, enabled: false, preferredFuel: undefined, productRatios: undefined };
        }

        if (this.state.smelterConfig.productRatios === undefined) {
            this.state.smelterConfig.productRatios = [];
        }
    }

    private onFactoryRatioSub(resourceId: string) {
        this.initFactoryRatios();

        let ratioConfigItem = this.state.factoryConfig.productRatios.find((ratio) => ratio.product === resourceId);

        if (ratioConfigItem === undefined) {
            ratioConfigItem = { product: resourceId, ratio: 0 };
            this.state.factoryConfig.productRatios.push(ratioConfigItem);
        }

        if (ratioConfigItem.ratio > 0) {
            ratioConfigItem.ratio = ratioConfigItem.ratio - 1;
        }

        this.saveState();
        this.updateUI();
    }

    private onFactoryRatioAdd(resourceId: string) {
        this.initFactoryRatios();

        let ratioConfigItem = this.state.factoryConfig.productRatios.find((ratio) => ratio.product === resourceId);

        if (ratioConfigItem === undefined) {
            ratioConfigItem = { product: resourceId, ratio: 0 };
            this.state.factoryConfig.productRatios.push(ratioConfigItem);
        }

        ratioConfigItem.ratio = ratioConfigItem.ratio + 1;

        this.saveState();
        this.updateUI();
    }

    private initFactoryRatios() {
        if (this.state.factoryConfig === undefined) {
            this.state.factoryConfig = { unlocked: false, enabled: false, productRatios: undefined };
        }

        if (this.state.factoryConfig.productRatios === undefined) {
            this.state.factoryConfig.productRatios = [];
        }
    }
}