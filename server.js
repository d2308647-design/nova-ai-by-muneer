
import express from "express";
import OpenAI from "openai";

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.static("public"));

// OpenAI client
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  : null;

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Nova AI Studio"
  });
});

// Chat
app.post("/api/chat", async (req, res) => {
  try {
    const prompt = String(req.body.prompt || "").trim();

    if (!prompt) {
      return res.status(400).json({
        error: "Please enter a message."
      });
    }

    // Nova AI's creator
    const creatorQuestion =
      /who\s+(created|made|built|developed)\s+you|who\s+is\s+your\s+creator|who\s+made\s+you|who\s+built\s+you|who\s+developed\s+you/i.test(prompt);

    if (creatorQuestion) {
      return res.json({
        text: "I was created by Muneer Muhammed.s."
      });
    }

    // Check API key
    if (!openai) {
      return res.status(503).json({
        error: "Nova AI is temporarily unavailable. Please try again later."
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
    console.error("===== CHAT ERROR =====");
    console.error(error);

    res.status(500).json({
      error: "Sorry, I couldn't process that message right now."
    });
  }
});

// Start server
const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Nova AI Studio running on port ${PORT}`);
});
