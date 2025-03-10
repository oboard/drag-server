import { BaseNode, Connection } from '../types';
import * as babel from '@babel/core';

export interface CodeGeneratorContext {
    nodes: BaseNode[];
    connections: Connection[];
    properties: Record<string, Record<string, string | number>>;
}

export interface StatementVisitor {
    visitText(node: BaseNode, context: CodeGeneratorContext): babel.types.Statement[];
    visitLog(node: BaseNode, context: CodeGeneratorContext): babel.types.Statement[];
    visitRouter(node: BaseNode, context: CodeGeneratorContext): babel.types.Statement[];
    visitPort(node: BaseNode, context: CodeGeneratorContext): babel.types.Statement[];
    visitJSON(node: BaseNode, context: CodeGeneratorContext): babel.types.Statement[];
}

export interface ExpressionVisitor {
    visitText(node: BaseNode, context: CodeGeneratorContext): babel.types.Expression;
    visitLog(node: BaseNode, context: CodeGeneratorContext): babel.types.Expression;
    visitRouter(node: BaseNode, context: CodeGeneratorContext): babel.types.Expression;
    visitPort(node: BaseNode, context: CodeGeneratorContext): babel.types.Expression;
    visitJSON(node: BaseNode, context: CodeGeneratorContext): babel.types.Expression;
}

export interface CodeGenerator {
    generate(context: CodeGeneratorContext): string;
} 