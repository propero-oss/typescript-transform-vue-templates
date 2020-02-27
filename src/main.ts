import { visitorMap } from "src/visitor-map";
import { Node, TransformerFactory, Visitor, visitEachChild, visitNode } from "typescript";

export function transformer<T extends Node>(): TransformerFactory<T> {
  return context => {
    const visit: Visitor = node => {
      const next = (it?: Node) => visitEachChild(it || node, visit, context);
      if (visitorMap[node.kind]) return visitorMap[node.kind]!(node as any, next, context);
      return next();
    };
    return node => visitNode(node, visit);
  };
}

export default transformer;
