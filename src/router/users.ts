import {Router} from "express";
import {UserService} from "../service/user.service";
import {EndpointProtector} from "../middleware/endpointProtector";

export const users = Router();
const userService = new UserService();
const protector = new EndpointProtector();

users.get("/users", protector.enableForAuthorized, userService.getAll);
users.delete("/users", protector.enableForAuthorized, userService.delete);

users.put("/users", protector.enableForAuthorized, userService.update);

users.post("/registration", userService.register);
users.post("/login",  userService.login);
