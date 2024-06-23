import config from "@colyseus/tools";
import { monitor } from "@colyseus/monitor";
import { playground } from "@colyseus/playground";

import { handler as sdxlHandler } from "./routes/sdxl";
import { handler as authHandler } from "./routes/auth";
import { handler as configsHandler } from "./routes/configs";
import { handler as initHandler } from "./routes/init";

import express from "express";

import {promises as fs} from "fs";

/**
 * Import your Room files
 */
import { MyRoom } from "./rooms/MyRoom";

export default config({

    initializeGameServer: (gameServer) => {
        /**
         * Define your room handlers:
         */
        gameServer.define('my_room', MyRoom);

    },

    initializeExpress: (app) => {

        /**
         * Bind your custom express routes here:
         * Read more: https://expressjs.com/en/starter/basic-routing.html
         */
        app.get("/sdxl", sdxlHandler);
        app.post("/auth", authHandler);
        app.post("/configs", configsHandler);
        app.post("/init", initHandler);

        //Static files host images folder
        app.use('/images',express.static(__dirname  + '/packages/server/images'));

        /**
         * Use @colyseus/playground
         * (It is not recommended to expose this route in a production environment)
         */
        /*
        if (process.env.NODE_ENV !== "production") {
            app.use("/", playground);
        }*/

        /**
         * Use @colyseus/monitor
         * It is recommended to protect this route with a password
         * Read more: https://docs.colyseus.io/tools/monitor/#restrict-access-to-the-panel-using-a-password
         */
        app.use("/colyseus", monitor());
    },


    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }
});
