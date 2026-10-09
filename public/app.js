const taskList = document.querySelector("#task-list");
const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const statusEl = document.querySelector("#status");

let lines = [];
let hasFinalNewline = true;
let saveQueue = Promise.resolve();

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("erro", isError);
}

function serializeMarkdown() {
  return lines.join("\n") + (hasFinalNewline ? "\n" : "");
}

function parseMarkdown(markdown) {
  hasFinalNewline = markdown.endsWith("\n");

  const normalized = markdown.replace(/\r\n/g, "\n");
  lines = normalized.split("\n");

  if (hasFinalNewline) {
    lines.pop();
  }
}

function saveMarkdown() {
  const snapshot = serializeMarkdown();
  setStatus("Salvando…");

  // Mantém os salvamentos em sequência, mesmo se você clicar rapidamente.
  saveQueue = saveQueue
    .catch(() => {})
    .then(async () => {
      const response = await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown: snapshot }),
      });

      if (!response.ok) {
        throw new Error("Falha ao salvar o arquivo.");
      }

      setStatus("Salvo em tasks.md");
    })
    .catch((error) => {
      console.error(error);
      setStatus("Erro ao salvar. Confira o servidor.", true);
    });

  return saveQueue;
}

function makeTaskElement(line, index, match) {
  const checked = match[2].toLowerCase() === "x";

  const row = document.createElement("div");
  row.className = "task";
  if (checked) row.classList.add("task-concluida");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = checked;
  checkbox.setAttribute("aria-label", `Marcar tarefa: ${match[4]}`);

  checkbox.addEventListener("change", () => {
    const currentMatch = lines[index].match(
      /^(\s*[-*+]\s+\[)([ xX])(\]\s*)(.*)$/
    );

    if (!currentMatch) return;

    lines[index] =
      currentMatch[1] +
      (checkbox.checked ? "x" : " ") +
      currentMatch[3] +
      currentMatch[4];

    render();
    saveMarkdown();
  });

  const text = document.createElement("span");
  text.className = "task-text";
  text.textContent = match[4];

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "delete-button";
  deleteButton.textContent = "Excluir";
  deleteButton.setAttribute("aria-label", `Excluir tarefa: ${match[4]}`);

  deleteButton.addEventListener("click", () => {
    lines.splice(index, 1);
    render();
    saveMarkdown();
  });

  row.append(checkbox, text, deleteButton);
  return row;
}

function render() {
  taskList.replaceChildren();

  let currentTaskList = null;
  let taskCount = 0;

  function startTaskList() {
    if (!currentTaskList) {
      currentTaskList = document.createElement("div");
      currentTaskList.className = "task-list";
      taskList.append(currentTaskList);
    }
    return currentTaskList;
  }

  lines.forEach((line, index) => {
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    const taskMatch = line.match(/^(\s*[-*+]\s+\[)([ xX])(\]\s*)(.*)$/);

    if (headingMatch) {
      currentTaskList = null;

      const level = headingMatch[1].length;
      const heading = document.createElement(`h${level}`);
      heading.className = "markdown-heading";
      heading.textContent = headingMatch[2];
      taskList.append(heading);
      return;
    }

    if (taskMatch) {
      startTaskList().append(makeTaskElement(line, index, taskMatch));
      taskCount++;
      return;
    }

    if (line.trim() !== "") {
      currentTaskList = null;

      const note = document.createElement("p");
      note.className = "note";
      note.textContent = line;
      taskList.append(note);
    } else {
      currentTaskList = null;
    }
  });

  if (taskCount === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "empty";
    emptyMessage.textContent = "Nenhuma tarefa no arquivo ainda.";
    taskList.append(emptyMessage);
  }
}

async function loadMarkdown() {
  try {
    const response = await fetch("/api/tasks");

    if (!response.ok) {
      throw new Error("Falha ao carregar tasks.md.");
    }

    const data = await response.json();
    parseMarkdown(data.markdown);
    render();
    setStatus("Pronto");
  } catch (error) {
    console.error(error);
    setStatus("Erro ao carregar. Confira o servidor.", true);
    taskList.textContent = "Não foi possível carregar tasks.md.";
  }
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = taskInput.value.trim();
  if (!text) return;

  // Insere a nova tarefa antes de linhas vazias no fim do arquivo.
  let insertAt = lines.length;
  while (insertAt > 0 && lines[insertAt - 1].trim() === "") {
    insertAt--;
  }

  lines.splice(insertAt, 0, `- [ ] ${text}`);
  hasFinalNewline = true;

  taskInput.value = "";
  render();
  saveMarkdown();
  taskInput.focus();
});

loadMarkdown();
