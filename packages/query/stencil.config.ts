import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'query',
  tsconfig: 'tsconfig.json',
  outputTargets: [
    {
      type: 'dist',
      transformAliasedImportPathsInCollection: false,
    },
  ],
  testing: {
    browserHeadless: 'shell',
  },
  transformAliasedImportPaths: true,
  preamble:
    '(C) StencilQuery https://github.com/k3nsei/stencil-query - MIT License',
};
