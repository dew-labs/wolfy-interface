function getAllCssVariableName(filter?: (name: `--${string}`) => boolean) {
  const styleSheets = document.styleSheets

  const cssVars = new Set<string>()
  // loop each stylesheet
  for (const stylesheet of styleSheets) {
    // loop stylesheet's cssRules
    try {
      // try/catch used because 'hasOwnProperty' doesn't work
      for (const rule of stylesheet.cssRules) {
        try {
          // Only process CSSStyleRule types that have style property
          if (rule instanceof CSSStyleRule) {
            for (const propertyName of rule.style) {
              // test name for css variable signature and uniqueness
              if (
                propertyName.startsWith('--') &&
                !cssVars.has(propertyName) &&
                (filter ? filter(propertyName) : true)
              ) {
                cssVars.add(propertyName)
              }
            }
          }
        } catch {
          /* do nothing */
        }
      }
    } catch {
      /* do nothing */
    }
  }
  return cssVars
}

const cssVariablesAtom = atomWithMutative<Record<string, string>>({})
cssVariablesAtom.debugLabel = 'cssVariablesAtom'

export const CssVariableEffects = memo(function CssVariableEffects() {
  const setCssVariable = useSetAtom(cssVariablesAtom)

  const updateVariables = useCallback(() => {
    // NOTE: can use the filter function to exclude some css variables such as css variables come from libraries
    const cssVariableNames = getAllCssVariableName(name => !name.startsWith('--mantine'))

    const style = getComputedStyle(document.documentElement)

    cssVariableNames.forEach(name => {
      const value = style.getPropertyValue(name).trim()
      if (!value) return

      setCssVariable(prev => {
        prev[name] = value
      })
    })
  }, [setCssVariable])

  useEffect(() => {
    updateVariables()

    const observer = new MutationObserver(_mutations => {
      updateVariables()
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'], // NOTE: this should be an reliable way to detect theme change
    })

    return () => {
      observer.disconnect()
    }
  }, [updateVariables])

  return null
})

export const createCssVariableAtom = (variableName: string) => {
  const thisAtom = focusAtom(cssVariablesAtom, optic => optic.prop(variableName))
  thisAtom.debugLabel = `cssVariable(${variableName})Atom`

  return thisAtom
}

export default function useCssVariable(variableName: string) {
  const cssVariableAtom = useMemo(() => createCssVariableAtom(variableName), [variableName])
  return useAtomValue(cssVariableAtom)
}
