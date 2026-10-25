import type { ChangeSet } from './ChangeSet.js';

export class ChangeSetExecutor {
  public static apply(changes: readonly ChangeSet[]): void {
    ChangeSetExecutor.run(changes, 'apply');
  }

  public static revert(changes: readonly ChangeSet[]): void {
    ChangeSetExecutor.run(changes, 'revert');
  }

  public static rollback(
    actions: readonly (() => void)[],
    originalError: unknown
  ): never {
    const rollbackErrors: unknown[] = [];
    for (const action of actions) {
      try {
        action();
      } catch (error) {
        rollbackErrors.push(error);
      }
    }
    if (rollbackErrors.length > 0) {
      throw new AggregateError(
        [originalError, ...rollbackErrors],
        'change set failed and one or more rollback actions also failed'
      );
    }
    throw originalError;
  }

  private static run(
    changes: readonly ChangeSet[],
    direction: 'apply' | 'revert'
  ): void {
    // 变更之间可能有先后依赖，撤销和失败补偿都必须逆序执行。
    const ordered = direction === 'apply' ? changes : [...changes].reverse();
    const applied: ChangeSet[] = [];
    try {
      for (const change of ordered) {
        change[direction]();
        applied.push(change);
      }
    } catch (error) {
      const rollbackDirection = direction === 'apply' ? 'revert' : 'apply';
      ChangeSetExecutor.rollback(
        applied
          .reverse()
          .map((change) => () => change[rollbackDirection]()),
        error
      );
    }
  }
}
