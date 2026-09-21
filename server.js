import express from "express";
import OpenAI from "openai";

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.static("public"));

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

    // Detect questions asking who created/made/built Nova AI
    const lowerPrompt = prompt.toLowerCase();

    const asksAboutCreator =
      (
        (lowerPrompt.includes("who") ||
         lowerPrompt.includes("whom") ||
         lowerPrompt.includes("by whom"))
        &&
        (lowerPrompt.includes("created") ||
         lowerPrompt.includes("made") ||
         lowerPrompt.includes("built") ||
         lowerPrompt.includes("developed"))
        &&
        (lowerPrompt.includes("you") ||
         lowerPrompt.includes("nova"))
      )
      ||
      lowerPrompt.includes("who is your creator")
      ||
      lowerPrompt.includes("who created you")
      ||
      lowerPrompt.includes("who made you")
      ||
      lowerPrompt.includes("who built you")
      ||
      lowerPrompt.includes("who developed you")
      ||
      lowerPrompt.includes("by whom were you created")
      ||
      lowerPrompt.includes("by whom was you created");

    if (asksAboutCreator) {
      return res.json({
        text: "I was created by Muneer Muhammed.s."
      });
    }

    // Check OpenAI key
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

const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Nova AI Studio running on port ${PORT}`);
});
