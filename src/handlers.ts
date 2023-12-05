import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from 'aws-sdk';
import { v4 } from "uuid";
import * as yup from "yup";

const dbClient = new AWS.DynamoDB.DocumentClient();
const tableName = 'TodosTable';
const headers = {
    "content-type": "application/json",
};

const schema = yup.object().shape({
    title: yup.string().required(),
    description: yup.string().required()
});

export const createTodoItem = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const reqBody = JSON.parse(event.body as string);
        await schema.validate(reqBody, { abortEarly: false });

        const payload = {
            ...reqBody,
            todoID: v4()
        }

        await dbClient.put({
            TableName: tableName,
            Item: payload,
        }).promise();

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify(payload)
        };

    } catch (e) {
        return handleError(e);
    }
};


const getTodoItemById = async (id: string) => {
    const result = await dbClient.get({
        TableName: tableName,
        Key: {
            todoID: id,
        },
    }).promise();

    if (!result.Item) {
        throw new HttpError(404, { error: "not found" });
    }

    return result.Item;
};

export const getTodoItem = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const item = await getTodoItemById(event.pathParameters?.id as string);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(item),
        };
    } catch (e) {
        return handleError(e);
    }
};

export const listAllTodoItems = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const output = await dbClient
        .scan({
            TableName: tableName,
        })
        .promise();

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify(output.Items),
    };
};

export const updateTodoItem = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const id = event.pathParameters?.id as string;

        await getTodoItemById(id);

        const reqBody = JSON.parse(event.body as string);

        await schema.validate(reqBody, { abortEarly: false });

        const item = {
            ...reqBody,
            todoID: id,
        };

        await dbClient.put({
            TableName: tableName,
            Item: item,
        }).promise();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(item),
        };
    } catch (e) {
        return handleError(e);
    }
};

export const deleteTodoItem = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const id = event.pathParameters?.id as string;

        await getTodoItemById(id);

        await dbClient.delete({
            TableName: tableName,
            Key: {
                todoID: id,
            },
        }).promise();

        return {
            statusCode: 204,
            headers,
            body: "",
        };
    } catch (e) {
        return handleError(e);
    }
};

class HttpError extends Error {
    constructor(public statusCode: number, body: Record<string, unknown> = {}) {
        super(JSON.stringify(body));
    }
}

const handleError = (e: unknown) => {
    if (e instanceof yup.ValidationError) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
                errors: e.errors,
            }),
        };
    }

    if (e instanceof SyntaxError) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: `invalid request body format : "${e.message}"` }),
        };
    }

    if (e instanceof HttpError) {
        return {
            statusCode: e.statusCode,
            headers,
            body: e.message,
        };
    }

    throw e;
};