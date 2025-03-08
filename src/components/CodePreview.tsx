import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { NodeTypeEnum, PropertyInfo } from '../types/index';

interface CodePreviewProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CodePreview({ isOpen, onClose }: CodePreviewProps) {
    const nodes = useSelector((state: RootState) => state.flow.present.nodes);
    const connections = useSelector((state: RootState) => state.flow.present.connections);
    const properties = useSelector((state: RootState) => state.flow.present.properties);

    // 生成代码
    const generateCode = (): string => {
        // 文本节点函数
        const textNodes = nodes.filter(node => node.type === NodeTypeEnum.TEXT);
        const textNodesFunctions = textNodes.map(node => `
function text_${node.id}() {
  return \`${node.content}\`;
}
`).join('');

        // 日志节点函数
        const logNodes = nodes.filter(node => node.type === NodeTypeEnum.LOG);
        const logNodesFunctions = logNodes.map(node => `
function log_${node.id}(value) {
  console.log(value);
  return value;
}
`).join('');

        // JSON 节点函数
        const jsonNodes = nodes.filter(node => node.type === NodeTypeEnum.JSON);
        const jsonNodesFunctions = jsonNodes.map(node => `
function json_${node.id}() {
  return ${node.content || '{}'};
}
`).join('');

        // 路由节点函数
        const routerNodes = nodes.filter(node => node.type === NodeTypeEnum.ROUTER);
        let routesDeclaration = '';
        let routerNodesFunctions = '';

        // 如果有路由节点，添加路由处理函数
        if (routerNodes.length > 0) {
            routesDeclaration = `
// 路由处理函数
const routes = new Map();
`;

            routerNodesFunctions = routerNodes.map(node => {
                const pathProperty = node.inputs.find((input: PropertyInfo) => input.id === 'path');
                const defaultPath = properties[node.id]?.[pathProperty?.id || ''] || '/';

                return `
function router_${node.id}(props) {
  const path = props.path || '${defaultPath}';
  const value = props.value;
  routes.set(path, (req, res) => {
    const contentType = typeof value === 'string' ? 'text/plain' : 'application/json';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(typeof value === 'string' ? value : JSON.stringify(value));
  });
  return value;
}
`;
            }).join('');
        }

        // 端口节点函数
        const portNodes = nodes.filter(node => node.type === NodeTypeEnum.PORT);
        const portNodesFunctions = portNodes.map(node => {
            const portProperty = node.inputs.find((input: PropertyInfo) => input.id === 'port');
            let defaultPort = 3000;

            // 检查是否有直接设置的端口值
            if (properties[node.id]?.[portProperty?.id || '']) {
                defaultPort = Number(properties[node.id][portProperty?.id || '']) || 3000;
            }

            return `
function port_${node.id}(value, port = ${defaultPort}) {
  // 创建 HTTP 服务器
  const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url || '/', true);
    const pathname = parsedUrl.pathname || '/';

    // 查找匹配的路由
    if (routes.has(pathname)) {
      const routeHandler = routes.get(pathname);
      routeHandler(req, res);
    } else {
      // 默认路由处理
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });

  // 启动服务器
  server.listen(port, () => {
    console.log(\`服务器运行在 http://localhost:\${port}\`);
  });
  return value;
}
`;
        }).join('');

        // 创建节点连接图
        const nodeConnections = new Map<string, string[]>();
        const nodeInputs = new Map<string, Map<string, string>>();

        // 初始化节点输入映射
        nodes.forEach(node => {
            nodeInputs.set(node.id, new Map<string, string>());
        });

        // 处理连接
        connections.forEach(conn => {
            // 记录节点连接关系
            if (!nodeConnections.has(conn.sourceNodeId)) {
                nodeConnections.set(conn.sourceNodeId, []);
            }
            nodeConnections.get(conn.sourceNodeId)?.push(conn.targetNodeId);

            // 记录目标节点的输入
            const targetInputs = nodeInputs.get(conn.targetNodeId);
            if (targetInputs) {
                targetInputs.set(conn.targetInputId, `${conn.sourceNodeId}:${conn.sourceOutputId}`);
            }
        });

        // 找出没有输入连接的节点（起始节点）
        const startNodes = nodes.filter(node => {
            const inputs = nodeInputs.get(node.id);
            return inputs && inputs.size === 0 && nodeConnections.has(node.id);
        });

        // 为每个起始节点生成调用链
        const callChains: string[] = [];
        startNodes.forEach(startNode => {
            let callChain = '';

            // 根据节点类型生成初始调用
            switch (startNode.type) {
                case NodeTypeEnum.TEXT:
                    callChain = `text_${startNode.id}()`;
                    break;
                case NodeTypeEnum.JSON:
                    callChain = `json_${startNode.id}()`;
                    break;
                default:
                    return; // 跳过不支持作为起始节点的类型
            }

            // 递归生成调用链
            const generateCallChain = (nodeId: string, chain: string): string => {
                const nextNodeIds = nodeConnections.get(nodeId) || [];

                if (nextNodeIds.length === 0) {
                    return chain;
                }

                // 处理每个下一级节点
                let result = chain;
                nextNodeIds.forEach(nextNodeId => {
                    const nextNode = nodes.find(n => n.id === nextNodeId);
                    if (!nextNode) return;

                    let nextCall = '';
                    switch (nextNode.type) {
                        case NodeTypeEnum.LOG:
                            nextCall = `log_${nextNodeId}(${result})`;
                            break;
                        case NodeTypeEnum.ROUTER: {
                            // 获取节点的所有输入连接
                            const nodeInputsMap = nodeInputs.get(nextNodeId);
                            const props: Record<string, string> = {};
                            
                            // 处理每个输入端口的连接
                            if (nodeInputsMap) {
                                for (const [inputId, sourceConnection] of nodeInputsMap.entries()) {
                                    if (sourceConnection) {
                                        const [sourceNodeId] = sourceConnection.split(':');
                                        const sourceNode = nodes.find(n => n.id === sourceNodeId);
                                        if (sourceNode) {
                                            if (inputId === 'path') {
                                                // 如果是路径输入，使用文本节点的内容
                                                if (sourceNode.type === NodeTypeEnum.TEXT) {
                                                    props[inputId] = `"${sourceNode.content}"`;
                                                }
                                            } else if (inputId === 'value') {
                                                // 如果是值输入，使用上一个节点的结果
                                                props[inputId] = result;
                                            }
                                        }
                                    } else if (inputId === 'path') {
                                        // 如果没有连接，使用属性面板中的值
                                        const pathValue = properties[nextNodeId]?.path || '/';
                                        props[inputId] = `"${pathValue}"`;
                                    }
                                }
                            }

                            // 构建属性对象字符串
                            const propsString = Object.entries(props)
                                .map(([key, value]) => `"${key}": ${value}`)
                                .join(', ');

                            nextCall = `router_${nextNodeId}({ ${propsString} })`;
                            break;
                        }
                        case NodeTypeEnum.PORT: {
                            // 检查是否有连接到端口输入的节点
                            const portInputs = nodeInputs.get(nextNodeId);
                            const portInput = portInputs?.get('port');
                            let portValue = '';

                            if (portInput) {
                                const [sourceNodeId] = portInput.split(':');
                                const sourceNode = nodes.find(n => n.id === sourceNodeId);
                                if (sourceNode?.type === NodeTypeEnum.TEXT) {
                                    const portFromText = Number(sourceNode.content.trim());
                                    if (!Number.isNaN(portFromText)) {
                                        portValue = `, ${portFromText}`;
                                    }
                                }
                            }

                            nextCall = `port_${nextNodeId}(${result}${portValue})`;
                            break;
                        }
                        case NodeTypeEnum.JSON: {
                            nextCall = `json_${nextNodeId}(${result})`;
                            break;
                        }
                        default:
                            return;
                    }

                    // 继续递归处理下一级节点
                    result = generateCallChain(nextNodeId, nextCall);
                });

                return result;
            };

            const finalCallChain = generateCallChain(startNode.id, callChain);
            callChains.push(`${finalCallChain};`);
        });

        // 使用模板字符串组合最终代码
        return `// 自动生成的 Node.js 代码
const http = require('http');
const url = require('url');

// 节点函数定义
${textNodesFunctions}${logNodesFunctions}${jsonNodesFunctions}${routesDeclaration}${routerNodesFunctions}${portNodesFunctions}
// 连接调用
${callChains.join('\n')}
`;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-base-100 rounded-lg shadow-xl w-3/4 max-w-4xl max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold">代码预览</h2>
                    <button
                        type="button"
                        className="btn btn-sm btn-circle"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>
                <div className="p-4 overflow-auto flex-1">
                    <pre className="bg-base-300 p-4 rounded-lg overflow-x-auto">
                        <code>{generateCode()}</code>
                    </pre>
                </div>
                <div className="p-4 border-t flex justify-end gap-2">
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                            navigator.clipboard.writeText(generateCode());
                            alert('代码已复制到剪贴板');
                        }}
                    >
                        复制代码
                    </button>
                    <button
                        type="button"
                        className="btn"
                        onClick={onClose}
                    >
                        关闭
                    </button>
                </div>
            </div>
        </div>
    );
} 