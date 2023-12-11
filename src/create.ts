import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { dbClient, headers, schema, handleError, tableName } from './handlers';
import { v4 } from "uuid";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const reqBody = JSON.parse(event.body as string);
        await schema.validate(reqBody, { abortEarly: false });

        const payload = new PutCommand({
            TableName: tableName,
            Item: {
                ...reqBody,
                todoID: v4()
            }
        });

        await dbClient.send(payload);

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify({
                status: true,
                message: "Records created successfully..."
            })
        };

    } catch (e) {
        return handleError(e);
    }
};