/**
 * @see https://github.com/lint-staged/lint-staged
 */
const config = {
  '.githooks/!(_){/**,}': 'prettier --write --parser sh',
  '*.{js,ts,jsx,tsx,cjs,cts,mjs,mts,json,html,css,scss,md,yml,yaml,sh}':
    'prettier --write --ignore-unknown',
};

export default config;
