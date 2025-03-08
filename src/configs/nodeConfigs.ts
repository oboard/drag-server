import { NodeTypeEnum, NodeConfigMap } from '../types/index';

export const NODE_CONFIGS: NodeConfigMap = {
    [NodeTypeEnum.TEXT]: {
        inputs: [],
        outputs: [{ id: 'output', name: 'Value', type: 'string' }],
        icon: 'text-icon',
        description: '文本节点'
    },
    [NodeTypeEnum.JSON]: {
        inputs: [],
        outputs: [{ id: 'output', name: 'Value', type: 'json' }],
        icon: 'json-icon',
        description: 'JSON节点'
    },
    [NodeTypeEnum.LOG]: {
        inputs: [{ id: 'input', name: 'Value', type: 'any' }],
        outputs: [],
        icon: 'log-icon',
        description: '日志节点'
    },
    [NodeTypeEnum.ROUTER]: {
        inputs: [
            { id: 'path', name: 'Path', type: 'string' },
            { id: 'input', name: 'Value', type: 'any' }
        ],
        outputs: [{ id: 'output', name: 'Response', type: 'response' }],
        icon: 'router-icon',
        description: '路由节点'
    },
    [NodeTypeEnum.PORT]: {
        inputs: [
            { id: 'port', name: 'Port', type: 'number' },
            { id: 'input', name: 'Value', type: 'any' }
        ],
        outputs: [],
        icon: 'port-icon',
        description: '端口节点'
    }
}; 