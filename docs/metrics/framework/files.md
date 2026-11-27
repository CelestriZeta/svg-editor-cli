# Git 历史生成的文件清单与职责

目标 50ba8525f6b628b9edeb1a7f13f4848abe011bd4；基线 de07b3600de23e1283a4ba1b9e6f48700e04aab3。职责是目录角色与实际类名索引，详细行为见实验报告。

| 文件 | 分类 | 类 | 职责 | 行数 | 圈复杂度 |
|---|---|---|---|---:|---:|
| extensions/svg-tools/src/SvgDocumentSymbolProvider.ts | vscode | SvgDocumentSymbolProvider | 独立 VSCode 插件实践 | 45 | 6 |
| extensions/svg-tools/src/SvgFileDecorationProvider.ts | vscode | SvgFileDecorationProvider | 独立 VSCode 插件实践 | 37 | 10 |
| extensions/svg-tools/src/extension.ts | vscode |  | 独立 VSCode 插件实践 | 16 | 1 |
| extensions/svg-tools/src/outline/SvgOutlineElement.ts | vscode | SvgOutlineElement | 独立 VSCode 插件实践 | 41 | 8 |
| extensions/svg-tools/src/outline/SvgOutlineParser.ts | vscode | SvgOutlineParser | 独立 VSCode 插件实践 | 56 | 13 |
| src/application/CommandDispatcher.ts | kernel | CommandDispatcher | 领域、应用或 IO/CLI 适配（依所在目录） | 30 | 7 |
| src/application/CommandExecutor.ts | kernel | CommandExecutor | 领域、应用或 IO/CLI 适配（依所在目录） | 52 | 13 |
| src/application/CommandHistory.ts | kernel | CommandHistory | 领域、应用或 IO/CLI 适配（依所在目录） | 83 | 18 |
| src/application/DocumentCheckpoints.ts | kernel | DocumentCheckpoints | 领域、应用或 IO/CLI 适配（依所在目录） | 28 | 8 |
| src/application/DocumentService.ts | kernel | DocumentService | 领域、应用或 IO/CLI 适配（依所在目录） | 79 | 15 |
| src/application/EditorSession.ts | kernel | EditorSession | 领域、应用或 IO/CLI 适配（依所在目录） | 33 | 6 |
| src/application/commands/EditChangeSetCommand.ts | kernel | EditChangeSetCommand | 领域、应用或 IO/CLI 适配（依所在目录） | 71 | 13 |
| src/application/commands/InvalidCommand.ts | kernel | InvalidCommand | 领域、应用或 IO/CLI 适配（依所在目录） | 14 | 2 |
| src/application/commands/contracts/Command.ts | kernel | Command | 领域、应用或 IO/CLI 适配（依所在目录） | 17 | 3 |
| src/application/commands/contracts/CommandCategory.ts | kernel |  | 领域、应用或 IO/CLI 适配（依所在目录） | 6 | 0 |
| src/application/commands/contracts/CommandPresenter.ts | kernel |  | 领域、应用或 IO/CLI 适配（依所在目录） | 4 | 0 |
| src/application/commands/contracts/CommandResult.ts | kernel | CommandResult | 领域、应用或 IO/CLI 适配（依所在目录） | 7 | 0 |
| src/application/commands/contracts/CommandResultVisitor.ts | kernel |  | 领域、应用或 IO/CLI 适配（依所在目录） | 43 | 0 |
| src/application/commands/contracts/HistoryController.ts | kernel |  | 领域、应用或 IO/CLI 适配（依所在目录） | 6 | 0 |
| src/application/commands/contracts/ReorderDirection.ts | kernel |  | 领域、应用或 IO/CLI 适配（依所在目录） | 4 | 0 |
| src/application/commands/contracts/UndoableCommand.ts | kernel | UndoableCommand | 领域、应用或 IO/CLI 适配（依所在目录） | 17 | 2 |
| src/application/commands/results/AssignedShapeId.ts | kernel | AssignedShapeId | 领域、应用或 IO/CLI 适配（依所在目录） | 17 | 3 |
| src/application/commands/results/CanvasCreatedResult.ts | kernel | CanvasCreatedResult | 领域、应用或 IO/CLI 适配（依所在目录） | 25 | 4 |
| src/application/commands/results/CanvasResizedResult.ts | kernel | CanvasResizedResult | 领域、应用或 IO/CLI 适配（依所在目录） | 25 | 4 |
| src/application/commands/results/CanvasResult.ts | kernel | CanvasResult | 领域、应用或 IO/CLI 适配（依所在目录） | 25 | 4 |
| src/application/commands/results/DocumentReadResult.ts | kernel | DocumentReadResult | 领域、应用或 IO/CLI 适配（依所在目录） | 33 | 5 |
| src/application/commands/results/DocumentSavedResult.ts | kernel | DocumentSavedResult | 领域、应用或 IO/CLI 适配（依所在目录） | 25 | 4 |
| src/application/commands/results/EditDirection.ts | kernel |  | 领域、应用或 IO/CLI 适配（依所在目录） | 5 | 0 |
| src/application/commands/results/ErrorResult.ts | kernel | ErrorResult | 领域、应用或 IO/CLI 适配（依所在目录） | 25 | 4 |
| src/application/commands/results/GroupCreatedResult.ts | kernel | GroupCreatedResult | 领域、应用或 IO/CLI 适配（依所在目录） | 21 | 3 |
| src/application/commands/results/HelpResult.ts | kernel | HelpResult | 领域、应用或 IO/CLI 适配（依所在目录） | 20 | 3 |
| src/application/commands/results/PresentedCommandResult.ts | kernel | PresentedCommandResult | 领域、应用或 IO/CLI 适配（依所在目录） | 31 | 5 |
| src/application/commands/results/ShapeAttributeSetResult.ts | kernel | ShapeAttributeSetResult | 领域、应用或 IO/CLI 适配（依所在目录） | 28 | 4 |
| src/application/commands/results/ShapeAttributeSnapshot.ts | kernel | ShapeAttributeSnapshot | 领域、应用或 IO/CLI 适配（依所在目录） | 61 | 11 |
| src/application/commands/results/ShapeCreatedResult.ts | kernel | ShapeCreatedResult | 领域、应用或 IO/CLI 适配（依所在目录） | 22 | 3 |
| src/application/commands/results/ShapeDeletedResult.ts | kernel | ShapeDeletedResult | 领域、应用或 IO/CLI 适配（依所在目录） | 22 | 3 |
| src/application/commands/results/ShapeDetailsResult.ts | kernel | ShapeDetailsResult | 领域、应用或 IO/CLI 适配（依所在目录） | 21 | 3 |
| src/application/commands/results/ShapeMovedIntoContainerResult.ts | kernel | ShapeMovedIntoContainerResult | 领域、应用或 IO/CLI 适配（依所在目录） | 23 | 3 |
| src/application/commands/results/ShapeMovedResult.ts | kernel | ShapeMovedResult | 领域、应用或 IO/CLI 适配（依所在目录） | 34 | 5 |
| src/application/commands/results/ShapeReorderedResult.ts | kernel | ShapeReorderedResult | 领域、应用或 IO/CLI 适配（依所在目录） | 24 | 3 |
| src/application/commands/results/ShapeScaledResult.ts | kernel | ShapeScaledResult | 领域、应用或 IO/CLI 适配（依所在目录） | 29 | 4 |
| src/application/commands/results/StructureChangedResult.ts | kernel | StructureChangedResult | 领域、应用或 IO/CLI 适配（依所在目录） | 31 | 5 |
| src/application/commands/results/TreeResult.ts | kernel | TreeResult | 领域、应用或 IO/CLI 适配（依所在目录） | 21 | 3 |
| src/application/commands/results/TreeSubtreeResult.ts | kernel | TreeSubtreeResult | 领域、应用或 IO/CLI 适配（依所在目录） | 21 | 3 |
| src/application/commands/results/UngroupedResult.ts | kernel | UngroupedResult | 领域、应用或 IO/CLI 适配（依所在目录） | 26 | 4 |
| src/application/commands/support/CommandDocumentBinding.ts | kernel | CommandDocumentBinding | 领域、应用或 IO/CLI 适配（依所在目录） | 21 | 3 |
| src/application/commands/support/CommandExecutionGuard.ts | kernel | CommandExecutionGuard | 领域、应用或 IO/CLI 适配（依所在目录） | 24 | 5 |
| src/application/commands/support/CommandNumberParser.ts | kernel | CommandNumberParser | 领域、应用或 IO/CLI 适配（依所在目录） | 22 | 6 |
| src/application/extensions/AttributeCatalog.ts | kernel |  | 领域、应用或 IO/CLI 适配（依所在目录） | 5 | 0 |
| src/application/extensions/AttributeEditContext.ts | kernel |  | 领域、应用或 IO/CLI 适配（依所在目录） | 10 | 0 |
| src/application/extensions/AttributeHandler.ts | kernel |  | 领域、应用或 IO/CLI 适配（依所在目录） | 18 | 0 |
| src/application/extensions/AttributeResolver.ts | kernel | AttributeResolver | 领域、应用或 IO/CLI 适配（依所在目录） | 23 | 12 |
| src/application/extensions/CommandCatalog.ts | kernel |  | 领域、应用或 IO/CLI 适配（依所在目录） | 7 | 0 |
| src/application/extensions/CommandContribution.ts | kernel |  | 领域、应用或 IO/CLI 适配（依所在目录） | 9 | 0 |
| src/application/extensions/DecoratorCatalog.ts | kernel |  | 领域、应用或 IO/CLI 适配（依所在目录） | 5 | 0 |
| src/application/extensions/ExtensionRegistry.ts | kernel | ExtensionRegistry | 领域、应用或 IO/CLI 适配（依所在目录） | 52 | 11 |
| src/application/extensions/Plugin.ts | kernel |  | 领域、应用或 IO/CLI 适配（依所在目录） | 5 | 0 |
| src/application/extensions/PluginActivationError.ts | kernel | PluginActivationError | 领域、应用或 IO/CLI 适配（依所在目录） | 7 | 2 |
| src/application/extensions/PluginContext.ts | kernel |  | 领域、应用或 IO/CLI 适配（依所在目录） | 12 | 0 |
| src/application/extensions/PluginContributions.ts | kernel | PluginContributions | 领域、应用或 IO/CLI 适配（依所在目录） | 76 | 19 |
| src/application/extensions/PluginManifest.ts | kernel | PluginManifest | 领域、应用或 IO/CLI 适配（依所在目录） | 26 | 20 |
| src/application/extensions/PluginRegistration.ts | kernel | PluginRegistration | 领域、应用或 IO/CLI 适配（依所在目录） | 59 | 18 |
| src/application/extensions/PluginRegistrationError.ts | kernel | PluginRegistrationError | 领域、应用或 IO/CLI 适配（依所在目录） | 7 | 1 |
| src/application/extensions/PluginRegistry.ts | kernel | PluginRegistry | 领域、应用或 IO/CLI 适配（依所在目录） | 80 | 18 |
| src/application/extensions/PluginServices.ts | kernel |  | 领域、应用或 IO/CLI 适配（依所在目录） | 11 | 0 |
| src/application/extensions/PreparedAttributeEdit.ts | kernel |  | 领域、应用或 IO/CLI 适配（依所在目录） | 9 | 0 |
| src/application/extensions/ShapeCatalog.ts | kernel |  | 领域、应用或 IO/CLI 适配（依所在目录） | 6 | 0 |
| src/application/extensions/ShapeProvider.ts | kernel |  | 领域、应用或 IO/CLI 适配（依所在目录） | 20 | 0 |
| src/application/extensions/TreeDecorator.ts | kernel |  | 领域、应用或 IO/CLI 适配（依所在目录） | 8 | 0 |
| src/application/extensions/TreeLineContext.ts | kernel | TreeLineContext | 领域、应用或 IO/CLI 适配（依所在目录） | 20 | 3 |
| src/application/ports/ActiveDocument.ts | kernel |  | 领域、应用或 IO/CLI 适配（依所在目录） | 5 | 0 |
| src/application/ports/CheckpointSource.ts | kernel |  | 领域、应用或 IO/CLI 适配（依所在目录） | 5 | 0 |
| src/application/ports/DirectoryAccess.ts | kernel |  | 领域、应用或 IO/CLI 适配（依所在目录） | 6 | 0 |
| src/application/ports/DirectoryEntry.ts | kernel | DirectoryEntry | 领域、应用或 IO/CLI 适配（依所在目录） | 7 | 3 |
| src/application/ports/DocumentOperations.ts | kernel |  | 领域、应用或 IO/CLI 适配（依所在目录） | 12 | 0 |
| src/application/ports/DocumentReadError.ts | kernel | DocumentReadError | 领域、应用或 IO/CLI 适配（依所在目录） | 16 | 3 |
| src/application/ports/DocumentStore.ts | kernel |  | 领域、应用或 IO/CLI 适配（依所在目录） | 7 | 0 |
| src/application/ports/DocumentStoreError.ts | kernel | DocumentStoreError | 领域、应用或 IO/CLI 适配（依所在目录） | 19 | 3 |
| src/application/ports/ImportedShapeId.ts | kernel | ImportedShapeId | 领域、应用或 IO/CLI 适配（依所在目录） | 17 | 3 |
| src/application/ports/LoadedDocument.ts | kernel | LoadedDocument | 领域、应用或 IO/CLI 适配（依所在目录） | 21 | 3 |
| src/application/ports/SvgContentKind.ts | kernel |  | 领域、应用或 IO/CLI 适配（依所在目录） | 5 | 0 |
| src/application/ports/SvgShapeInput.ts | kernel |  | 领域、应用或 IO/CLI 适配（依所在目录） | 10 | 0 |
| src/application/ports/SvgShapeOutput.ts | kernel | SvgShapeOutput | 领域、应用或 IO/CLI 适配（依所在目录） | 33 | 11 |
| src/application/queries/DocumentQuery.ts | kernel |  | 领域、应用或 IO/CLI 适配（依所在目录） | 10 | 0 |
| src/application/queries/DocumentView.ts | kernel | DocumentView | 领域、应用或 IO/CLI 适配（依所在目录） | 29 | 4 |
| src/application/queries/DocumentViewVisitor.ts | kernel | DocumentViewVisitor | 领域、应用或 IO/CLI 适配（依所在目录） | 60 | 14 |
| src/application/queries/GeometrySnapshot.ts | kernel | GeometrySnapshot | 领域、应用或 IO/CLI 适配（依所在目录） | 65 | 10 |
| src/application/queries/ShapeAnchor.ts | kernel | ShapeAnchor | 领域、应用或 IO/CLI 适配（依所在目录） | 16 | 3 |
| src/application/queries/ShapeReference.ts | kernel | ShapeReference | 领域、应用或 IO/CLI 适配（依所在目录） | 17 | 3 |
| src/application/queries/ShapeSnapshot.ts | kernel | ShapeSnapshot | 领域、应用或 IO/CLI 适配（依所在目录） | 61 | 11 |
| src/bootstrap/CodePlugins.ts | assembly | CodePlugins | 宿主启动及插件装配 | 7 | 1 |
| src/bootstrap/Main.ts | assembly | Main | 宿主启动及插件装配 | 76 | 9 |
| src/bootstrap/PluginLoader.ts | assembly | PluginLoader | 宿主启动及插件装配 | 75 | 37 |
| src/bootstrap/entry.ts | assembly |  | 宿主启动及插件装配 | 3 | 0 |
| src/cli/CommandLineParser.ts | kernel | CommandLineParser | 领域、应用或 IO/CLI 适配（依所在目录） | 45 | 10 |
| src/cli/CommandSyntaxError.ts | kernel | CommandSyntaxError | 领域、应用或 IO/CLI 适配（依所在目录） | 6 | 1 |
| src/cli/OutputFormatter.ts | kernel | OutputFormatter | 领域、应用或 IO/CLI 适配（依所在目录） | 200 | 51 |
| src/cli/Repl.ts | kernel | Repl | 领域、应用或 IO/CLI 适配（依所在目录） | 67 | 11 |
| src/cli/ShapeFormatter.ts | kernel | ShapeFormatter | 领域、应用或 IO/CLI 适配（依所在目录） | 43 | 14 |
| src/cli/ShowFormatter.ts | kernel | ShowFormatter | 领域、应用或 IO/CLI 适配（依所在目录） | 21 | 5 |
| src/cli/TreeFormatter.ts | kernel | TreeFormatter | 领域、应用或 IO/CLI 适配（依所在目录） | 43 | 17 |
| src/domain/ChangeSet.ts | kernel |  | 领域、应用或 IO/CLI 适配（依所在目录） | 7 | 0 |
| src/domain/ChangeSetExecutor.ts | kernel | ChangeSetExecutor | 领域、应用或 IO/CLI 适配（依所在目录） | 55 | 13 |
| src/domain/CompositeChangeSet.ts | kernel | CompositeChangeSet | 领域、应用或 IO/CLI 适配（依所在目录） | 26 | 6 |
| src/domain/DomainError.ts | kernel | DomainError | 领域、应用或 IO/CLI 适配（依所在目录） | 6 | 1 |
| src/domain/ShapeFactory.ts | kernel | ShapeFactory | 领域、应用或 IO/CLI 适配（依所在目录） | 23 | 8 |
| src/domain/document/CanvasSize.ts | kernel | CanvasSize | 领域、应用或 IO/CLI 适配（依所在目录） | 30 | 7 |
| src/domain/document/ShapeRelationsBinding.ts | kernel | ShapeRelationsBinding | 领域、应用或 IO/CLI 适配（依所在目录） | 16 | 5 |
| src/domain/document/ShapeStructureCandidate.ts | kernel | ShapeStructureCandidate | 领域、应用或 IO/CLI 适配（依所在目录） | 130 | 49 |
| src/domain/document/ShapeStructureChangeSet.ts | kernel | ShapeStructureChangeSet | 领域、应用或 IO/CLI 适配（依所在目录） | 29 | 6 |
| src/domain/document/ShapeStructurePlanner.ts | kernel | ShapeStructurePlanner | 领域、应用或 IO/CLI 适配（依所在目录） | 248 | 45 |
| src/domain/document/ShapeSubtree.ts | kernel | ShapeSubtree | 领域、应用或 IO/CLI 适配（依所在目录） | 49 | 12 |
| src/domain/document/ShapeTree.ts | kernel | ShapeTree | 领域、应用或 IO/CLI 适配（依所在目录） | 192 | 48 |
| src/domain/document/SvgDocument.ts | kernel | SvgDocument | 领域、应用或 IO/CLI 适配（依所在目录） | 126 | 23 |
| src/domain/shapes/Circle.ts | kernel | Circle | 领域、应用或 IO/CLI 适配（依所在目录） | 121 | 17 |
| src/domain/shapes/ContainerShape.ts | kernel | ContainerShape | 领域、应用或 IO/CLI 适配（依所在目录） | 62 | 11 |
| src/domain/shapes/Ellipse.ts | kernel | Ellipse | 领域、应用或 IO/CLI 适配（依所在目录） | 143 | 21 |
| src/domain/shapes/GeometryChangeSet.ts | kernel | GeometryChangeSet | 领域、应用或 IO/CLI 适配（依所在目录） | 10 | 1 |
| src/domain/shapes/GeometryValueChange.ts | kernel | GeometryValueChange | 领域、应用或 IO/CLI 适配（依所在目录） | 43 | 9 |
| src/domain/shapes/Group.ts | kernel | Group | 领域、应用或 IO/CLI 适配（依所在目录） | 19 | 3 |
| src/domain/shapes/Line.ts | kernel | Line | 领域、应用或 IO/CLI 适配（依所在目录） | 139 | 17 |
| src/domain/shapes/Rect.ts | kernel | Rect | 领域、应用或 IO/CLI 适配（依所在目录） | 143 | 21 |
| src/domain/shapes/Shape.ts | kernel | Shape | 领域、应用或 IO/CLI 适配（依所在目录） | 200 | 46 |
| src/domain/shapes/ShapeAttributeChange.ts | kernel | ShapeAttributeChange | 领域、应用或 IO/CLI 适配（依所在目录） | 23 | 4 |
| src/domain/shapes/ShapeAttributeSlot.ts | kernel | ShapeAttributeSlot | 领域、应用或 IO/CLI 适配（依所在目录） | 94 | 18 |
| src/domain/shapes/ShapeAttributeUpdate.ts | kernel | ShapeAttributeUpdate | 领域、应用或 IO/CLI 适配（依所在目录） | 71 | 11 |
| src/domain/shapes/ShapeAttributeValue.ts | kernel | ShapeAttributeValue | 领域、应用或 IO/CLI 适配（依所在目录） | 102 | 20 |
| src/domain/shapes/ShapeAttributeValueKind.ts | kernel |  | 领域、应用或 IO/CLI 适配（依所在目录） | 4 | 0 |
| src/domain/shapes/ShapeDissolutionChange.ts | kernel | ShapeDissolutionChange | 领域、应用或 IO/CLI 适配（依所在目录） | 102 | 23 |
| src/domain/shapes/ShapeGeometryChange.ts | kernel | ShapeGeometryChange | 领域、应用或 IO/CLI 适配（依所在目录） | 64 | 15 |
| src/domain/shapes/ShapeInsertionChange.ts | kernel | ShapeInsertionChange | 领域、应用或 IO/CLI 适配（依所在目录） | 46 | 7 |
| src/domain/shapes/ShapeLocation.ts | kernel | ShapeLocation | 领域、应用或 IO/CLI 适配（依所在目录） | 24 | 5 |
| src/domain/shapes/ShapeRelations.ts | kernel |  | 领域、应用或 IO/CLI 适配（依所在目录） | 7 | 0 |
| src/domain/shapes/ShapeRelocationChange.ts | kernel | ShapeRelocationChange | 领域、应用或 IO/CLI 适配（依所在目录） | 39 | 5 |
| src/domain/shapes/ShapeRemovalChange.ts | kernel | ShapeRemovalChange | 领域、应用或 IO/CLI 适配（依所在目录） | 34 | 5 |
| src/domain/shapes/ShapeStyle.ts | kernel | ShapeStyle | 领域、应用或 IO/CLI 适配（依所在目录） | 56 | 14 |
| src/domain/shapes/ShapeTreeChange.ts | kernel | ShapeTreeChange | 领域、应用或 IO/CLI 适配（依所在目录） | 11 | 0 |
| src/domain/shapes/Text.ts | kernel | Text | 领域、应用或 IO/CLI 适配（依所在目录） | 116 | 16 |
| src/domain/specs/CircleSpec.ts | kernel | CircleSpec | 领域、应用或 IO/CLI 适配（依所在目录） | 49 | 7 |
| src/domain/specs/EllipseSpec.ts | kernel | EllipseSpec | 领域、应用或 IO/CLI 适配（依所在目录） | 56 | 9 |
| src/domain/specs/GroupSpec.ts | kernel | GroupSpec | 领域、应用或 IO/CLI 适配（依所在目录） | 15 | 2 |
| src/domain/specs/LineSpec.ts | kernel | LineSpec | 领域、应用或 IO/CLI 适配（依所在目录） | 53 | 7 |
| src/domain/specs/RectSpec.ts | kernel | RectSpec | 领域、应用或 IO/CLI 适配（依所在目录） | 54 | 9 |
| src/domain/specs/ShapeSpec.ts | kernel | ShapeSpec | 领域、应用或 IO/CLI 适配（依所在目录） | 33 | 5 |
| src/domain/specs/ShapeSpecWithChildren.ts | kernel | ShapeSpecWithChildren | 领域、应用或 IO/CLI 适配（依所在目录） | 20 | 4 |
| src/domain/specs/TextSpec.ts | kernel | TextSpec | 领域、应用或 IO/CLI 适配（依所在目录） | 49 | 7 |
| src/domain/visitor/ShapeCollector.ts | kernel | ShapeCollector | 领域、应用或 IO/CLI 适配（依所在目录） | 23 | 4 |
| src/domain/visitor/ShapeVisitor.ts | kernel | ShapeVisitor | 领域、应用或 IO/CLI 适配（依所在目录） | 8 | 0 |
| src/infrastructure/DecodedSvgElement.ts | kernel | DecodedSvgElement | 领域、应用或 IO/CLI 适配（依所在目录） | 36 | 6 |
| src/infrastructure/MissingIdAllocator.ts | kernel | MissingIdAllocator | 领域、应用或 IO/CLI 适配（依所在目录） | 33 | 6 |
| src/infrastructure/NodeDirectoryAccess.ts | kernel | NodeDirectoryAccess | 领域、应用或 IO/CLI 适配（依所在目录） | 12 | 3 |
| src/infrastructure/SvgAttributes.ts | kernel | SvgAttributes | 领域、应用或 IO/CLI 适配（依所在目录） | 109 | 31 |
| src/infrastructure/SvgCanvas.ts | kernel | SvgCanvas | 领域、应用或 IO/CLI 适配（依所在目录） | 25 | 4 |
| src/infrastructure/SvgDocumentStore.ts | kernel | SvgDocumentStore | 领域、应用或 IO/CLI 适配（依所在目录） | 42 | 5 |
| src/infrastructure/SvgElement.ts | kernel | SvgElement | 领域、应用或 IO/CLI 适配（依所在目录） | 50 | 18 |
| src/infrastructure/SvgElementFactory.ts | kernel | SvgElementFactory | 领域、应用或 IO/CLI 适配（依所在目录） | 19 | 8 |
| src/infrastructure/SvgReader.ts | kernel | SvgReader | 领域、应用或 IO/CLI 适配（依所在目录） | 30 | 4 |
| src/infrastructure/SvgShapeInputValue.ts | kernel | SvgShapeInputValue | 领域、应用或 IO/CLI 适配（依所在目录） | 33 | 6 |
| src/infrastructure/SvgTreeParser.ts | kernel | SvgTreeParser | 领域、应用或 IO/CLI 适配（依所在目录） | 130 | 27 |
| src/infrastructure/SvgWriteVisitor.ts | kernel | SvgWriteVisitor | 领域、应用或 IO/CLI 适配（依所在目录） | 50 | 23 |
| src/plugins/builtin-commands/BuiltinCommandContribution.ts | plugins | BuiltinCommandContribution | 插件能力实现 | 27 | 5 |
| src/plugins/builtin-commands/BuiltinCommandsPlugin.ts | plugins | BuiltinCommandsPlugin | 插件能力实现 | 179 | 53 |
| src/plugins/builtin-commands/CreateCommandContribution.ts | plugins | CreateCommandContribution | 插件能力实现 | 21 | 4 |
| src/plugins/builtin-commands/commands/AddToCommand.ts | plugins | AddToCommand | 插件能力实现 | 34 | 3 |
| src/plugins/builtin-commands/commands/BackShapeCommand.ts | plugins | BackShapeCommand | 插件能力实现 | 18 | 3 |
| src/plugins/builtin-commands/commands/CreateShapeCommand.ts | plugins | CreateShapeCommand | 插件能力实现 | 31 | 3 |
| src/plugins/builtin-commands/commands/DeleteShapeCommand.ts | plugins | DeleteShapeCommand | 插件能力实现 | 42 | 5 |
| src/plugins/builtin-commands/commands/FrontShapeCommand.ts | plugins | FrontShapeCommand | 插件能力实现 | 18 | 3 |
| src/plugins/builtin-commands/commands/GroupShapesCommand.ts | plugins | GroupShapesCommand | 插件能力实现 | 28 | 3 |
| src/plugins/builtin-commands/commands/HelpCommand.ts | plugins | HelpCommand | 插件能力实现 | 14 | 2 |
| src/plugins/builtin-commands/commands/InitCommand.ts | plugins | InitCommand | 插件能力实现 | 23 | 3 |
| src/plugins/builtin-commands/commands/MoveShapeCommand.ts | plugins | MoveShapeCommand | 插件能力实现 | 52 | 6 |
| src/plugins/builtin-commands/commands/ReadDocumentCommand.ts | plugins | ReadDocumentCommand | 插件能力实现 | 30 | 4 |
| src/plugins/builtin-commands/commands/RedoCommand.ts | plugins | RedoCommand | 插件能力实现 | 15 | 3 |
| src/plugins/builtin-commands/commands/ReorderShapeCommand.ts | plugins | ReorderShapeCommand | 插件能力实现 | 34 | 2 |
| src/plugins/builtin-commands/commands/ResizeCanvasCommand.ts | plugins | ResizeCanvasCommand | 插件能力实现 | 23 | 3 |
| src/plugins/builtin-commands/commands/SaveCommand.ts | plugins | SaveCommand | 插件能力实现 | 23 | 3 |
| src/plugins/builtin-commands/commands/ScaleShapeCommand.ts | plugins | ScaleShapeCommand | 插件能力实现 | 49 | 5 |
| src/plugins/builtin-commands/commands/SetShapeAttributeCommand.ts | plugins | SetShapeAttributeCommand | 插件能力实现 | 65 | 10 |
| src/plugins/builtin-commands/commands/ShowCanvasCommand.ts | plugins | ShowCanvasCommand | 插件能力实现 | 19 | 3 |
| src/plugins/builtin-commands/commands/ShowCommand.ts | plugins | ShowCommand | 插件能力实现 | 24 | 3 |
| src/plugins/builtin-commands/commands/TreeCommand.ts | plugins | TreeCommand | 插件能力实现 | 31 | 4 |
| src/plugins/builtin-commands/commands/UndoCommand.ts | plugins | UndoCommand | 插件能力实现 | 15 | 3 |
| src/plugins/builtin-commands/commands/UngroupShapeCommand.ts | plugins | UngroupShapeCommand | 插件能力实现 | 34 | 3 |
| src/plugins/builtin-commands/factories/CreateShapeCommandFactory.ts | plugins | CreateShapeCommandFactory | 插件能力实现 | 60 | 18 |
| src/plugins/builtin-commands/factories/DocumentCommandFactory.ts | plugins | DocumentCommandFactory | 插件能力实现 | 60 | 12 |
| src/plugins/builtin-commands/factories/ShapeEditCommandFactory.ts | plugins | ShapeEditCommandFactory | 插件能力实现 | 93 | 28 |
| src/plugins/builtin-shapes/BuiltinShapesPlugin.ts | plugins | BuiltinShapesPlugin | 插件能力实现 | 23 | 1 |
| src/plugins/builtin-shapes/CircleShapeProvider.ts | plugins | CircleShapeProvider | 插件能力实现 | 62 | 10 |
| src/plugins/builtin-shapes/EllipseShapeProvider.ts | plugins | EllipseShapeProvider | 插件能力实现 | 63 | 10 |
| src/plugins/builtin-shapes/GroupShapeProvider.ts | plugins | GroupShapeProvider | 插件能力实现 | 47 | 8 |
| src/plugins/builtin-shapes/LineShapeProvider.ts | plugins | LineShapeProvider | 插件能力实现 | 62 | 10 |
| src/plugins/builtin-shapes/RectShapeProvider.ts | plugins | RectShapeProvider | 插件能力实现 | 63 | 10 |
| src/plugins/builtin-shapes/TextShapeProvider.ts | plugins | TextShapeProvider | 插件能力实现 | 58 | 10 |
