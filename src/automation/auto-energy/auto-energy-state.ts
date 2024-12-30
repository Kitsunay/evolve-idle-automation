import { EnergyConsumer } from "./energy-consumer"

export interface AutoEnergyState {
    unlocked: boolean
    enabled: boolean
    energyConsumers: EnergyConsumer[]
}