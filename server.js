import express from "express";
import OpenAI from "openai";
import { InferenceClient } from "@huggingface/inference";

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.static("public"));

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  : null;

const hf = process.env.HF_TOKEN
  ? new InferenceClient(process.env.HF_TOKEN)
  : null;

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    openai: !!openai,
    huggingface: !!hf
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({
        error: "Text chat is temporarily unavailable."
      });
    }

    const prompt = String(req.body.prompt || "").trim();

    if (!prompt) {
      return res.status(400).json({
        error: "Please enter a message."
      });
    }

    const response = await openai.responses.create({
      model: process.env.OPENAI_CHAT_MODEL || "gpt-5.6-luna",
      input: prompt
    });

    res.json({
      text: response.output_text || "No response returned."
    });

  } catch (error) {
    console.error("CHAT ERROR:", error);

    res.status(500).json({
      error: "Chat is temporarily unavailable."
    });
  }
});

app.post("/api/image", async (req, res) => {
  try {
    if (!hf) {
      return res.status(503).json({
        error: "Image generation is not configured yet."
      });
    }

    const prompt = String(req.body.prompt || "").trim();

    if (!prompt) {
      return res.status(400).json({
        error: "Please enter an image prompt."
      });
    }

    console.log("Generating image:", prompt);

    const image = await hf.textToImage({
      model: "black-forest-labs/FLUX.1-schnell",
      inputs: prompt,
      provider: "auto"
    }, {
      outputType: "dataUrl"
    });

    res.json({
      url: image
    });

  } catch (error) {
    console.error("IMAGE ERROR:", error);

    res.status(500).json({
      error: "Image generation is unavailable right now."
    });
  }
});

app.post("/api/video", async (req, res) => {
  res.status(501).json({
    error: "Video generation is not connected yet."
  });
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Nova AI Studio running on port ${PORT}`);
});
