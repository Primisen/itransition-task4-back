import {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export class EndpointProtector {

    enableForAuthorized = async (request: Request, response: Response, next: NextFunction) => {
        try {
            // get the token from the authorization header
            const token: string = request.headers.authorization.split(" ")[1];

            // check if the token matches the supposed origin
            const decodedToken: any = jwt.verify(token, "RANDOM-TOKEN");//checks
            // const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET);//checks

            // retrieve the user details of the logged in user
            const user: any = decodedToken;

            // pass the user down to the endpoints here
            // @ts-ignore
            request.user = user;

            // pass down functionality to the endpoint
            next();

        } catch (error) {
            response.status(401).json({
                error: new Error("Invalid request!"),
            });
        }
    };
}