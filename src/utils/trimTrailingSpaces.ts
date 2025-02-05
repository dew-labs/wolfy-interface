export default function trimTrailingSpaces(str: string) {
  // Remove extra whitespace from the entire string, including middle spaces
  // Convert multiple spaces to single space and trim ends
  return str.replace(/\s+/g, ' ').trim()
}
