class Queue<T> {
  private _store: T[] = [];

  public size(): number {
    return this._store.length;
  }

  public peek(): T | undefined {
    return this._store[0];
  }

  public enqueue(value: T): void {
    this._store.push(value);
  }

  public dequeue(): T | undefined {
    return this._store.shift();
  }

  public clear(): void {
    this._store = [];
  }
}

export default Queue;
