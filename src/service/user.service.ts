import {Request, Response} from "express";
import bcrypt from "bcrypt";
import {User} from "../model/user";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export class UserService {

    register = async (request: Request, response: Response) => {
        // hash the password
        bcrypt
            .hash(request.body.password, 10)
            .then((hashedPassword) => {
                // create a new user instance and collect the data
                const user = new User({
                    login: request.body.login,
                    password: hashedPassword,
                    name: request.body.name,
                    registrationDate: new Date(),
                    lastLoginDate: new Date(),
                    isActive: true
                });

                // save the new user
                user
                    .save()
                    // return success if the new user is added to the database successfully
                    .then((result) => {
                        response.status(201).send({
                            message: "User Created Successfully",
                            result,
                        });
                    })
                    // catch error if the new user wasn't added successfully to the database
                    .catch((error) => {
                        response.status(500).send({
                            message: "Error creating user",
                            error,
                        });
                    });
            })
            // catch error if the password hash isn't successful
            .catch((e) => {
                response.status(500).send({
                    message: "Password was not hashed successfully",
                    e,
                });
            });
    };

    login = async (request: Request, response: Response) => {
        const login = request.body.login;//copy code
        const password = request.body.password;
        User.findOne({
            where: {
                login: login
            }
        })
            .then((user) => {
                bcrypt
                    .compare(password, user.password)
                    .then((passwordIsCorrect) => {
                        if (!passwordIsCorrect) {
                            return response.status(400).send({
                                message: "Passwords does not match",
                            });
                        }

                        const token = jwt.sign(
                            {
                                id: user.id,
                                // login: user.login, //need it
                            },
                            "RANDOM-TOKEN",//generim
                            //  process.env.JWT_SECRET,
                            {expiresIn: "24h"}
                            // {expiresIn: process.env.JWT_EXPIRES_IN}
                        );

                        response.status(200).send({
                            message: "Login Successful",
                            login: user.login,
                            token,
                        });
                    })
                    // catch error if password does not match
                    .catch((error) => {
                        response.status(400).send({
                            message: "Passwords does not match",
                            error,
                        });
                    });
            })
            .catch((e) => {
                response.status(404).send({//really, 404??
                    message: "Email is incorrect",
                    e,
                });
            });
    }

    getAll = async (request: Request, response: Response) => {
        response.json(await User.findAll());
    };

    delete = async (request: Request, response: Response) => {

        console.log(request)
        try {
            request.body.id?.map(async (id: string) => {
                await User.destroy({where: {id: parseInt(id)}});
            })

            response.sendStatus(200);
        } catch (e) {
            console.log(e)
            response.status(500).send();
        }
    }

    update = async (request: Request, response: Response) => {
        try {
            request.body.id?.map(async (id: string) => {
                const user = await this.getUserById(parseInt(id));
                user.isActive = request.body.isActive;
                await user.save();
            })

            response.sendStatus(200);
        } catch (e) {
            console.log(e)
            response.status(500).send();
        }
    };

    // private hash(password: string) {
    //     return bcrypt.hashSync(password, salt)//salt
    // }

    private async userIsNotExists(login: string) {
        return await this.getUser(login) === null;
    }

    private async userIsExists(login: string) {
        return await this.getUser(login) !== null;
    }

    private async getUser(login: string) {
        return await User.findOne({
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
}
