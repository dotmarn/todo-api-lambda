import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { dbClient, headers, handleError, getTodoItemById, tableName } from './handlers';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const id = event.pathParameters?.id as string;

        await getTodoItemById(id);

        await dbClient.send(new DeleteCommand({
            TableName: tableName,
            Key: {
                todoID: id,
            },
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