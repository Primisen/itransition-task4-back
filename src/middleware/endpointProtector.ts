import {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export class EndpointProtector {

    enableForAuthorized = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const token: string = request.headers.authorization.split(" ")[1];
            const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET);
            const user: any = decodedToken;
            // @ts-ignore
            request.user = user;
            next();
        } catch (error) {
            response.status(401).json({
                error: new Error("Invalid request!"),
            });
        }
    };
}