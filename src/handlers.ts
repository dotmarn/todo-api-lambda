import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import * as yup from "yup";

const client = new DynamoDBClient({
    endpoint: process.env.DYNAMODB_ENDPOINT
});

const dbClient = DynamoDBDocumentClient.from(client);

const headers = {
    "content-type": "application/json",
};

const tableName = process.env.DYNAMODB_TABLE;

const schema = yup.object().shape({
    title: yup.string().required(),
    description: yup.string().required()
});

const getTodoItemById = async (id: string) => {
    const result = await dbClient.send(new GetCommand({
        TableName: tableName,
        Key: {
            todoID: id,
        },
    }));

    if (!result.Item) {
        throw new HttpError(404, { error: "not found" });
    }

    return result.Item;
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

export { dbClient, headers, schema, handleError, tableName, getTodoItemById };



// export const updateTodoItem = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
//     try {
//         const id = event.pathParameters?.id as string;

//         await getTodoItemById(id);

//         const reqBody = JSON.parse(event.body as string);

//         await schema.validate(reqBody, { abortEarly: false });

//         const item = {
//             ...reqBody,
//             todoID: id,
//         };

//         await dbClient.put({
//             TableName: tableName,
//             Item: item,
//         }).promise();

//         return {
//             statusCode: 200,
//             headers,
//             body: JSON.stringify(item),
//         };
//     } catch (e) {
//         return handleError(e);
//     }
// };
