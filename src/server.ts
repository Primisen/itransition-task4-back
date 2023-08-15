import {createServer} from "http";
import {app} from "./app";
import {sequelize} from "./config/sequelize";

const port = process.env.APPLICATION_PORT || 3000;

(async () => {
    await sequelize.sync();

    createServer(app)
        .listen(
            port,
            () => console.info(`Server running on port ${port}`)
        );
})();
