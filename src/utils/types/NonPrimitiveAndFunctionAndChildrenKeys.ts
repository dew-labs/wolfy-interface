import type {ComponentType, ReactNode, RefObject} from 'react'

import type {IsExact} from './IsExact'

// Type helpers to check for React types (needed in conditional types)
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ComponentType<any> needed to match all ComponentType instances
type ComponentTypeHelper = ComponentType<any>
type ReactNodeHelper = ReactNode

/**
 * Extracts keys from an object type that have non-primitive, non-function values
 * (excluding the 'children' key and RefObject).
 *
 * This type is useful for identifying props that should not be auto-memoized in
 * React components, such as ComponentType, ReactElement, ReactNode, objects, arrays, etc.
 *
 * @template T - The object type to extract keys from
 * @returns A union of key names whose values are non-primitive and non-function
 *
 * @example
 * ```ts
 * interface Props {
 *   name: string                    // excluded (primitive)
 *   onClick: () => void             // excluded (function)
 *   ref: RefObject<HTMLDivElement>  // excluded (RefObject)
 *   icon: ComponentType             // included (ComponentType)
 *   config: { theme: string }       // included (object)
 *   items: string[]                 // included (array)
 *   data: unknown                   // included (unknown)
 *   children: ReactNode             // excluded (special case)
 * }
 *
 * type Result = NonPrimitiveAndFunctionAndChildrenKeys<Props>
 * // Result = "icon" | "config" | "items" | "data"
 * ```
 *
 * **Type Check Order (critical for correctness):**
 * 1. Exclude 'children' key
 * 2. Exclude never type
 * 3. Check for unknown → INCLUDE
 * 4. Exclude if only null/undefined
 * 5. Check if ONLY primitives (string, number, boolean, bigint, symbol) → EXCLUDE
 * 6. Check for RefObject → EXCLUDE
 * 7. Check for ComponentType → INCLUDE (special case, treated before Function check)
 * 8. Check for ReactNode → INCLUDE (special case, treated before Function check)
 * 9. Check if contains at least one non-primitive, non-function type → INCLUDE
 *    (by excluding all primitives, functions, null, undefined and checking if anything remains)
 *
 * **Edge Cases:**
 * - `any` type: INCLUDED (not excluded by any check, something remains after exclusions)
 * - `unknown` type: INCLUDED (explicitly handled in step 3)
 * - RefObject: EXCLUDED (explicitly checked in step 6)
 * - Branded primitives: EXCLUDED (still primitives after stripping branding)
 * - Functions with properties: EXCLUDED (Function type is excluded in step 7)
 * - Union with all primitives: EXCLUDED (e.g., `string | number` - step 5)
 * - Union with at least one non-primitive: INCLUDED (e.g., `string | number | Big` - step 7)
 * - Objects, arrays, ComponentType, ReactNode, etc.: INCLUDED (remain after step 7 exclusions)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- This is a trick to make union type distributive using T extends any - this causes TypeScript to evaluate each union member separately
export type NonPrimitiveAndFunctionAndChildrenKeys<T extends object> = T extends any
  ? Exclude<
      {
        [K in keyof T]: K extends 'children'
          ? never
          : // Exclude never type
            [T[K]] extends [never]
            ? never
            : // Handle unknown explicitly - always include it
              [unknown] extends [T[K]]
              ? K
              : // Strip null/undefined for easier checking
                Exclude<T[K], null | undefined> extends never
                ? never
                : // Check if it's ONLY primitives (after stripping null/undefined)
                  // Use tuple wrapper to prevent distributivity
                  [Exclude<T[K], null | undefined>] extends [
                      string | number | boolean | bigint | symbol,
                    ]
                  ? never
                  : // Check for RefObject - exclude it (must check before other object checks)
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- RefObject needs any for generic check
                    IsExact<RefObject<any>, NonNullable<T[K]>> extends true
                    ? never
                    : // Check for ComponentType and ReactNode (these are special - we want to include them)
                      // ComponentType is technically a function, but we treat it specially
                      NonNullable<T[K]> extends ComponentTypeHelper
                      ? K
                      : NonNullable<T[K]> extends ReactNodeHelper
                        ? K
                        : // Now check if there's at least one non-primitive, non-function type
                          // by excluding primitives, functions, null, undefined and seeing if anything remains
                          // We need Function type for this check, despite the linter warning
                          [
                              Exclude<
                                T[K],
                                | string
                                | number
                                | boolean
                                | bigint
                                | symbol
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type -- Function type needed for exclusion check
                                | Function
                                | null
                                | undefined
                              >,
                            ] extends [never]
                          ? never
                          : // If we reach here, the type contains at least one non-primitive, non-function value
                            K
      }[keyof T],
      undefined
    >
  : never
