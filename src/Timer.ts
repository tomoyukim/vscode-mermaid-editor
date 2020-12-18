class Timer<T> {
  private _timer: NodeJS.Timeout | undefined;

  constructor() {
    this._timer = undefined;
  }

  private _timeout(ms: number): Promise<void> {
    return new Promise(resolve => {
      this._timer = setTimeout(() => {
        this._timer = undefined;
        resolve();
      }, ms);
    });
  }

  public cancel(): void {
    if (this._timer) {
      clearTimeout(this._timer);
    }
  }

  public async lazyExec(task: () => Promise<T>, ms: number): Promise<T> {
    await this._timeout(ms);
    const res = await task();
    return res;
  }
}

export default Timer;
