import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { type RequestHandler } from "express";

const client = new BedrockRuntimeClient({
    credentials: {
        accessKeyId: process.env["AWS_ACCESS_KEY_ID"] as string,
        secretAccessKey: process.env["AWS_SECRET_ACCESS_KEY"] as string,
        accountId: process.env["AWS_ACCOUNT_ID"] as string,
    },
    region: "us-west-2"
});

export async function generateImage(prompt: string, size: "bg" | "normal" |"avatar" |"icon") {
    const sizes = {
        "bg": { 
            width: 1024,
            height: 512
        },
        "normal": {
            width: 1024,
            height: 1024
        },
        "icon":{
            width: 512,
            height: 512
        },
        "avatar":{
            width: 512,
            height: 512
        }   
    }

    console.log(size);

    const input = {
        "modelId": "stability.stable-diffusion-xl-v1",
        "contentType": "application/json",
        "accept": "application/json",
        "body": JSON.stringify({
            text_prompts: [
                {
                    text: `rpg fantasy game art - ${prompt}`,
                    weight: 1
                },{
                    text: `worst quality, low quality`,
                    weight:-1
                }
            ],
            cfg_scale: 7,
            seed: 0,
            steps: 20,
            width: sizes[size].width,
            height: sizes[size].height,
            style_preset: "fantasy-art"
        })
    };
    
    const command = new InvokeModelCommand(input);
    const response = await client.send(command);
    const data = JSON.parse(Buffer.from(response.body).toString());
    const b64 = data.artifacts[0].base64;

    const buffer = Buffer.from(b64, "base64");
    //Save the image to disk
    const blob = new Blob([buffer]);
    const now = Date.now()
    const path = `./images/${now}.png`;
    const image = Bun.write(path, blob);

    return `${now}.png`;
}

export const handler: RequestHandler = async (req, res) => {
    const imgbuffer = await generateImage(req.query.prompt as string, (req.query.size as "bg") || "normal");
    res.writeHead(200, {
        "Content-Type": "image/png",
        "Content-Length": imgbuffer.length,
    });
    res.end(imgbuffer);
}