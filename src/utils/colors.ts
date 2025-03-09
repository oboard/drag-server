import { PropertyType } from "../types";

export const getTypeColor = (type: PropertyType): string => {
    switch (type) {
        case 'string':
            return 'text-blue-500';
        case 'response':
            return 'text-green-500';
        case 'number':
            return 'text-purple-500';
        case 'json':
            return 'text-yellow-500';
        case 'any':
            return 'text-gray-500';
        default:
            return 'text-gray-500';
    }
};

export const getTypeBackgroundColor = (type: PropertyType): string => {
    switch (type) {
        case 'string':
            return 'bg-blue-500 hover:bg-blue-600';
        case 'response':
            return 'bg-green-500 hover:bg-green-600';
        case 'number':
            return 'bg-purple-500 hover:bg-purple-600';
        case 'json':
            return 'bg-yellow-500 hover:bg-yellow-600';
        case 'any':
            return 'bg-gray-500 hover:bg-gray-600';
        default:
            return 'bg-gray-500 hover:bg-gray-600';
    }
};