import {
  BehaviorSubject,
  firstValueFrom,
  from,
  isObservable,
  type Observable,
  of,
} from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { QueryFailedException } from '../exceptions';
import { shallowMerge } from '../utils';

export interface QueryFn<T = any> {
  (): Promise<T> | Observable<T>;
}

export interface QueryState<T = any> {
  isBusy: boolean;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  data: T | null;
  refresh(): Promise<void>;
}

export class QueryClient {
  static #instance: QueryClient;

  #cache = new Map<string, BehaviorSubject<QueryState>>();

  private constructor() {}

  public static getInstance(): QueryClient {
    return (this.#instance ??= new QueryClient());
  }

  public getQuery$<T>(key: string): Observable<QueryState<T>> {
    return this.#getSubject$<T>(key).asObservable();
  }

  public async run<T>(key: string, queryFn: QueryFn<T>): Promise<void> {
    const subject$ = this.#getSubject$(key);

    this.#patchState(subject$, {
      refresh: () =>
        this.#call(subject$, queryFn).catch((err) => console.error(err)),
    });

    await this.#call(subject$, queryFn);
  }

  #getSubject$<T>(key: string): BehaviorSubject<QueryState<T>> {
    if (!this.#cache.has(key)) {
      this.#cache.set(
        key,
        new BehaviorSubject<QueryState>(
          Object.assign(Object.create(null), {
            isBusy: true,
            isLoading: true,
            isFetching: false,
            isError: false,
            error: null,
            data: null,
            refresh: () => Promise.resolve(),
          }),
        ),
      );
    }

    return this.#cache.get(key)!;
  }

  #call<T>(
    subject$: BehaviorSubject<QueryState<T>>,
    queryFn: QueryFn<T>,
  ): Promise<void> {
    const source = queryFn();
    const source$ = isObservable(source) ? source : from(source);

    this.#patchState(subject$, {
      isBusy: true,
      isFetching: true,
      isError: false,
    });

    return firstValueFrom(
      source$.pipe(
        tap(this.#onSuccess.bind(this, subject$)),
        catchError(this.#onError.bind(this, subject$)),
      ),
    );
  }

  #patchState<T>(
    subject$: BehaviorSubject<QueryState<T>>,
    patch: Partial<QueryState<T>>,
  ) {
    const prevState = subject$.getValue();

    subject$.next(shallowMerge(prevState, patch));
  }

  #onSuccess<T>(subject$: BehaviorSubject<QueryState<T>>, data: T): void {
    this.#patchState(subject$, {
      isBusy: false,
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      data,
    });
  }

  #onError<T>(
    subject$: BehaviorSubject<QueryState<T>>,
    cause: unknown,
  ): Observable<null> {
    const error = new QueryFailedException(cause);

    this.#patchState(subject$, {
      isBusy: false,
      isLoading: false,
      isFetching: false,
      isError: true,
      error,
    });

    return of(null);
  }
}
