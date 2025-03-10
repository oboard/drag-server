import { BaseNodeVisitor } from './BaseNodeVisitor';
import { BaseNode } from '../../types';
import { CodeGeneratorContext } from '../types';
import * as babel from '@babel/core';

export class NodeFunctionVisitor extends BaseNodeVisitor {
    visitText(node: BaseNode, _context: CodeGeneratorContext): babel.types.Statement[] {
        return [
            this.t.variableDeclaration("const", [
                this.t.variableDeclarator(
                    this.t.identifier(`text_${node.id}`),
                    this.t.templateLiteral(
                        [this.t.templateElement({ raw: node.content }, true)],
                        []
                    )
                )
            ])
        ];
    }

    visitLog(node: BaseNode, _context: CodeGeneratorContext): babel.types.Statement[] {
        return [
            this.t.functionDeclaration(
                this.t.identifier(`log_${node.id}`),
                [],
                this.t.blockStatement([
                    this.t.returnStatement(
                        this.t.arrowFunctionExpression(
                            [this.t.identifier("value")],
                            this.t.blockStatement([
                                this.t.expressionStatement(
                                    this.t.callExpression(
                                        this.t.memberExpression(
                                            this.t.identifier("console"),
                                            this.t.identifier("log")
                                        ),
                                        [this.t.identifier("value")]
                                    )
                                ),
                                this.t.returnStatement(this.t.identifier("value"))
                            ])
                        )
                    )
                ])
            )
        ];
    }

    visitJSON(node: BaseNode, _context: CodeGeneratorContext): babel.types.Statement[] {
        let jsonContent: Record<string, string | number | null>;
        try {
            jsonContent = JSON.parse(node.content || "{}");
        } catch (err) {
            jsonContent = {};
        }

        return [
            this.t.variableDeclaration("const", [
                this.t.variableDeclarator(
                    this.t.identifier(`json_${node.id}`),
                    this.t.objectExpression(
                        Object.entries(jsonContent).map(([key, value]) =>
                            this.t.objectProperty(
                                this.t.stringLiteral(key),
                                typeof value === 'string'
                                    ? this.t.stringLiteral(value)
                                    : typeof value === 'number'
                                        ? this.t.numericLiteral(value)
                                        : this.t.nullLiteral()
                            )
                        )
                    )
                )
            ])
        ];
    }

