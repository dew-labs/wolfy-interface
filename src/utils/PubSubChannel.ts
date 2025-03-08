/**
 * Pub/Sub across multiple browser tabs
 */
export default class PubSubChannel<M = unknown> {
  private readonly publisher: BroadcastChannel
  private readonly subscriber: BroadcastChannel

  constructor(channelName: string) {
    // We use 2 instances of BroadcastChannel because the instance that sends the message will not receive the message it just sent, and it's not the desired outcome.
    this.publisher = new BroadcastChannel(channelName)
    this.subscriber = new BroadcastChannel(channelName)

    // Ensure channels are closed when object is garbage collected
    if (typeof window !== 'undefined') {
      window.addEventListener(
        'beforeunload',
        () => {
          this.destroy()
        },
        {once: true},
      )
    }
  }

  // TODO: typecheck the data
  pub(data: M) {
    this.publisher.postMessage(data)
  }

  // TODO: typecheck the data
  sub(listener: (event: MessageEvent<M>) => unknown, options?: boolean | AddEventListenerOptions) {
    this.subscriber.addEventListener('message', listener, options)
  }

  unSub(
    listener: (event: MessageEvent<M>) => unknown,
    options?: boolean | AddEventListenerOptions,
  ) {
    this.subscriber.removeEventListener('message', listener, options)
  }

  destroy() {
    this.publisher.close()
    this.subscriber.close()
  }
}
