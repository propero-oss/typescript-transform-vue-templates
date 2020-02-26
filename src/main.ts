import { visitorMap } from "src/visitor-map";
import { Node, TransformerFactory, Visitor, visitEachChild, visitNode, isDecorator, SyntaxKind } from "typescript";

export function transformer<T extends Node>(): TransformerFactory<T> {
  return context => {
    const visit: Visitor = node => {
      if (visitorMap[node.kind]) return visitorMap[node.kind]!(node as any);
      return visitEachChild(node, child => visit(child), context);
    };
    return node => visitNode(node, visit);
  };
}

export default transformer;
