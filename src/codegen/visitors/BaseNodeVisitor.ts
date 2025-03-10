import { StatementVisitor, CodeGeneratorContext } from '../types';
import { BaseNode } from '../../types';
import * as babel from '@babel/core';

export abstract class BaseNodeVisitor implements StatementVisitor {
    protected t: typeof babel.types;

    constructor() {
        this.t = babel.types;
    }

    visitText(node: BaseNode, context: CodeGeneratorContext): babel.types.Statement[] {
        return [];
    }

    visitLog(node: BaseNode, context: CodeGeneratorContext): babel.types.Statement[] {
        return [];
    }

    visitRouter(node: BaseNode, context: CodeGeneratorContext): babel.types.Statement[] {
        return [];
    }

    visitPort(node: BaseNode, context: CodeGeneratorContext): babel.types.Statement[] {
        return [];
    }

    visitJSON(node: BaseNode, context: CodeGeneratorContext): babel.types.Statement[] {
        return [];
    }

    protected getSourceNodeId(targetNodeId: string, context: CodeGeneratorContext): string {
        const connection = context.connections.find(c => c.targetNodeId === targetNodeId);
        return connection ? connection.sourceNodeId : "";
    }

    protected getInputValue(node: BaseNode, inputId: string, context: CodeGeneratorContext): string {
        const nodeInputs = context.connections.filter(c => c.targetNodeId === node.id);
        const input = nodeInputs.find(c => c.targetInputId === inputId);
        return input ? input.sourceNodeId : "";
    }

    protected getPropertyValue(node: BaseNode, propertyId: string, defaultValue: string | number, context: CodeGeneratorContext): string | number {
        return context.properties[node.id]?.[propertyId] || defaultValue;
    }
} 