    visitRouter(node: BaseNode, context: CodeGeneratorContext): babel.types.Statement[] {
        const defaultPath = String(this.getPropertyValue(node, "path", "/", context));

        return [
            this.t.functionDeclaration(
                this.t.identifier(`router_${node.id}`),
                [],
                this.t.blockStatement([
                    this.t.returnStatement(
                        this.t.functionExpression(
                            null,
                            [this.t.identifier("value")],
                            this.t.blockStatement([
                                this.t.expressionStatement(
                                    this.t.callExpression(
                                        this.t.memberExpression(
                                            this.t.identifier("routes"),
                                            this.t.identifier("set")
                                        ),
                                        [
                                            this.t.stringLiteral(defaultPath),
                                            this.t.arrowFunctionExpression(
                                                [this.t.identifier("req"), this.t.identifier("res")],
                                                this.t.blockStatement([
                                                    this.t.variableDeclaration("const", [
                                                        this.t.variableDeclarator(
                                                            this.t.identifier("contentType"),
                                                            this.t.conditionalExpression(
                                                                this.t.binaryExpression(
                                                                    "===",
                                                                    this.t.unaryExpression(
                                                                        "typeof",
                                                                        this.t.identifier("value")
                                                                    ),
                                                                    this.t.stringLiteral("string")
                                                                ),
                                                                this.t.stringLiteral("text/plain"),
                                                                this.t.stringLiteral("application/json")
                                                            )
                                                        )
                                                    ]),
                                                    this.t.expressionStatement(
                                                        this.t.callExpression(
                                                            this.t.memberExpression(
                                                                this.t.identifier("res"),
                                                                this.t.identifier("writeHead")
                                                            ),
                                                            [
                                                                this.t.numericLiteral(200),
                                                                this.t.objectExpression([
                                                                    this.t.objectProperty(
                                                                        this.t.stringLiteral("Content-Type"),
                                                                        this.t.identifier("contentType")
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
                                                            [
                                                                this.t.conditionalExpression(
                                                                    this.t.binaryExpression(
                                                                        "===",
                                                                        this.t.unaryExpression(
                                                                            "typeof",
                                                                            this.t.identifier("value")
                                                                        ),
                                                                        this.t.stringLiteral("string")
                                                                    ),
                                                                    this.t.identifier("value"),
                                                                    this.t.callExpression(
                                                                        this.t.memberExpression(
                                                                            this.t.identifier("JSON"),
                                                                            this.t.identifier("stringify")
                                                                        ),
                                                                        [this.t.identifier("value")]
                                                                    )
                                                                )
                                                            ]
                                                        )
                                                    )
                                                ])
                                            )
                                        ]
                                    )
                                ),
                                this.t.returnStatement(this.t.identifier("value"))
                            ])
                        )
                    )
                ])
            )
        ];
    }

    visitPort(node: BaseNode, context: CodeGeneratorContext): babel.types.Statement[] {
        const defaultPort = Number(this.getPropertyValue(node, "port", 3000, context));

        return [
            this.t.functionDeclaration(
                this.t.identifier(`port_${node.id}`),
                [],
                this.t.blockStatement([
                    this.t.returnStatement(
                        this.t.arrowFunctionExpression(
                            [this.t.identifier("value")],
                            this.t.blockStatement([
                                this.t.variableDeclaration("const", [
                                    this.t.variableDeclarator(
                                        this.t.identifier("server"),
                                        this.t.callExpression(
                                            this.t.memberExpression(
                                                this.t.identifier("http"),
                                                this.t.identifier("createServer")
                                            ),
                                            [
                                                this.t.arrowFunctionExpression(
                                                    [this.t.identifier("req"), this.t.identifier("res")],
                                                    this.t.blockStatement([
                                                        this.t.tryStatement(
                                                            this.t.blockStatement([
                                                                this.t.variableDeclaration("const", [
                                                                    this.t.variableDeclarator(
                                                                        this.t.identifier("parsedUrl"),
                                                                        this.t.callExpression(
                                                                            this.t.memberExpression(
                                                                                this.t.identifier("url"),
                                                                                this.t.identifier("parse")
                                                                            ),
                                                                            [
                                                                                this.t.logicalExpression(
                                                                                    "||",
                                                                                    this.t.memberExpression(
                                                                                        this.t.identifier("req"),
                                                                                        this.t.identifier("url")
                                                                                    ),
                                                                                    this.t.stringLiteral("/")
                                                                                ),
                                                                                this.t.booleanLiteral(true)
                                                                            ]
                                                                        )
                                                                    )
                                                                ]),
                                                                this.t.variableDeclaration("const", [
                                                                    this.t.variableDeclarator(
                                                                        this.t.identifier("pathname"),
                                                                        this.t.logicalExpression(
                                                                            "||",
                                                                            this.t.memberExpression(
                                                                                this.t.identifier("parsedUrl"),
                                                                                this.t.identifier("pathname")
                                                                            ),
                                                                            this.t.stringLiteral("/")
                                                                        )
                                                                    )
                                                                ]),
                                                                this.t.ifStatement(
                                                                    this.t.callExpression(
                                                                        this.t.memberExpression(
                                                                            this.t.identifier("routes"),
                                                                            this.t.identifier("has")
                                                                        ),
                                                                        [this.t.identifier("pathname")]
                                                                    ),
                                                                    this.t.blockStatement([
                                                                        this.t.variableDeclaration("const", [
                                                                            this.t.variableDeclarator(
                                                                                this.t.identifier("routeHandler"),
                                                                                this.t.callExpression(
                                                                                    this.t.memberExpression(
                                                                                        this.t.identifier("routes"),
                                                                                        this.t.identifier("get")
                                                                                    ),
                                                                                    [this.t.identifier("pathname")]
                                                                                )
                                                                            )
                                                                        ]),
                                                                        this.t.expressionStatement(
                                                                            this.t.callExpression(
                                                                                this.t.identifier("routeHandler"),
                                                                                [
                                                                                    this.t.identifier("req"),
                                                                                    this.t.identifier("res")
                                                                                ]
                                                                            )
                                                                        )
                                                                    ]),
                                                                    this.t.blockStatement([
                                                                        this.t.expressionStatement(
                                                                            this.t.callExpression(
                                                                                this.t.memberExpression(
                                                                                    this.t.identifier("res"),
                                                                                    this.t.identifier("writeHead")
                                                                                ),
                                                                                [
                                                                                    this.t.numericLiteral(404),
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
                                                                                [this.t.stringLiteral("Not Found")]
                                                                            )
                                                                        )
                                                                    ])
                                                                )
                                                            ]),
                                                            this.t.catchClause(
                                                                this.t.identifier("err"),
                                                                this.t.blockStatement([
                                                                    this.t.expressionStatement(
                                                                        this.t.callExpression(
                                                                            this.t.identifier("handleError"),
                                                                            [
                                                                                this.t.identifier("err"),
                                                                                this.t.identifier("res")
                                                                            ]
                                                                        )
                                                                    )
                                                                ])
                                                            )
                                                        )
                                                    ])
                                                )
                                            ]
                                        )
                                    )
                                ]),
                                this.t.expressionStatement(
                                    this.t.callExpression(
                                        this.t.memberExpression(
                                            this.t.identifier("server"),
                                            this.t.identifier("listen")
                                        ),
                                        [
                                            this.t.numericLiteral(defaultPort),
                                            this.t.arrowFunctionExpression(
                                                [],
                                                this.t.blockStatement([
                                                    this.t.expressionStatement(
                                                        this.t.callExpression(
                                                            this.t.memberExpression(
                                                                this.t.identifier("console"),
                                                                this.t.identifier("log")
                                                            ),
                                                            [
                                                                this.t.templateLiteral(
                                                                    [
                                                                        this.t.templateElement({ raw: "服务器运行在 http://localhost:" }, false),
                                                                        this.t.templateElement({ raw: "" }, true)
                                                                    ],
                                                                    [this.t.numericLiteral(defaultPort)]
                                                                )
                                                            ]
                                                        )
                                                    )
                                                ])
                                            )
                                        ]
                                    )
                                ),
                                this.t.returnStatement(this.t.identifier("server"))
                            ])
                        )
                    )
                ])
            )
        ];
    }
} 