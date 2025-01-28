export class QueryFailedException extends Error {
  public readonly name = 'QueryFailedException' as const;

  constructor(cause?: unknown) {
    super('Query failed. Check the cause for more details.', { cause });
  }
}
