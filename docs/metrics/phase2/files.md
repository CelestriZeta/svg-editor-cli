# Git 历史生成的文件清单与职责

目标源码树 SHA-256 30e81599cb048dd9f0b70edf0a002039cfbfc61ca17c19466ea90f635cac1997；基线 de07b3600de23e1283a4ba1b9e6f48700e04aab3。职责是目录角色与实际类名索引，详细行为见实验报告。

| 文件 | 分类 | 类 | 职责 | 行数 | 圈复杂度 |
|---|---|---|---|---:|---:|
| extensions/svg-tools/src/SvgDocumentSymbolProvider.ts | vscode | SvgDocumentSymbolProvider | 独立 VSCode 插件实践；行为入口：provideDocumentSymbols | 45 | 6 |
| extensions/svg-tools/src/SvgFileDecorationProvider.ts | vscode | SvgFileDecorationProvider | 独立 VSCode 插件实践；行为入口：provideFileDecoration, watch | 37 | 10 |
| extensions/svg-tools/src/extension.ts | vscode |  | 独立 VSCode 插件实践；extension.ts | 16 | 1 |
| extensions/svg-tools/src/outline/SvgOutlineElement.ts | vscode | SvgOutlineElement | 独立 VSCode 插件实践；行为入口：name, start, selectionEnd, end, children, append, close | 41 | 8 |
| extensions/svg-tools/src/outline/SvgOutlineParser.ts | vscode | SvgOutlineParser | 独立 VSCode 插件实践；行为入口：parse | 56 | 13 |
| src/application/CommandDispatcher.ts | kernel | CommandDispatcher | 会话、历史与应用协调；行为入口：create | 30 | 7 |
| src/application/CommandExecutor.ts | kernel | CommandExecutor | 会话、历史与应用协调；行为入口：execute | 52 | 13 |
| src/application/CommandHistory.ts | kernel | CommandHistory | 会话、历史与应用协调；行为入口：record, establishIoBarrier, canUndo, canRedo, undoCount, redoCount, isBlocked, undo, redo | 83 | 18 |
| src/application/DocumentCheckpoints.ts | kernel | DocumentCheckpoints | 会话、历史与应用协调；行为入口：subscribe, capture | 28 | 8 |
| src/application/DocumentService.ts | kernel | DocumentService | 会话、历史与应用协调；行为入口：init, read, save, countElements, canvasSize, resizeCanvas | 79 | 15 |
| src/application/EditorSession.ts | kernel | EditorSession | 会话、历史与应用协调；行为入口：document, defaultPath, open, requireDocument, setDefaultPath | 33 | 6 |
| src/application/commands/EditChangeSetCommand.ts | kernel | EditChangeSetCommand | 命令执行契约与守卫；行为入口：undoHandler, execute, undo, redo, prepareChange, createResult | 71 | 13 |
| src/application/commands/InvalidCommand.ts | kernel | InvalidCommand | 命令执行契约与守卫；行为入口：execute | 14 | 2 |
| src/application/commands/contracts/Command.ts | kernel | Command | 命令执行契约与守卫；行为入口：category, undoHandler, execute | 17 | 3 |
| src/application/commands/contracts/CommandCategory.ts | kernel |  | 命令执行契约与守卫；CommandCategory.ts | 6 | 0 |
| src/application/commands/contracts/CommandPresenter.ts | kernel |  | 命令执行契约与守卫；行为入口：format | 4 | 0 |
| src/application/commands/contracts/CommandResult.ts | kernel | CommandResult | 命令执行契约与守卫；行为入口：accept | 7 | 0 |
| src/application/commands/contracts/CommandResultVisitor.ts | kernel |  | 命令执行契约与守卫；行为入口：visitPresented, visitCanvas, visitCanvasCreated, visitCanvasResized, visitDocumentRead, visitDocumentSaved, visitError, visitGroupCreated, visitHelp, visitShapeAttributeSet, visitShapeCreated, visitShapeDeleted, visitShapeDetails, visitShapeMoved, visitShapeMovedIntoContainer, visitShapeReordered, visitShapeScaled, visitTree, visitTreeSubtree, visitUngrouped | 43 | 0 |
| src/application/commands/contracts/HistoryController.ts | kernel |  | 命令执行契约与守卫；行为入口：undo, redo | 6 | 0 |
| src/application/commands/contracts/ReorderDirection.ts | kernel |  | 命令执行契约与守卫；ReorderDirection.ts | 4 | 0 |
| src/application/commands/contracts/UndoableCommand.ts | kernel | UndoableCommand | 命令执行契约与守卫；行为入口：undoHandler, undo, redo | 17 | 2 |
| src/application/commands/results/AssignedShapeId.ts | kernel | AssignedShapeId | 命令语义结果；行为入口：tagName, id | 17 | 3 |
| src/application/commands/results/CanvasCreatedResult.ts | kernel | CanvasCreatedResult | 命令语义结果；行为入口：width, height, accept | 25 | 4 |
| src/application/commands/results/CanvasResizedResult.ts | kernel | CanvasResizedResult | 命令语义结果；行为入口：width, height, accept | 25 | 4 |
| src/application/commands/results/CanvasResult.ts | kernel | CanvasResult | 命令语义结果；行为入口：width, height, accept | 25 | 4 |
| src/application/commands/results/DocumentReadResult.ts | kernel | DocumentReadResult | 命令语义结果；行为入口：path, elementCount, assignedIds, accept | 33 | 5 |
| src/application/commands/results/DocumentSavedResult.ts | kernel | DocumentSavedResult | 命令语义结果；行为入口：path, elementCount, accept | 25 | 4 |
| src/application/commands/results/EditDirection.ts | kernel |  | 命令语义结果；EditDirection.ts | 5 | 0 |
| src/application/commands/results/ErrorResult.ts | kernel | ErrorResult | 命令语义结果；行为入口：text, cause, accept | 25 | 4 |
| src/application/commands/results/GroupCreatedResult.ts | kernel | GroupCreatedResult | 命令语义结果；行为入口：childCount, accept | 21 | 3 |
| src/application/commands/results/HelpResult.ts | kernel | HelpResult | 命令语义结果；行为入口：syntaxes, accept | 20 | 3 |
| src/application/commands/results/PresentedCommandResult.ts | kernel | PresentedCommandResult | 命令语义结果；行为入口：value, text, accept | 31 | 5 |
| src/application/commands/results/ShapeAttributeSetResult.ts | kernel | ShapeAttributeSetResult | 命令语义结果；行为入口：attribute, value, accept | 28 | 4 |
| src/application/commands/results/ShapeAttributeSnapshot.ts | kernel | ShapeAttributeSnapshot | 命令语义结果；行为入口：absent, number, text, kind, numericValue, textValue | 61 | 11 |
| src/application/commands/results/ShapeCreatedResult.ts | kernel | ShapeCreatedResult | 命令语义结果；行为入口：parentId, accept | 22 | 3 |
| src/application/commands/results/ShapeDeletedResult.ts | kernel | ShapeDeletedResult | 命令语义结果；行为入口：parentId, accept | 22 | 3 |
| src/application/commands/results/ShapeDetailsResult.ts | kernel | ShapeDetailsResult | 命令语义结果；行为入口：details, accept | 21 | 3 |
| src/application/commands/results/ShapeMovedIntoContainerResult.ts | kernel | ShapeMovedIntoContainerResult | 命令语义结果；行为入口：containerId, accept | 23 | 3 |
| src/application/commands/results/ShapeMovedResult.ts | kernel | ShapeMovedResult | 命令语义结果；行为入口：dx, dy, anchor, accept | 34 | 5 |
| src/application/commands/results/ShapeReorderedResult.ts | kernel | ShapeReorderedResult | 命令语义结果；行为入口：direction, accept | 24 | 3 |
| src/application/commands/results/ShapeScaledResult.ts | kernel | ShapeScaledResult | 命令语义结果；行为入口：factor, anchor, accept | 29 | 4 |
| src/application/commands/results/StructureChangedResult.ts | kernel | StructureChangedResult | 命令语义结果；行为入口：shapeType, shapeId, changed, editDirection | 31 | 5 |
| src/application/commands/results/TreeResult.ts | kernel | TreeResult | 命令语义结果；行为入口：view, accept | 21 | 3 |
| src/application/commands/results/TreeSubtreeResult.ts | kernel | TreeSubtreeResult | 命令语义结果；行为入口：root, accept | 21 | 3 |
| src/application/commands/results/UngroupedResult.ts | kernel | UngroupedResult | 命令语义结果；行为入口：parentId, childCount, accept | 26 | 4 |
| src/application/commands/support/CommandDocumentBinding.ts | kernel | CommandDocumentBinding | 命令执行契约与守卫；行为入口：withDocument | 21 | 3 |
| src/application/commands/support/CommandExecutionGuard.ts | kernel | CommandExecutionGuard | 命令执行契约与守卫；行为入口：run | 24 | 5 |
| src/application/commands/support/CommandNumberParser.ts | kernel | CommandNumberParser | 命令执行契约与守卫；行为入口：parseShape, parseCanvas | 22 | 6 |
| src/application/extensions/AttributeCatalog.ts | kernel |  | 扩展契约与注册事务；行为入口：attributeHandlers | 5 | 0 |
| src/application/extensions/AttributeEditContext.ts | kernel |  | 扩展契约与注册事务；行为入口：prepareSet, readAttribute | 10 | 0 |
| src/application/extensions/AttributeHandler.ts | kernel |  | 扩展契约与注册事务；行为入口：handles, prepare | 18 | 0 |
| src/application/extensions/AttributeResolver.ts | kernel | AttributeResolver | 扩展契约与注册事务；行为入口：prepare | 23 | 12 |
| src/application/extensions/CommandCatalog.ts | kernel |  | 扩展契约与注册事务；行为入口：findCommand, commandSyntaxes | 7 | 0 |
| src/application/extensions/CommandContribution.ts | kernel |  | 扩展契约与注册事务；行为入口：create | 9 | 0 |
| src/application/extensions/DecoratorCatalog.ts | kernel |  | 扩展契约与注册事务；行为入口：treeDecorators | 5 | 0 |
| src/application/extensions/ExtensionRegistry.ts | kernel | ExtensionRegistry | 扩展契约与注册事务；行为入口：empty, get, values, with | 52 | 11 |
| src/application/extensions/Plugin.ts | kernel |  | 扩展契约与注册事务；行为入口：activate | 5 | 0 |
| src/application/extensions/PluginActivationError.ts | kernel | PluginActivationError | 扩展契约与注册事务；PluginActivationError | 7 | 2 |
| src/application/extensions/PluginContext.ts | kernel |  | 扩展契约与注册事务；行为入口：registerShape, registerCommand, registerDecorator, registerAttribute | 12 | 0 |
| src/application/extensions/PluginContributions.ts | kernel | PluginContributions | 扩展契约与注册事务；行为入口：shapes, commands, decorators, attributes, withShape, withCommand, withDecorator, withAttribute | 76 | 19 |
| src/application/extensions/PluginManifest.ts | kernel | PluginManifest | 扩展契约与注册事务；行为入口：validate | 26 | 20 |
| src/application/extensions/PluginRegistration.ts | kernel | PluginRegistration | 扩展契约与注册事务；行为入口：context, finish, close | 59 | 18 |
| src/application/extensions/PluginRegistrationError.ts | kernel | PluginRegistrationError | 扩展契约与注册事务；PluginRegistrationError | 7 | 1 |
| src/application/extensions/PluginRegistry.ts | kernel | PluginRegistry | 扩展契约与注册事务；行为入口：shapes, commands, decorators, attributes, treeDecorators, attributeHandlers, findCommand, findShape, shapeSyntaxes, commandSyntaxes, activate | 80 | 18 |
| src/application/extensions/PluginServices.ts | kernel |  | 扩展契约与注册事务；PluginServices.ts | 11 | 0 |
| src/application/extensions/PreparedAttributeEdit.ts | kernel |  | 扩展契约与注册事务；行为入口：readValue | 9 | 0 |
| src/application/extensions/ShapeCatalog.ts | kernel |  | 扩展契约与注册事务；行为入口：findShape, shapeSyntaxes | 6 | 0 |
| src/application/extensions/ShapeProvider.ts | kernel |  | 扩展契约与注册事务；行为入口：createSpec, project, encode, decode, validateImported | 20 | 0 |
| src/application/extensions/TreeDecorator.ts | kernel |  | 扩展契约与注册事务；行为入口：labels | 8 | 0 |
| src/application/extensions/TreeLineContext.ts | kernel | TreeLineContext | 扩展契约与注册事务；行为入口：document, shape | 20 | 3 |
| src/application/ports/ActiveDocument.ts | kernel |  | 宿主与 IO 端口契约；行为入口：requireDocument | 5 | 0 |
| src/application/ports/CheckpointSource.ts | kernel |  | 宿主与 IO 端口契约；行为入口：subscribe | 5 | 0 |
| src/application/ports/DirectoryAccess.ts | kernel |  | 宿主与 IO 端口契约；行为入口：currentPath, entries | 6 | 0 |
| src/application/ports/DirectoryEntry.ts | kernel | DirectoryEntry | 宿主与 IO 端口契约；行为入口：name, isDirectory | 7 | 3 |
| src/application/ports/DocumentOperations.ts | kernel |  | 宿主与 IO 端口契约；行为入口：init, read, save, countElements, canvasSize, resizeCanvas | 12 | 0 |
| src/application/ports/DocumentReadError.ts | kernel | DocumentReadError | 宿主与 IO 端口契约；行为入口：path | 16 | 3 |
| src/application/ports/DocumentStore.ts | kernel |  | 宿主与 IO 端口契约；行为入口：read, save | 7 | 0 |
| src/application/ports/DocumentStoreError.ts | kernel | DocumentStoreError | 宿主与 IO 端口契约；行为入口：path | 19 | 3 |
| src/application/ports/ImportedShapeId.ts | kernel | ImportedShapeId | 宿主与 IO 端口契约；行为入口：tagName, id | 17 | 3 |
| src/application/ports/LoadedDocument.ts | kernel | LoadedDocument | 宿主与 IO 端口契约；行为入口：document, assignedIds | 21 | 3 |
| src/application/ports/SvgContentKind.ts | kernel |  | 宿主与 IO 端口契约；SvgContentKind.ts | 5 | 0 |
| src/application/ports/SvgShapeInput.ts | kernel |  | 宿主与 IO 端口契约；行为入口：requireSupported, requireNumber, style | 10 | 0 |
| src/application/ports/SvgShapeOutput.ts | kernel | SvgShapeOutput | 宿主与 IO 端口契约；行为入口：attributes, text | 33 | 11 |
| src/application/queries/DocumentQuery.ts | kernel |  | 只读查询投影；行为入口：visit, visitSubtree, inspect | 10 | 0 |
| src/application/queries/DocumentView.ts | kernel | DocumentView | 只读查询投影；行为入口：width, height, children | 29 | 4 |
| src/application/queries/DocumentViewVisitor.ts | kernel | DocumentViewVisitor | 只读查询投影；行为入口：visit, visitSubtree, inspect, enterContainer, leaveContainer, visitShape | 60 | 14 |
| src/application/queries/GeometrySnapshot.ts | kernel | GeometrySnapshot | 只读查询投影；行为入口：empty, named, segment, text, attributes, anchor, end, content | 65 | 10 |
| src/application/queries/ShapeAnchor.ts | kernel | ShapeAnchor | 只读查询投影；行为入口：x, y | 16 | 3 |
| src/application/queries/ShapeReference.ts | kernel | ShapeReference | 只读查询投影；行为入口：type, id | 17 | 3 |
| src/application/queries/ShapeSnapshot.ts | kernel | ShapeSnapshot | 只读查询投影；行为入口：type, kind, isContainer, id, geometry, fill, stroke, strokeWidth, parent, children | 61 | 11 |
| src/bootstrap/CodePlugins.ts | assembly | CodePlugins | 宿主启动及插件装配；行为入口：install | 17 | 1 |
| src/bootstrap/Main.ts | assembly | Main | 宿主启动及插件装配；行为入口：run | 76 | 9 |
| src/bootstrap/PluginLoader.ts | assembly | PluginLoader | 宿主启动及插件装配；行为入口：code, config | 75 | 37 |
| src/bootstrap/entry.ts | assembly |  | 宿主启动及插件装配；entry.ts | 3 | 0 |
| src/cli/CommandLineParser.ts | kernel | CommandLineParser | 终端输入与输出适配；行为入口：parse | 45 | 10 |
| src/cli/CommandSyntaxError.ts | kernel | CommandSyntaxError | 终端输入与输出适配；CommandSyntaxError | 6 | 1 |
| src/cli/OutputFormatter.ts | kernel | OutputFormatter | 终端输入与输出适配；行为入口：format, visitPresented, visitError, visitCanvasCreated, visitCanvas, visitCanvasResized, visitDocumentRead, visitDocumentSaved, visitHelp, visitShapeCreated, visitGroupCreated, visitUngrouped, visitShapeMovedIntoContainer, visitShapeReordered, visitShapeDeleted, visitShapeDetails, visitShapeMoved, visitShapeScaled, visitShapeAttributeSet, visitTree, visitTreeSubtree | 200 | 51 |
| src/cli/Repl.ts | kernel | Repl | 终端输入与输出适配；行为入口：executeLine, run | 67 | 11 |
| src/cli/ShapeFormatter.ts | kernel | ShapeFormatter | 终端输入与输出适配；行为入口：label, geometry, style, inline | 43 | 14 |
| src/cli/ShowFormatter.ts | kernel | ShowFormatter | 终端输入与输出适配；行为入口：format | 21 | 5 |
| src/cli/TreeFormatter.ts | kernel | TreeFormatter | 终端输入与输出适配；行为入口：format, formatSubtree | 43 | 17 |
| src/domain/ChangeSet.ts | kernel |  | 领域校验、遍历和事务；行为入口：apply, revert | 7 | 0 |
| src/domain/ChangeSetExecutor.ts | kernel | ChangeSetExecutor | 领域校验、遍历和事务；行为入口：apply, revert, rollback | 55 | 13 |
| src/domain/CompositeChangeSet.ts | kernel | CompositeChangeSet | 领域校验、遍历和事务；行为入口：changes, hasChanges, apply, revert | 26 | 6 |
| src/domain/DomainError.ts | kernel | DomainError | 领域校验、遍历和事务；DomainError | 6 | 1 |
| src/domain/ShapeFactory.ts | kernel | ShapeFactory | 领域校验、遍历和事务；行为入口：createSubtree, create | 23 | 8 |
| src/domain/document/CanvasSize.ts | kernel | CanvasSize | 文档聚合、结构规划和树关系；行为入口：width, height | 30 | 7 |
| src/domain/document/ShapeRelationsBinding.ts | kernel | ShapeRelationsBinding | 文档聚合、结构规划和树关系；行为入口：view, connect | 16 | 5 |
| src/domain/document/ShapeStructureCandidate.ts | kernel | ShapeStructureCandidate | 文档聚合、结构规划和树关系；行为入口：nodes, parentOf, childrenOf, childCount, indexOf, insert, remove, relocate, validate | 130 | 49 |
| src/domain/document/ShapeStructureChangeSet.ts | kernel | ShapeStructureChangeSet | 文档聚合、结构规划和树关系；行为入口：apply, revert | 29 | 6 |
| src/domain/document/ShapeStructurePlanner.ts | kernel | ShapeStructurePlanner | 文档聚合、结构规划和树关系；行为入口：prepareCreate, prepareDelete, prepareGroup, prepareUngroup, prepareAddTo, prepareFront, prepareBack | 248 | 45 |
| src/domain/document/ShapeSubtree.ts | kernel | ShapeSubtree | 文档聚合、结构规划和树关系；行为入口：root, nodes, parentOf, childrenOf, connect | 49 | 12 |
| src/domain/document/ShapeTree.ts | kernel | ShapeTree | 文档聚合、结构规划和树关系；行为入口：elementCount, rootChildren, childrenOf, findShape, parentOf, locationOf, adopt, adoptSubtree, disown, relocate | 192 | 48 |
| src/domain/document/SvgDocument.ts | kernel | SvgDocument | 文档聚合、结构规划和树关系；行为入口：width, height, canvasSize, resizeCanvas, elementCount, children, createShape, prepareCreateShape, findShape, requireShape, requireContainer, parentOf, deleteShape, prepareDeleteShape, prepareGroup, prepareUngroup, prepareAddTo, prepareFront, prepareBack | 126 | 23 |
| src/domain/shapes/Circle.ts | kernel | Circle | 图形状态与可撤销变更；行为入口：cx, cy, r, prepareMove, prepareScale, ownAttributeSlot | 121 | 17 |
| src/domain/shapes/ContainerShape.ts | kernel | ContainerShape | 图形状态与可撤销变更；行为入口：validateStructure, assertCanUngroup, accept, children, prepareMove, prepareScale, ownAttributeSlot | 62 | 11 |
| src/domain/shapes/Ellipse.ts | kernel | Ellipse | 图形状态与可撤销变更；行为入口：cx, cy, rx, ry, prepareMove, prepareScale, ownAttributeSlot | 143 | 21 |
| src/domain/shapes/GeometryChangeSet.ts | kernel | GeometryChangeSet | 图形状态与可撤销变更；行为入口：single | 10 | 1 |
| src/domain/shapes/GeometryValueChange.ts | kernel | GeometryValueChange | 图形状态与可撤销变更；行为入口：attribute, before, after, beforeUpdate, afterUpdate | 43 | 9 |
| src/domain/shapes/Group.ts | kernel | Group | 图形状态与可撤销变更；行为入口：assertCanUngroup | 19 | 3 |
| src/domain/shapes/Line.ts | kernel | Line | 图形状态与可撤销变更；行为入口：x1, y1, x2, y2, prepareMove, prepareScale, ownAttributeSlot | 139 | 17 |
| src/domain/shapes/Rect.ts | kernel | Rect | 图形状态与可撤销变更；行为入口：x, y, width, height, prepareMove, prepareScale, ownAttributeSlot | 143 | 21 |
| src/domain/shapes/Shape.ts | kernel | Shape | 图形状态与可撤销变更；行为入口：id, fill, stroke, strokeWidth, parent, prepareSet, set, attributeKind, attributeValue, move, scale, accept, prepareMove, prepareScale, ownAttributeSlot, childrenOf, requireMoveDelta, requireScaleFactor, requireFiniteGeometry | 200 | 46 |
| src/domain/shapes/ShapeAttributeChange.ts | kernel | ShapeAttributeChange | 图形状态与可撤销变更；行为入口：hasChanges, apply, revert | 23 | 4 |
| src/domain/shapes/ShapeAttributeSlot.ts | kernel | ShapeAttributeSlot | 图形状态与可撤销变更；行为入口：number, text, name, kind, capture, prepare, write | 94 | 18 |
| src/domain/shapes/ShapeAttributeUpdate.ts | kernel | ShapeAttributeUpdate | 图形状态与可撤销变更；行为入口：number, text, name, valueKind, numericValue, textValue | 71 | 11 |
| src/domain/shapes/ShapeAttributeValue.ts | kernel | ShapeAttributeValue | 图形状态与可撤销变更；行为入口：absent, number, text, fromUpdate, isAbsent, kind, numericValue, textValue, equals | 102 | 20 |
| src/domain/shapes/ShapeAttributeValueKind.ts | kernel |  | 图形状态与可撤销变更；ShapeAttributeValueKind.ts | 4 | 0 |
| src/domain/shapes/ShapeDissolutionChange.ts | kernel | ShapeDissolutionChange | 图形状态与可撤销变更；行为入口：apply, revert, preview | 102 | 23 |
| src/domain/shapes/ShapeGeometryChange.ts | kernel | ShapeGeometryChange | 图形状态与可撤销变更；行为入口：shape, values, hasChanges, apply, revert | 64 | 15 |
| src/domain/shapes/ShapeInsertionChange.ts | kernel | ShapeInsertionChange | 图形状态与可撤销变更；行为入口：insertedShape, apply, revert, preview | 46 | 7 |
| src/domain/shapes/ShapeLocation.ts | kernel | ShapeLocation | 图形状态与可撤销变更；行为入口：parent, index | 24 | 5 |
| src/domain/shapes/ShapeRelations.ts | kernel |  | 图形状态与可撤销变更；行为入口：parentOf, childrenOf | 7 | 0 |
| src/domain/shapes/ShapeRelocationChange.ts | kernel | ShapeRelocationChange | 图形状态与可撤销变更；行为入口：apply, revert, preview | 39 | 5 |
| src/domain/shapes/ShapeRemovalChange.ts | kernel | ShapeRemovalChange | 图形状态与可撤销变更；行为入口：apply, revert, preview | 34 | 5 |
| src/domain/shapes/ShapeStyle.ts | kernel | ShapeStyle | 图形状态与可撤销变更；行为入口：fill, stroke, strokeWidth, withFill, withStroke, withStrokeWidth | 56 | 14 |
| src/domain/shapes/ShapeTreeChange.ts | kernel | ShapeTreeChange | 图形状态与可撤销变更；行为入口：apply, revert, preview | 11 | 0 |
| src/domain/shapes/Text.ts | kernel | Text | 图形状态与可撤销变更；行为入口：x, y, content, prepareMove, prepareScale, ownAttributeSlot | 116 | 16 |
| src/domain/specs/CircleSpec.ts | kernel | CircleSpec | 类型化图形创建规格；行为入口：cx, cy, r, create | 49 | 7 |
| src/domain/specs/EllipseSpec.ts | kernel | EllipseSpec | 类型化图形创建规格；行为入口：cx, cy, rx, ry, create | 56 | 9 |
| src/domain/specs/GroupSpec.ts | kernel | GroupSpec | 类型化图形创建规格；行为入口：create | 15 | 2 |
| src/domain/specs/LineSpec.ts | kernel | LineSpec | 类型化图形创建规格；行为入口：x1, y1, x2, y2, create | 53 | 7 |
| src/domain/specs/RectSpec.ts | kernel | RectSpec | 类型化图形创建规格；行为入口：x, y, width, height, create | 54 | 9 |
| src/domain/specs/ShapeSpec.ts | kernel | ShapeSpec | 类型化图形创建规格；行为入口：id, style, create, children | 33 | 5 |
| src/domain/specs/ShapeSpecWithChildren.ts | kernel | ShapeSpecWithChildren | 类型化图形创建规格；行为入口：type, children, create | 20 | 4 |
| src/domain/specs/TextSpec.ts | kernel | TextSpec | 类型化图形创建规格；行为入口：x, y, content, create | 49 | 7 |
| src/domain/visitor/ShapeCollector.ts | kernel | ShapeCollector | 领域校验、遍历和事务；行为入口：collect, enterContainer, leaveContainer, visitShape | 23 | 4 |
| src/domain/visitor/ShapeVisitor.ts | kernel | ShapeVisitor | 领域校验、遍历和事务；行为入口：enterContainer, leaveContainer, visitShape | 8 | 0 |
| src/infrastructure/DecodedSvgElement.ts | kernel | DecodedSvgElement | SVG/XML 与文件系统适配；行为入口：appendTo | 36 | 6 |
| src/infrastructure/MissingIdAllocator.ts | kernel | MissingIdAllocator | SVG/XML 与文件系统适配；行为入口：resolve, assignments | 33 | 6 |
| src/infrastructure/NodeDirectoryAccess.ts | kernel | NodeDirectoryAccess | SVG/XML 与文件系统适配；行为入口：currentPath, entries | 12 | 3 |
| src/infrastructure/SvgAttributes.ts | kernel | SvgAttributes | SVG/XML 与文件系统适配；行为入口：requireSupported, optionalId, optional, requireNumber, optionalNumber, style, requireViewBox | 109 | 31 |
| src/infrastructure/SvgCanvas.ts | kernel | SvgCanvas | SVG/XML 与文件系统适配；行为入口：width, height, children | 25 | 4 |
| src/infrastructure/SvgDocumentStore.ts | kernel | SvgDocumentStore | SVG/XML 与文件系统适配；行为入口：read, save | 42 | 5 |
| src/infrastructure/SvgElement.ts | kernel | SvgElement | SVG/XML 与文件系统适配；行为入口：tagName, id, collectExplicitIds, addChild, appendText, appendTo | 50 | 18 |
| src/infrastructure/SvgElementFactory.ts | kernel | SvgElementFactory | SVG/XML 与文件系统适配；行为入口：create | 19 | 8 |
| src/infrastructure/SvgReader.ts | kernel | SvgReader | SVG/XML 与文件系统适配；行为入口：read | 30 | 4 |
| src/infrastructure/SvgShapeInputValue.ts | kernel | SvgShapeInputValue | SVG/XML 与文件系统适配；行为入口：id, text, requireSupported, requireNumber, style | 33 | 6 |
| src/infrastructure/SvgTreeParser.ts | kernel | SvgTreeParser | SVG/XML 与文件系统适配；行为入口：parse | 130 | 27 |
| src/infrastructure/SvgWriteVisitor.ts | kernel | SvgWriteVisitor | SVG/XML 与文件系统适配；行为入口：serialize, enterContainer, leaveContainer, visitShape | 50 | 23 |
| src/plugins/builtin-commands/BuiltinCommandContribution.ts | plugins | BuiltinCommandContribution | 插件能力实现；行为入口：name, syntaxes, create | 27 | 5 |
| src/plugins/builtin-commands/BuiltinCommandsPlugin.ts | plugins | BuiltinCommandsPlugin | 插件能力实现；行为入口：activate | 179 | 53 |
| src/plugins/builtin-commands/CreateCommandContribution.ts | plugins | CreateCommandContribution | 插件能力实现；行为入口：syntaxes, create | 21 | 4 |
| src/plugins/builtin-commands/commands/AddToCommand.ts | plugins | AddToCommand | 插件能力实现；行为入口：prepareChange, createResult | 34 | 3 |
| src/plugins/builtin-commands/commands/BackShapeCommand.ts | plugins | BackShapeCommand | 插件能力实现；行为入口：direction, prepareChange | 18 | 3 |
| src/plugins/builtin-commands/commands/CreateShapeCommand.ts | plugins | CreateShapeCommand | 插件能力实现；行为入口：prepareChange, createResult | 31 | 3 |
| src/plugins/builtin-commands/commands/DeleteShapeCommand.ts | plugins | DeleteShapeCommand | 插件能力实现；行为入口：prepareChange, createResult | 42 | 5 |
| src/plugins/builtin-commands/commands/FrontShapeCommand.ts | plugins | FrontShapeCommand | 插件能力实现；行为入口：direction, prepareChange | 18 | 3 |
| src/plugins/builtin-commands/commands/GroupShapesCommand.ts | plugins | GroupShapesCommand | 插件能力实现；行为入口：prepareChange, createResult | 28 | 3 |
| src/plugins/builtin-commands/commands/HelpCommand.ts | plugins | HelpCommand | 插件能力实现；行为入口：execute | 14 | 2 |
| src/plugins/builtin-commands/commands/InitCommand.ts | plugins | InitCommand | 插件能力实现；行为入口：execute | 23 | 3 |
| src/plugins/builtin-commands/commands/MoveShapeCommand.ts | plugins | MoveShapeCommand | 插件能力实现；行为入口：prepareChange, createResult | 52 | 6 |
| src/plugins/builtin-commands/commands/ReadDocumentCommand.ts | plugins | ReadDocumentCommand | 插件能力实现；行为入口：execute | 30 | 4 |
| src/plugins/builtin-commands/commands/RedoCommand.ts | plugins | RedoCommand | 插件能力实现；行为入口：execute | 15 | 3 |
| src/plugins/builtin-commands/commands/ReorderShapeCommand.ts | plugins | ReorderShapeCommand | 插件能力实现；行为入口：direction, prepareChange, createResult | 34 | 2 |
| src/plugins/builtin-commands/commands/ResizeCanvasCommand.ts | plugins | ResizeCanvasCommand | 插件能力实现；行为入口：execute | 23 | 3 |
| src/plugins/builtin-commands/commands/SaveCommand.ts | plugins | SaveCommand | 插件能力实现；行为入口：execute | 23 | 3 |
| src/plugins/builtin-commands/commands/ScaleShapeCommand.ts | plugins | ScaleShapeCommand | 插件能力实现；行为入口：prepareChange, createResult | 49 | 5 |
| src/plugins/builtin-commands/commands/SetShapeAttributeCommand.ts | plugins | SetShapeAttributeCommand | 插件能力实现；行为入口：prepareChange, createResult | 65 | 10 |
| src/plugins/builtin-commands/commands/ShowCanvasCommand.ts | plugins | ShowCanvasCommand | 插件能力实现；行为入口：execute | 19 | 3 |
| src/plugins/builtin-commands/commands/ShowCommand.ts | plugins | ShowCommand | 插件能力实现；行为入口：execute | 24 | 3 |
| src/plugins/builtin-commands/commands/TreeCommand.ts | plugins | TreeCommand | 插件能力实现；行为入口：execute | 31 | 4 |
| src/plugins/builtin-commands/commands/UndoCommand.ts | plugins | UndoCommand | 插件能力实现；行为入口：execute | 15 | 3 |
| src/plugins/builtin-commands/commands/UngroupShapeCommand.ts | plugins | UngroupShapeCommand | 插件能力实现；行为入口：prepareChange, createResult | 34 | 3 |
| src/plugins/builtin-commands/factories/CreateShapeCommandFactory.ts | plugins | CreateShapeCommandFactory | 插件能力实现；行为入口：create | 60 | 18 |
| src/plugins/builtin-commands/factories/DocumentCommandFactory.ts | plugins | DocumentCommandFactory | 插件能力实现；行为入口：createInit, createSave, createRead, createCanvas | 60 | 12 |
| src/plugins/builtin-commands/factories/ShapeEditCommandFactory.ts | plugins | ShapeEditCommandFactory | 插件能力实现；行为入口：createDelete, createMove, createScale, createSet | 93 | 28 |
| src/plugins/builtin-shapes/BuiltinShapesPlugin.ts | plugins | BuiltinShapesPlugin | 插件能力实现；行为入口：activate | 23 | 1 |
| src/plugins/builtin-shapes/CircleShapeProvider.ts | plugins | CircleShapeProvider | 插件能力实现；行为入口：createSpec, project, encode, decode, validateImported | 62 | 10 |
| src/plugins/builtin-shapes/EllipseShapeProvider.ts | plugins | EllipseShapeProvider | 插件能力实现；行为入口：createSpec, project, encode, decode, validateImported | 63 | 10 |
| src/plugins/builtin-shapes/GroupShapeProvider.ts | plugins | GroupShapeProvider | 插件能力实现；行为入口：createSpec, project, encode, decode, validateImported | 47 | 8 |
| src/plugins/builtin-shapes/LineShapeProvider.ts | plugins | LineShapeProvider | 插件能力实现；行为入口：createSpec, project, encode, decode, validateImported | 62 | 10 |
| src/plugins/builtin-shapes/RectShapeProvider.ts | plugins | RectShapeProvider | 插件能力实现；行为入口：createSpec, project, encode, decode, validateImported | 63 | 10 |
| src/plugins/builtin-shapes/TextShapeProvider.ts | plugins | TextShapeProvider | 插件能力实现；行为入口：createSpec, project, encode, decode, validateImported | 58 | 10 |
| src/plugins/dir/DirCommand.ts | plugins | DirCommand | 插件能力实现；行为入口：execute | 15 | 3 |
| src/plugins/dir/DirContribution.ts | plugins | DirContribution | 插件能力实现；行为入口：create | 12 | 3 |
| src/plugins/dir/DirPlugin.ts | plugins | DirPlugin | 插件能力实现；行为入口：activate | 9 | 2 |
| src/plugins/dir/DirPresenter.ts | plugins | DirPresenter | 插件能力实现；行为入口：format | 9 | 8 |
| src/plugins/modified-star/ContentFingerprint.ts | plugins | ContentFingerprint | 插件能力实现；行为入口：shape, document | 11 | 5 |
| src/plugins/modified-star/ModifiedStarDecorator.ts | plugins | ModifiedStarDecorator | 插件能力实现；行为入口：labels | 26 | 8 |
| src/plugins/modified-star/ModifiedStarPlugin.ts | plugins | ModifiedStarPlugin | 插件能力实现；行为入口：activate | 9 | 2 |
| src/plugins/shape-box/BoxAttributeHandler.ts | plugins | BoxAttributeHandler | 插件能力实现；行为入口：handles, prepare | 15 | 8 |
| src/plugins/shape-box/BoxPlugin.ts | plugins | BoxPlugin | 插件能力实现；行为入口：activate | 9 | 1 |
| src/plugins/shape-box/BoxProvider.ts | plugins | BoxProvider | 插件能力实现；行为入口：createSpec, project, encode, decode, validateImported | 31 | 8 |
| src/plugins/shape-box/BoxShape.ts | plugins | BoxShape | 插件能力实现；行为入口：validateStructure | 16 | 6 |
| src/plugins/shape-box/BoxSpec.ts | plugins | BoxSpec | 插件能力实现；行为入口：children, create | 10 | 3 |
| src/plugins/shape-box/BoxTypeDecorator.ts | plugins | BoxTypeDecorator | 插件能力实现；行为入口：labels | 6 | 2 |
| src/plugins/stats/StatsCommand.ts | plugins | StatsCommand | 插件能力实现；行为入口：execute | 14 | 3 |
| src/plugins/stats/StatsContribution.ts | plugins | StatsContribution | 插件能力实现；行为入口：create | 13 | 3 |
| src/plugins/stats/StatsPlugin.ts | plugins | StatsPlugin | 插件能力实现；行为入口：activate | 9 | 2 |
| src/plugins/stats/StatsPresenter.ts | plugins | StatsPresenter | 插件能力实现；行为入口：format | 15 | 5 |
