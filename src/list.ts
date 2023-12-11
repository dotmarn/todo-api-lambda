import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { dbClient, headers, handleError, tableName } from './handlers';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {

        const params = new ScanCommand({
            "TableName": tableName
        });

        const output = await dbClient.send(params)

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                status: true,
                data: output.Items,
                message: "Records fetched successfully..."
            }),
        };

    } catch (error) {
        return handleError(error);
    }
};