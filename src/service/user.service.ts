import {Request, Response} from "express";
import bcrypt from "bcrypt";
import {User} from "../model/user";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export class UserService {

    private USER_CREATED_MESSAGE: string = "User created.";
    private USER_NOT_CREATED_MESSAGE: string = "User not created.";
    private LOGIN_SUCCESSFUL_MESSAGE: string = "Login successful.";
    private INCORRECT_PASSWORD_MESSAGE: string = "Password is incorrect.";
    private INCORRECT_EMAIL_MESSAGE: string = "Email is incorrect.";
    private USER_SUCCESS_DELETED_MESSAGE: string = "User(s) was deleted.";
    private USER_NOT_DELETED_MESSAGE: string = "User(s) was not deleted.";
    private USER_SUCCESS_UPDATED_MESSAGE: string = "User(s) was updated.";
    private USER_NOT_UPDATED_MESSAGE: string = "User(s) was not updated.";
    private EMAIL_ALREADY_EXISTS: string = "User with entered email already exists. Enter another email.";


    private SUCCESSFUL_CREATED_STATUS_CODE: number = 201;
    private SUCCESS_STATUS_CODE: number = 200;
    private SERVER_ERROR_STATUS_CODE: number = 500;
    private BAD_REQUEST_STATUS_CODE: number = 400;


    register = async (request: Request, response: Response) => {
        const password = request.body.password;
        const login = request.body.login;
        const name = request.body.name;
        bcrypt
            .hash(password, Number(process.env.SALT_ROUNDS))
            .then((hashedPassword) => {
                const user = this.createUser(login, hashedPassword, name);
                user
                    .save()
                    .then(() => {
                        this.sendResponse(response, this.SUCCESSFUL_CREATED_STATUS_CODE, this.USER_CREATED_MESSAGE);
                    })
                    .catch((e) => {
                        this.loginIsUnique(login)
                            ? this.sendResponse(response, this.SERVER_ERROR_STATUS_CODE, this.USER_NOT_CREATED_MESSAGE)
                            : this.sendResponse(response, this.BAD_REQUEST_STATUS_CODE, this.EMAIL_ALREADY_EXISTS);
                    });
            })
    };

    login = async (request: Request, response: Response) => {
        const login = request.body.login;
        const password = request.body.password;
        this.getUser(login)
            .then((user) => {
                bcrypt
                    .compare(password, user.password)
                    .then((passwordsIsEquals) => {
                        if (passwordsIsEquals) {
                            const token = this.createToken(user);
                            this.sendResponseWithToken(response, this.SUCCESS_STATUS_CODE, this.LOGIN_SUCCESSFUL_MESSAGE, token);
                        } else {
                            this.sendResponse(response, this.BAD_REQUEST_STATUS_CODE, this.INCORRECT_PASSWORD_MESSAGE);
                        }
                    })
            })
            .catch(() => {
                this.sendResponse(response, this.BAD_REQUEST_STATUS_CODE, this.INCORRECT_EMAIL_MESSAGE);
            });
    }

    getAll = async (request: Request, response: Response) => {
        response.json(await User.findAll());
    };

    delete = async (request: Request, response: Response) => {
        try {
            request.body.id?.map(async (id: string) => {
                await User.destroy({where: {id: parseInt(id)}});
            })
            this.sendResponse(response, this.SUCCESS_STATUS_CODE, this.USER_SUCCESS_DELETED_MESSAGE);
        } catch (e) {
            this.sendResponse(response, this.SERVER_ERROR_STATUS_CODE, this.USER_NOT_DELETED_MESSAGE);
        }
    }

    update = async (request: Request, response: Response) => {
        try {
            request.body.id?.map(async (id: string) => {
                const user = await this.getUserById(parseInt(id));
                user.isActive = request.body.isActive;
                await user.save();
            })
            this.sendResponse(response, this.SUCCESS_STATUS_CODE, this.USER_SUCCESS_UPDATED_MESSAGE);
        } catch (e) {
            this.sendResponse(response, this.SERVER_ERROR_STATUS_CODE, this.USER_NOT_UPDATED_MESSAGE);
        }
    };

    private getUser(login: string) {
        return User.findOne({
            where: {
                login: login
            }
        });
    }

    private async getUserById(id: number) {
        return await User.findOne({
            where: {
                id: id
            }
        });
    }

    private sendResponse(response: Response, statusCode: number, message: string) {
        response
            .status(statusCode)
            .send(message);
    }

    private sendResponseWithToken(response: Response, statusCode: number, message: string, token: string) {
        response.status(statusCode).send({
            message: message,
            token,
        });
    }

    private createUser(login: string, password: string, name: string) {
        const user = new User({
            login: login,
            password: password,
            name: name,
            registrationDate: new Date(),
            lastLoginDate: new Date(),
            isActive: true
        });
        return user;
    }

    private createToken(user: User) {
        const token = jwt.sign(
            {
                id: user.id,
            },
            process.env.JWT_SECRET,
            {expiresIn: process.env.JWT_EXPIRES_IN}
        );
        return token;
    }

    private loginIsUnique(login: string) {
        return this.getUser(login) == null;
    }
}
