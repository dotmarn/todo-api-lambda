import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { dbClient, headers, schema, handleError, tableName, getTodoItemById } from './handlers';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const id = event.pathParameters?.id as string;

        await getTodoItemById(id);

        const reqBody = JSON.parse(event.body as string);

        await schema.validate(reqBody, { abortEarly: false });

        const item = {
            ...reqBody,
            todoID: id,
        };

        await dbClient.send(new PutCommand({
            TableName: tableName,
            Item: item,
        }));

        return {
            statusCode: 204,
            headers,
            body: "",
        };
    } catch (e) {
        return handleError(e);
    }
};