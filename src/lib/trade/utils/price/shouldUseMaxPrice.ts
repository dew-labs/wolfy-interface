export default function shouldUseMaxPrice(isIncrease: boolean, isLong: boolean) {
  return isIncrease ? isLong : !isLong
}
