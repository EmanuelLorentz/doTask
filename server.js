const express = require("express");
const fs = require("node:fs/promises");
const path = require("node:path");

const app = express();
const PORT = 3001;
const markdownFile = path.join(__dirname, "tasks.md");

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/tasks", async (_req, res) => {
  try {
    const markdown = await fs.readFile(markdownFile, "utf8");
    res.json({ markdown });
  } catch (error) {
    console.error("Erro ao ler tasks.md:", error);
    res.status(500).json({ error: "Não foi possível ler tasks.md." });
  }
});

app.put("/api/tasks", async (req, res) => {
  const { markdown } = req.body;

  if (typeof markdown !== "string") {
    return res.status(400).json({ error: "O conteúdo Markdown é inválido." });
  }

  try {
    await fs.writeFile(markdownFile, markdown, "utf8");
    res.json({ ok: true });
  } catch (error) {
    console.error("Erro ao salvar tasks.md:", error);
    res.status(500).json({ error: "Não foi possível salvar tasks.md." });
  }
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`To-do disponível em http://localhost:${PORT}`);
});
