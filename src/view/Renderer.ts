import { Store, Action } from 'redux';
import Timer from '../Timer';

export interface RendererError {
  kind: 'error/renderer';
  message: string;
}

abstract class Renderer<P, S, A extends Action> {
  private _timer: Timer<void> | undefined;
  private _store: Store<S, A> | undefined;
  private _selector: ((state: S) => Promise<P>) | undefined;

  public timeout = 200;

  constructor() {
    this._timer = undefined;
    this._store = undefined;
    this._selector = undefined;
  }

  private _debounceUpdateView(state: S): void {
    if (this._timer) {
      this._timer.cancel();
    }
    this._timer = new Timer<void>();
    this._timer.lazyExec(async () => {
      if (!this._selector) {
        // doesn't expected to reach here
        this.notifyError({
          kind: 'error/renderer',
          message: '[Renderer::updateView] selector not binded'
        });
      } else {
        const params = await this._selector(state);
        this.updateView(params);
      }
      this._timer = undefined;
    }, this.timeout);
  }

  protected abstract updateView(params: P): void;
  protected abstract render(params: P): void;
  protected abstract notifyError(error: RendererError): void;

  public bind(store: Store<S, A>, selector: (state: S) => Promise<P>): void {
    this._selector = selector;
    this._store = store;
    this._store.subscribe(() => {
      if (!this._store) {
        // doesn't expected to reach here
        this.notifyError({
          kind: 'error/renderer',
          message: '[Renderer::updateView] store not binded'
        });
      } else {
        this._debounceUpdateView(this._store.getState());
      }
    });
  }

  public async init(): Promise<void> {
    if (!this._selector || !this._store) {
      this.notifyError({
        kind: 'error/renderer',
        message: '[Renderer::init] store or selector not binded'
      });
    } else {
      const params = await this._selector(this._store?.getState());
      this.render(params);
    }
  }
}

export default Renderer;
