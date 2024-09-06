import Effect from './Effect'

// function Overlay() {
//   return (
//     <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}>
//       <a
//         href='https://pmnd.rs/'
//         style={{position: 'absolute', bottom: 40, left: 90, fontSize: '13px'}}
//       >
//         pmnd.rs
//         <br />
//         dev collective
//       </a>
//       <div style={{position: 'absolute', top: 40, left: 40, fontSize: '13px'}}>ok —</div>
//       <div style={{position: 'absolute', bottom: 40, right: 40, fontSize: '13px'}}>22/12/2022</div>
//     </div>
//   )
// }

function Background() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(233deg, #DB1935 21.41%, #7D000D 72.86%)',
        opacity: 0.3,
      }}
    ></div>
  )
}

export default function Home() {
  return (
    <>
      <Background />
      <Effect />
      {/* <Overlay /> */}
    </>
  )
}
