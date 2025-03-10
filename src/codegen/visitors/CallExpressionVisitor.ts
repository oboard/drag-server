import { BaseNode, NodeTypeEnum } from '../../types';
import { CodeGeneratorContext, ExpressionVisitor } from '../types';
import * as babel from '@babel/core';

export class CallExpressionVisitor implements ExpressionVisitor {
    protected t: typeof babel.types;

    constructor() {
        this.t = babel.types;
    }

    buildCallExpression(nodeId: string, context: CodeGeneratorContext): babel.types.Expression {
        const node = context.nodes.find(n => n.id === nodeId);

        if (!node) {
            return this.t.identifier("undefined");
        }

        // 根据节点类型生成基础调用
        const visitors = {
            [NodeTypeEnum.TEXT]: this.visitText.bind(this),
            [NodeTypeEnum.LOG]: this.visitLog.bind(this),
            [NodeTypeEnum.JSON]: this.visitJSON.bind(this),
            [NodeTypeEnum.ROUTER]: this.visitRouter.bind(this),
            [NodeTypeEnum.PORT]: this.visitPort.bind(this)
        };

        let expr: babel.types.Expression = visitors[node.type](node, context);

        // 获取节点的所有输入连接
        const nodeInputs = context.connections
            .filter(c => c.targetNodeId === nodeId)
            .sort((a, b) => {
                // 确保按照输入ID的顺序排序
                const inputOrder: Record<string, number> = {
                    "value": 0,
                    "path": 1,
                    "port": 2
                };
                return (inputOrder[a.targetInputId] || 999) - (inputOrder[b.targetInputId] || 999);
            });

        // 为每个输入创建函数调用
        for (const conn of nodeInputs) {
            const sourceExpr = this.buildCallExpression(conn.sourceNodeId, context);
            expr = this.t.callExpression(expr, [sourceExpr]);
        }

        return expr;
    }

    visitText(node: BaseNode, _context: CodeGeneratorContext): babel.types.Expression {
        return this.t.identifier(`text_${node.id}`);
    }

    visitLog(node: BaseNode, _context: CodeGeneratorContext): babel.types.Expression {
        return this.t.callExpression(
            this.t.identifier(`log_${node.id}`),
            []
        );
    }

    visitJSON(node: BaseNode, _context: CodeGeneratorContext): babel.types.Expression {
        return this.t.identifier(`json_${node.id}`);
    }

    visitRouter(node: BaseNode, _context: CodeGeneratorContext): babel.types.Expression {
        return this.t.callExpression(
            this.t.identifier(`router_${node.id}`),
            []
        );
    }

    visitPort(node: BaseNode, _context: CodeGeneratorContext): babel.types.Expression {
        return this.t.callExpression(
            this.t.identifier(`port_${node.id}`),
            []
        );
    }

    protected getPropertyValue(node: BaseNode, propertyId: string, defaultValue: string | number, context: CodeGeneratorContext): string | number {
        return context.properties[node.id]?.[propertyId] || (() => defaultValue)();
    }
} 