export default function trimZeroDecimals(amount: string) {
  if (parseFloat(amount) === parseInt(amount)) {
    return parseInt(amount).toString()
  }
  return amount
}
