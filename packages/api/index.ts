import express from "express";
import { handler as sdxlHandler } from "./routes/sdxl";

const app = express();

app.get("/sdxl", sdxlHandler);

app.listen(8080, () => console.log("listening!"));