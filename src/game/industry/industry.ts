import { Clicker } from "../clicker";
import { Factory } from "./factory";
import { IndustryItem } from "./industry-item";
import { Smelter } from "./smelter";

export class Industry {
    public static Smelter = Smelter;
    public static Factory = Factory;

    static addIndustryItem(industryItem: IndustryItem) {
        Clicker.click(industryItem.addButton);
    }

    static subIndustryItem(industryItem: IndustryItem) {
        Clicker.click(industryItem.subButton);
    }
}