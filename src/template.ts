import { createSourceFile, ScriptTarget, ExpressionStatement, Statement, Expression, createBlock, VariableStatement, ScriptKind } from "typescript";

export function stmt(source: string) {
  const sourceFile = createSourceFile("", source, ScriptTarget.Latest, true, ScriptKind.TS);
  return {
    statements: <T extends Statement = Statement>() => (sourceFile.statements as any) as T[],
    statement: <T extends Statement = Statement>() => sourceFile.statements[0] as T,
    expression: <T extends Expression = Expression>() => (sourceFile.statements[0] as ExpressionStatement).expression as T,
    block: (multiline?: boolean) => createBlock(sourceFile.statements, sourceFile.statements.length > 1 || multiline)
  };
}

export function expr(source: string, scriptKind?: ScriptKind) {
  const sourceFile = createSourceFile("", `const x = ${source}`, ScriptTarget.Latest, true, scriptKind || ScriptKind.TS);
  return {
    expression: <T extends Expression = Expression>() =>
      (sourceFile.statements[0] as VariableStatement).declarationList.declarations[0].initializer as T
  };
}
