import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import express from "express";

const client = new BedrockRuntimeClient({
    credentials: {
        accessKeyId: process.env["AWS_ACCESS_KEY_ID"] as string,
        secretAccessKey: process.env["AWS_SECRET_ACCESS_KEY"] as string,
        accountId: process.env["AWS_ACCOUNT_ID"] as string,
    },
    region: "us-west-2"
});

async function generateImage(prompt: string) {
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
            width: 512,
            height: 512,
            style_preset: "fantasy-art"
        })
    };
    
    const command = new InvokeModelCommand(input);
    const response = await client.send(command);
    const data = JSON.parse(Buffer.from(response.body).toString());
    const b64 = data.artifacts[0].base64;

    return Buffer.from(b64, "base64");
}

const app = express();

app.get("/sdxl", async (req, res) => {
    const imgbuffer = await generateImage("Role playing game landscape, desert arid landscape barren.");
    res.writeHead(200, {
        "Content-Type": "image/png",
        "Content-Length": imgbuffer.length,
    });
    res.end(imgbuffer);
});

app.listen(8080, () => console.log("listening!"));