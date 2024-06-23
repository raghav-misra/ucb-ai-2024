import { RequestHandler } from "express";
import users from "../users";

export const handler: RequestHandler = (req, res) => {
    const { userId, config } = req.body;
    
    try {
        const success = users.createGame(userId, config);
        res.status(201).json({
            success,
        });
    } catch (ex) {
        res.status(500).json({
            success: false,
            reason: ex
        });
    }
};