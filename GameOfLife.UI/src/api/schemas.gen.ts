// This file is auto-generated by @hey-api/openapi-ts

export const GetFinalStateResponseSchema = {
    type: 'object',
    properties: {
        gameId: {
            type: 'string',
            nullable: true
        },
        grid: {
            '$ref': '#/components/schemas/Grid'
        },
        stepCount: {
            type: 'integer',
            format: 'int32'
        },
        loopDetectStep: {
            type: 'integer',
            format: 'int32',
            nullable: true
        },
        errorMessage: {
            type: 'string',
            nullable: true
        }
    },
    additionalProperties: false
} as const;

export const GridSchema = {
    type: 'object',
    properties: {
        width: {
            type: 'integer',
            format: 'int32'
        },
        height: {
            type: 'integer',
            format: 'int32'
        },
        packedData: {
            type: 'string',
            format: 'byte',
            nullable: true
        },
        intArrayData: {
            type: 'array',
            items: {
                type: 'array',
                items: {
                    type: 'integer',
                    format: 'int32'
                }
            },
            nullable: true
        }
    },
    additionalProperties: false
} as const;

export const SavedGameSchema = {
    type: 'object',
    properties: {
        id: {
            type: 'string',
            nullable: true
        },
        grid: {
            '$ref': '#/components/schemas/Grid'
        }
    },
    additionalProperties: false
} as const;