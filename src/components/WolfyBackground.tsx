import {memo} from 'react'

const BACKGROUND_STYLE = {
  backgroundImage: 'radial-gradient(white .5px, transparent 0.5px)',
  backgroundSize: '1rem 1rem',
  position: 'fixed' as const,
  zIndex: 0,
  width: '100%',
  height: '100%',
  opacity: 0.5,
  maskSize: '100% 100%',
  maskImage:
    'radial-gradient(768px at var(--mouse-x) var(--mouse-y), rgb(0, 0, 0) 20%, rgba(0, 0, 0, 0) 100%)',
}

export default memo(function WolfyBackground() {
  return <div style={BACKGROUND_STYLE} />
})
