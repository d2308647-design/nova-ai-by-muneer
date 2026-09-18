app.post("/api/image", async (req, res) => {
  try {
    if (!hf) {
      return res.status(503).json({
        error: "HF_TOKEN is missing in Render Environment."
      });
    }

    const prompt = String(req.body.prompt || "").trim();

    if (!prompt) {
      return res.status(400).json({
        error: "Please enter an image prompt."
      });
    }

    console.log("IMAGE REQUEST:", prompt);

    const image = await hf.textToImage({
      model: "black-forest-labs/FLUX.1-schnell",
      inputs: prompt,
      provider: "auto"
    }, {
      outputType: "dataUrl"
    });

    console.log("IMAGE SUCCESS");

    res.json({
      url: image
    });

  } catch (error) {
    console.error("===== IMAGE ERROR =====");
    console.error(error);
    console.error("======================");

    res.status(500).json({
      error: error?.message || "Hugging Face image generation failed."
    });
  }
});
