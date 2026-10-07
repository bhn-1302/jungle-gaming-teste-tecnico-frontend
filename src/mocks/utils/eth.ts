const ETH_SCALE = 8
const ETH_FACTOR = 100_000_000n

export function ethToUnits(value: string): bigint {
  const [integerPart, fractionPart = ''] =
    value.split('.')

  const normalizedFraction = fractionPart
    .padEnd(ETH_SCALE, '0')
    .slice(0, ETH_SCALE)

  return (
    BigInt(integerPart) * ETH_FACTOR +
    BigInt(normalizedFraction)
  )
}

export function unitsToEth(value: bigint): string {
  const integerPart = value / ETH_FACTOR

  const fractionPart = (value % ETH_FACTOR)
    .toString()
    .padStart(ETH_SCALE, '0')

  return `${integerPart}.${fractionPart}`
}

export function multiplyEth(
  value: string,
  quantity: number,
): string {
  return unitsToEth(
    ethToUnits(value) * BigInt(quantity),
  )
}

export function addEth(
  ...values: string[]
): string {
  const total = values.reduce(
    (sum: bigint, value: string) =>
      sum + ethToUnits(value),
    0n,
  )

  return unitsToEth(total)
}

export function subtractEth(
  value: string,
  amount: string,
): string {
  const valueUnits = ethToUnits(value)
  const amountUnits = ethToUnits(amount)

  return unitsToEth(valueUnits - amountUnits)
}

export function percentageEth(
  value: string,
  percentage: bigint,
): string {
  return unitsToEth(
    (ethToUnits(value) * percentage) / 100n,
  )
}