import Presentational from './Presentational'
import VisuallyHidden from './VisuallyHidden'

export interface AccessibleAlternativeProps {
  to: string | ReactNode
  is: string | ReactNode
}

export default function AccessibleAlternative({to, is}: AccessibleAlternativeProps) {
  return (
    <>
      <Presentational>{to}</Presentational>
      <VisuallyHidden>{is}</VisuallyHidden>
    </>
  )
}
