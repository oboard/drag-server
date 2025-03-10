import { CodeGenerator, CodeGeneratorContext } from './types';
import { NodeTypeEnum } from '../types';
import { NodeFunctionVisitor } from './visitors/NodeFunctionVisitor';
import { CallExpressionVisitor } from './visitors/CallExpressionVisitor';
import * as parser from '@babel/parser';
import * as babel from '@babel/core';
import generate from '@babel/generator';

export class DefaultCodeGenerator implements CodeGenerator {
    private functionVisitor: NodeFunctionVisitor;
    private callExpressionVisitor: CallExpressionVisitor;
    private t: typeof babel.types;

    constructor() {
        this.functionVisitor = new NodeFunctionVisitor();
        this.callExpressionVisitor = new CallExpressionVisitor();
        this.t = babel.types;
    }

    generate(context: CodeGeneratorContext): string {
        try {
            // 创建AST根节点
            const ast = parser.parse('', {
                sourceType: 'script',
                plugins: ['jsx']
            });

            // 添加严格模式指令
            ast.program.directives.push(
                this.t.directive(this.t.directiveLiteral("use strict"))
            );

            // 收集所有要添加的AST节点
            const bodyNodes: babel.types.Statement[] = [];

            // 1. 添加require语句
            bodyNodes.push(
                this.t.variableDeclaration("const", [
                    this.t.variableDeclarator(
                        this.t.identifier("http"),
                        this.t.callExpression(this.t.identifier("require"), [this.t.stringLiteral("http")])
                    )
                ])
            );

            bodyNodes.push(
                this.t.variableDeclaration("const", [
                    this.t.variableDeclarator(
                        this.t.identifier("url"),
                        this.t.callExpression(this.t.identifier("require"), [this.t.stringLiteral("url")])
                    )
                ])
            );

            // 添加类型定义和工具函数
            bodyNodes.push(
                this.t.variableDeclaration("const", [
                    this.t.variableDeclarator(
                        this.t.identifier("routes"),
                        this.t.newExpression(this.t.identifier("Map"), [])
                    )
                ])
            );

            // 添加错误处理函数
            bodyNodes.push(
                this.t.functionDeclaration(
                    this.t.identifier("handleError"),
                    [this.t.identifier("err"), this.t.identifier("res")],
                    this.t.blockStatement([
                        this.t.expressionStatement(
                            this.t.callExpression(
                                this.t.memberExpression(
                                    this.t.identifier("console"),
                                    this.t.identifier("error")
                                ),
                                [this.t.stringLiteral("服务器错误:"), this.t.identifier("err")]
                            )
                        ),
                        this.t.expressionStatement(
                            this.t.callExpression(
                                this.t.memberExpression(
                                    this.t.identifier("res"),
                                    this.t.identifier("writeHead")
                                ),
                                [
                                    this.t.numericLiteral(500),
                                    this.t.objectExpression([
                                        this.t.objectProperty(
                                            this.t.stringLiteral("Content-Type"),
                                            this.t.stringLiteral("text/plain")
                                        )
                                    ])
                                ]
                            )
                        ),
                        this.t.expressionStatement(
                            this.t.callExpression(
                                this.t.memberExpression(
                                    this.t.identifier("res"),
                                    this.t.identifier("end")
                                ),
                                [this.t.stringLiteral("Internal Server Error")]
                            )
                        )
                    ])
                )
            );

            // 2. 生成节点函数
            context.nodes.forEach(node => {
                switch (node.type) {
                    case NodeTypeEnum.JSON:
                        bodyNodes.push(...this.functionVisitor.visitJSON(node, context));
                        break;
                    case NodeTypeEnum.TEXT:
                        bodyNodes.push(...this.functionVisitor.visitText(node, context));
                        break;
                    case NodeTypeEnum.LOG:
                        bodyNodes.push(...this.functionVisitor.visitLog(node, context));
                        break;
                    case NodeTypeEnum.ROUTER:
                        bodyNodes.push(...this.functionVisitor.visitRouter(node, context));
                        break;
                    case NodeTypeEnum.PORT:
                        bodyNodes.push(...this.functionVisitor.visitPort(node, context));
                        break;
                }
            });

            // 3. 找出所有终点节点（PORT类型的节点）
            const portNodes = context.nodes.filter(node => node.type === NodeTypeEnum.PORT);

            if (portNodes.length === 0) {
                throw new Error("没有找到PORT节点");
            }

            // 4. 生成调用表达式语句和服务器管理代码
            bodyNodes.push(
                this.t.variableDeclaration("const", [
                    this.t.variableDeclarator(
                        this.t.identifier("servers"),
                        this.t.arrayExpression([])
                    )
                ])
            );

            // 添加进程退出处理
            bodyNodes.push(
                this.t.expressionStatement(
                    this.t.callExpression(
                        this.t.memberExpression(
                            this.t.identifier("process"),
                            this.t.identifier("on")
                        ),
                        [
                            this.t.stringLiteral("SIGINT"),
                            this.t.arrowFunctionExpression(
                                [],
                                this.t.blockStatement([
                                    this.t.expressionStatement(
                                        this.t.callExpression(
                                            this.t.memberExpression(
                                                this.t.identifier("console"),
                                                this.t.identifier("log")
                                            ),
                                            [this.t.stringLiteral("正在关闭所有服务器...")]
                                        )
                                    ),
                                    this.t.variableDeclaration("let", [
                                        this.t.variableDeclarator(
                                            this.t.identifier("closedCount"),
                                            this.t.numericLiteral(0)
                                        )
                                    ]),
                                    this.t.expressionStatement(
                                        this.t.callExpression(
                                            this.t.memberExpression(
                                                this.t.identifier("servers"),
                                                this.t.identifier("forEach")
                                            ),
                                            [
                                                this.t.arrowFunctionExpression(
                                                    [this.t.identifier("server")],
                                                    this.t.blockStatement([
                                                        this.t.expressionStatement(
                                                            this.t.callExpression(
                                                                this.t.memberExpression(
                                                                    this.t.identifier("server"),
                                                                    this.t.identifier("close")
                                                                ),
                                                                [
                                                                    this.t.arrowFunctionExpression(
                                                                        [],
                                                                        this.t.blockStatement([
                                                                            this.t.expressionStatement(
                                                                                this.t.updateExpression(
                                                                                    "++",
                                                                                    this.t.identifier("closedCount"),
                                                                                    false
                                                                                )
                                                                            ),
                                                                            this.t.ifStatement(
                                                                                this.t.binaryExpression(
                                                                                    "===",
                                                                                    this.t.identifier("closedCount"),
                                                                                    this.t.memberExpression(
                                                                                        this.t.identifier("servers"),
                                                                                        this.t.identifier("length")
                                                                                    )
                                                                                ),
                                                                                this.t.blockStatement([
                                                                                    this.t.expressionStatement(
                                                                                        this.t.callExpression(
                                                                                            this.t.memberExpression(
                                                                                                this.t.identifier("console"),
                                                                                                this.t.identifier("log")
                                                                                            ),
                                                                                            [this.t.stringLiteral("所有服务器已关闭")]
                                                                                        )
                                                                                    ),
                                                                                    this.t.expressionStatement(
                                                                                        this.t.callExpression(
                                                                                            this.t.memberExpression(
                                                                                                this.t.identifier("process"),
                                                                                                this.t.identifier("exit")
                                                                                            ),
                                                                                            [this.t.numericLiteral(0)]
                                                                                        )
                                                                                    )
                                                                                ])
                                                                            )
                                                                        ])
                                                                    )
                                                                ]
                                                            )
                                                        )
                                                    ])
                                                )
                                            ]
                                        )
                                    )
                                ])
                            )
                        ]
                    )
                )
            );

            // 生成主调用链
            portNodes.forEach(portNode => {
                const expression = this.callExpressionVisitor.buildCallExpression(portNode.id, context);
                bodyNodes.push(
                    this.t.expressionStatement(
                        this.t.callExpression(
                            this.t.memberExpression(
                                this.t.identifier("servers"),
                                this.t.identifier("push")
                            ),
                            [expression]
                        )
                    )
                );
            });

            // 将生成的节点添加到AST主体
            ast.program.body = bodyNodes;

            // 生成代码
            const output = generate(ast, {
                comments: true,
                compact: false,
                jsescOption: {
                    minimal: true
                }
            }, '');

            return output.code || '';
        } catch (err) {
            console.error('代码生成错误:', err);
            throw err;
        }
    }
} 