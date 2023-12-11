import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { headers, handleError, getTodoItemById } from './handlers';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const item = await getTodoItemById(event.pathParameters?.id as string);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                status: true,
                data: item,
                message: "Record fetched successfully..."
            }),
        };
    } catch (e) {
        return handleError(e);
    }
};
