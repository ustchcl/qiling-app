export default class Timer {
  duration = 0
  interval: NodeJS.Timeout | null = null;
  timeout: NodeJS.Timeout | null = null;
  callback = () => { }

  constructor(duration: number, callback: () => void) {
    this.restart(duration, callback)
  }

  clear() {
    if (this.timeout) {
      clearTimeout(this.timeout)
    }
    if (this.interval) {
      clearInterval(this.interval)
    }
  }

  restart(duration: number, callback: () => void) {
    this.clear()
    this.start(duration, callback)
  }

  start(duration: number, callback: () => void) {
    this.duration = duration === -1 ? 3600 : duration
    this.callback = callback

    if (duration === -1) {
      const current = Date.now();
      const remainSeconds = 3600 - Math.floor(current / 1000) % 3600
      // 每整点显示
      this.timeout = setTimeout(() => {
        this.interval = setInterval(this.callback, this.duration * 1000)
      }, remainSeconds)
    } else {
      this.interval = setInterval(this.callback, this.duration * 1000)
    }
  }
}