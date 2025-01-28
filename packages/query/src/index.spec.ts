import { main } from './index';

describe('StencilQuery', () => {
  const module = {
    main,
  };

  beforeEach(() => {
    vi.spyOn(module, 'main');
  });

  it('main fn should have been called', () => {
    module.main();

    expect(module.main).toHaveBeenCalled();
  });
});
