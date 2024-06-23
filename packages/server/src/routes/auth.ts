import { RequestHandler } from "express";
import users from "../users";

export const handler: RequestHandler = (req, res) => {
    const { email, password } = req.body;
    
    try {
        const userId = users.validate(email, password);
        res.status(201).json({
            success: true,
            userId
        });
    } catch (ex) {
        res.status(500).json({
            success: false
        });
    }
};