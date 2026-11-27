import type { TreeDecorator } from './TreeDecorator.js';

export interface DecoratorCatalog {
  treeDecorators(): readonly TreeDecorator[];
}
