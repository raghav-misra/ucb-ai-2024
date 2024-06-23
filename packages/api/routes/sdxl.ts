import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import express, { type RequestHandler } from "express";

const client = new BedrockRuntimeClient({
    credentials: {
        accessKeyId: process.env["AWS_ACCESS_KEY_ID"] as string,
        secretAccessKey: process.env["AWS_SECRET_ACCESS_KEY"] as string,
        accountId: process.env["AWS_ACCOUNT_ID"] as string,
    },
    region: "us-west-2"
});

async function generateImage(prompt: string, size: "bg" | "normal") {
    const input = {
        "modelId": "stability.stable-diffusion-xl-v1",
        "contentType": "application/json",
        "accept": "application/json",
        "body": JSON.stringify({
            text_prompts: [
                {
                    text: prompt,
                    weight: 1
                }
            ],
            cfg_scale: 10,
            seed: 0,
            steps: 50,
            width: size === "bg" ? 1024: 512,
            height: size === "bg" ? 576 : 512,
            style_preset: "fantasy-art"
        })
    };
    
    const command = new InvokeModelCommand(input);
    const response = await client.send(command);
    const data = JSON.parse(Buffer.from(response.body).toString());
    const b64 = data.artifacts[0].base64;

    return Buffer.from(b64, "base64");
}

export const handler: RequestHandler = async (req, res) => {
    const imgbuffer = await generateImage(req.query.prompt as string, (req.query.size as "bg") || "normal");
    res.writeHead(200, {
        "Content-Type": "image/png",
        "Content-Length": imgbuffer.length,
    });
    res.end(imgbuffer);
}