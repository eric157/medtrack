import { Medication, Patient, DepletionForecast } from './types';

/**
 * Calculates depletion forecasting details for a given medication:
 * Days Left = floor( current_stock / (daily_frequency * dosage_per_take) )
 * Flagged low stock if Days Left <= low_stock_threshold_days
 */
export function calculateDepletionForecast(
  medication: Medication,
  patientName: string,
  targetDaysSupply: number = 30
): DepletionForecast {
  const dailyConsumption = Math.max(1, medication.daily_frequency * medication.dosage_per_take);
  const daysLeft = Math.floor(medication.current_stock / dailyConsumption);

  // Calculate estimated depletion date
  const now = new Date();
  const depletionDateObj = new Date(now.getTime() + daysLeft * 24 * 60 * 60 * 1000);
  const depletionDate = depletionDateObj.toISOString().split('T')[0];

  const isLowStock = daysLeft <= medication.low_stock_threshold_days;

  // Calculate refill pills needed to achieve target days supply
  const targetStock = targetDaysSupply * dailyConsumption;
  const refillQuantityNeeded = Math.max(0, targetStock - medication.current_stock);

  return {
    medicationId: medication.id,
    medicationName: medication.name,
    patientName,
    currentStock: medication.current_stock,
    dosagePerTake: medication.dosage_per_take,
    dailyFrequency: medication.daily_frequency,
    daysLeft,
    depletionDate,
    isLowStock,
    refillQuantityNeeded
  };
}

export function formatDaysRemainingText(daysLeft: number): string {
  if (daysLeft === 0) return 'Depleted today!';
  if (daysLeft === 1) return '1 day left';
  return `${daysLeft} days left`;
}
