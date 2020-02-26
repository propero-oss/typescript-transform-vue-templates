import * as t from "@babel/types";
import { NodePath } from "@babel/core";

export const babelTranspileWith = () => {
  function shouldSimpleReplace(it: NodePath<t.Identifier>) {
    const name = it.node.name;
    if (t.isAssignmentExpression(it.parent) && it.key === "left") return true;
    return /^[$_]/g.test(name) && !["$event", "$$v"].includes(name);
  }

  function isRecursiveCall(path: NodePath, parent: NodePath, withName: t.Identifier) {
    if (t.isMemberExpression(parent)) return true;
    if (
      t.isConditionalExpression(path.parentPath) &&
      t.isMemberExpression(path.parentPath.get("alternate")) &&
      (path.parentPath.get("alternate.object") as NodePath).node === withName
    )
      return true;
    return (
      t.isConditionalExpression(path.parentPath.parentPath.parentPath) &&
      t.isMemberExpression(path.parentPath.parentPath.parentPath.get("alternate")) &&
      (path.parentPath.parentPath.parentPath.get("alternate.object") as NodePath).node === withName
    );
  }

  function isVariableDeclaration(path: NodePath, parent: NodePath) {
    if (t.isVariableDeclarator(parent) || t.isObjectPattern(parent.parentPath) || t.isArrayPattern(parent.parentPath)) return true;
    return t.isFunction(parent) && parent.params.includes(path.node as any);
  }

  function shouldProcess(path: NodePath, parent: NodePath, withName: t.Identifier, withExpr: t.Expression) {
    if (isRecursiveCall(path, parent, withName)) return false;
    if (isVariableDeclaration(path, parent)) return false;
    if (["key", "id", "params"].includes(path.key as string)) return false;
    return !(path.node === withName || path.node === withExpr);
  }

  function buildTestExpression(withIdentifier: t.Identifier, otherIdentifier: t.Identifier) {
    const test = t.binaryExpression("!==", t.unaryExpression("typeof", otherIdentifier), t.stringLiteral("undefined"));
    return t.parenthesizedExpression(t.conditionalExpression(test, otherIdentifier, t.memberExpression(withIdentifier, otherIdentifier)));
  }

  return {
    name: "babel-plugin-vue-transform-with",
    visitor: {
      WithStatement(withPath: NodePath<t.WithStatement>) {
        const withExpr = withPath.get("object").node;
        const content = withPath.get("body.body") as NodePath[];
        const withName = t.identifier("_with");
        withPath.insertBefore(t.variableDeclaration("const", [t.variableDeclarator(withName, withExpr)]));
        withPath.get("body").traverse({
          Identifier(path) {
            const parent = path.parentPath;
            if (!shouldProcess(path, parent, withName, withExpr)) return;
            if (shouldSimpleReplace(path)) path.replaceWith(t.memberExpression(withName, path.node));
            else path.replaceWith(buildTestExpression(withName, path.node));
          },
          MemberExpression(path) {
            const objectPath = path.get("object");
            if (!t.isIdentifier(objectPath)) return;
            if (path.get("object").node === withName) return;
            if (shouldSimpleReplace(objectPath as NodePath<t.Identifier>)) path.replaceWith(t.memberExpression(withName, objectPath.node));
            else objectPath.replaceWith(buildTestExpression(withName, objectPath.node as any));
          }
        });
        withPath.replaceWithMultiple(content.map(path => path.node));
      }
    }
  };
};
