import {
  Component,
  type ComponentInterface,
  Event,
  type EventEmitter,
  h,
  Mixin,
} from '@stencil/core';
import type { QueryState } from 'stencil-query';
import { queryControllerFactory } from 'stencil-query/query-controller';

@Component({
  tag: 'my-component',
  shadow: false,
})
export class MyComponent
  extends Mixin(queryControllerFactory)
  implements ComponentInterface
{
  @Event() public fetchCompleted: EventEmitter<string>;

  protected foo: QueryState<string> | null = null;

  public componentWillLoad() {
    this.foo = this.useQuery('foo', createFetchFn(this.fetchCompleted.emit));
  }

  public render() {
    const { isBusy } = this.foo;

    return (
      <div
        id="card"
        role="region"
        aria-label="Query result"
        aria-busy={String(isBusy)}
        class="w-80 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-sm">
        <div
          id="card-header"
          class="bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-5">
          <h2 class="text-lg leading-tight font-bold text-white">
            stencil-query
          </h2>
        </div>

        <div id="card-body" class="space-y-5 px-6 py-6">
          <div
            id="card-content"
            aria-live="polite"
            aria-atomic="true"
            class="flex min-h-13 items-stretch">
            {isBusy ? this.renderLoader() : this.renderData()}
          </div>

          {this.renderRefreshButton()}
        </div>
      </div>
    );
  }

  private renderLoader() {
    return (
      <div
        id="loader"
        role="status"
        class="flex w-full items-center justify-center gap-3">
        <svg
          aria-hidden="true"
          focusable="false"
          class="size-5 animate-spin text-indigo-400"
          fill="none"
          viewBox="0 0 24 24">
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span class="text-sm font-medium text-slate-400">Fetching data…</span>
      </div>
    );
  }

  private renderData() {
    const { data } = this.foo;
    const value = data?.toUpperCase();

    return (
      <div
        id="content"
        role="status"
        class="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-medium text-white">
        {value}
      </div>
    );
  }

  private renderRefreshButton() {
    const { isBusy, refresh } = this.foo;

    return (
      <button
        id="refresh-button"
        aria-label={isBusy ? 'Loading, please wait…' : 'Refresh query result'}
        aria-busy={String(isBusy)}
        class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-all duration-150 hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 active:scale-95 disabled:cursor-not-allowed disabled:bg-indigo-900 disabled:text-indigo-400 disabled:opacity-60 disabled:active:scale-100"
        disabled={isBusy}
        onClick={() => refresh()}>
        <svg
          aria-hidden="true"
          focusable="false"
          class="size-4"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Refresh
      </button>
    );
  }
}

const createFetchFn = (callback: (value: string) => CustomEvent) => {
  const words = [
    'It works on my machine',
    'Have you tried turning it off and on again?',
    'This is fine',
    'Works as designed',
    'Not a bug, a feature',
    'TODO: Fix this later',
  ] as const;

  let i = 0;

  return () => {
    const promise = new Promise<string>((resolve) =>
      setTimeout(() => resolve(words[i++ % words.length]), 2_000),
    );

    promise.then((value) => callback(value));

    return promise;
  };
};
