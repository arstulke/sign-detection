const StorageUnitValues = ["", "KiB", "MiB", "GiB"] as const;
type StorageUnit = typeof StorageUnitValues[number];

export function formatWithStorageUnit(
  value: number,
): { value: number; unit: StorageUnit } {
  return StorageUnitValues
    .map((unit: StorageUnit, idx: number) => ({
      value: Math.round(value / Math.pow(1024, idx + 1)),
      unit,
    }))
    .find(({ value }, idx, arr) => {
      const isSmallerThanNextUnit = value < 1024;
      const isLast = idx === arr.length - 1;
      return isSmallerThanNextUnit || isLast;
    })!;
}
