import useToken from '@/lib/trade/states/useToken'

export default function Faucet() {
  const [selectedToken, setSelectedToken] = useToken()
  return (
    <>
      {selectedToken}
      <button
        onClick={() => {
          setSelectedToken(Math.random().toString())
        }}
      >
        Change
      </button>
    </>
  )
}
