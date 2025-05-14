/**
 * Creates props for a skip navigation target element. Skip navigation is an accessibility feature that allows
 * keyboard users to bypass repetitive navigation links and jump directly to the main content.
 *
 * The target element should be the destination where users land after activating a skip link.
 * This function sets up the necessary attributes for the target element:
 * - Sets the element's ID for linking
 * - Makes the element focusable but not in the normal tab order
 *
 * @example // In your main content area:
 * ```tsx
 * <main {...skipTargetProps('main-content')}>
 *   Main content here
 * </main>
 * ```
 *
 * // Corresponding skip link:
 * ```tsx
 * <a href="#main-content">Skip to main content</a>
 * ```
 * @param id - The ID to be used for the skip target element
 * @returns Props object containing id and tabIndex
 */
export default function skipTargetProps(id: string) {
  return {id, tabIndex: -1}
}
