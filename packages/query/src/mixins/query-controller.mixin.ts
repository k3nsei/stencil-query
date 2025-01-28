import {
  type ComponentInterface,
  forceUpdate,
  type MixedInCtor,
  State,
} from '@stencil/core';
import { type Observable, Subscription } from 'rxjs';

import { QueryClient, type QueryState } from '../services';

export const queryControllerFactory = <B extends MixedInCtor>(Ctor: B) => {
  class QueryControllerMixin extends Ctor implements ComponentInterface {
    @State() public queryStore: ReadonlyMap<string, Readonly<QueryState>> =
      new Map();

    readonly #queryRefs = new WeakSet<Observable<QueryState>>();

    #querySubscription$ = new Subscription();

    constructor(...args: any[]) {
      super(...args);
    }

    public disconnectedCallback() {
      super['disconnectedCallback']?.();

      if (!this.#querySubscription$.closed) {
        this.#querySubscription$.unsubscribe();
      }

      this.#querySubscription$ = new Subscription();
    }

    public useQuery<T>(
      key: string,
      queryFn: () => Promise<T> | Observable<T>,
    ): QueryState<T> {
      const queryClient = QueryClient.getInstance();
      const source$ = queryClient.getQuery$(key);

      if (this.#queryRefs.has(source$)) {
        return this.#getState(key);
      }

      const subscription$ = source$.subscribe((state) => {
        this.queryStore = new Map(this.queryStore).set(key, state);
        forceUpdate(this);
      });

      this.#querySubscription$.add(subscription$);
      this.#queryRefs.add(source$);

      queryClient.run(key, queryFn).catch((err) => console.error(err));

      return this.#getState(key);
    }

    #getState<T>(key: string): QueryState<T> {
      const self = this;

      return {
        get isBusy(): boolean {
          return self.queryStore.get(key)?.isBusy ?? true;
        },
        get isLoading(): boolean {
          return self.queryStore.get(key)?.isLoading ?? true;
        },
        get isFetching(): boolean {
          return self.queryStore.get(key)?.isFetching ?? false;
        },
        get isError(): boolean {
          return self.queryStore.get(key)?.isError ?? false;
        },
        get error(): Error | null {
          return self.queryStore.get(key)?.error ?? null;
        },
        get data(): T | null {
          return self.queryStore.get(key)?.data ?? null;
        },
        refresh(): Promise<void> {
          return self.queryStore.get(key)?.refresh?.() ?? Promise.resolve();
        },
      };
    }
  }

  return QueryControllerMixin;
};
