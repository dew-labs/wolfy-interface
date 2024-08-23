import {Theme} from '@/lib/theme/theme.ts'
import {useCurrentTheme} from '@/lib/theme/useCurrentTheme.ts'

export interface ChartConfig {
  textColor: string
  gridColor: string
}

export default function useChartConfig(): ChartConfig {
  const [currentTheme] = useCurrentTheme()
  const isDark = currentTheme === Theme.Dark

  return {
    textColor: isDark ? 'white' : 'black',
    gridColor: isDark ? '#ffffff1a' : '',
  }
}
