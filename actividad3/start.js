const { spawn } = require("child_process");
const http = require("http");

const url = "http://127.0.0.1:8000/";
const python = process.platform === "win32" ? "python" : "python3";
const server = spawn(
  python,
  ["-m", "http.server", "8000", "--bind", "127.0.0.1"],
  { cwd: __dirname, stdio: "inherit" }
);

let ready = false;

server.on("error", (error) => {
  console.error(`No se pudo iniciar el servidor: ${error.message}`);
  process.exitCode = 1;
});

server.on("exit", (code) => {
  if (!ready) {
    console.error(`El servidor terminó antes de estar listo (código ${code}).`);
    process.exitCode = code || 1;
  }
});

function checkServer() {
  return new Promise((resolve) => {
    const request = http.get(url, (response) => {
      response.resume();
      resolve(response.statusCode === 200);
    });
    request.setTimeout(1000, () => request.destroy());
    request.on("error", () => resolve(false));
  });
}

function openBrowser() {
  let command;
  let args;

  if (process.platform === "win32") {
    command = "cmd";
    args = ["/c", "start", "", url];
  } else if (process.platform === "darwin") {
    command = "open";
    args = [url];
  } else {
    command = "xdg-open";
    args = [url];
  }

  const browser = spawn(command, args, { detached: true, stdio: "ignore" });
  browser.on("error", (error) => {
    console.error(`No se pudo abrir el navegador automáticamente: ${error.message}`);
    console.log(`Abre esta dirección manualmente: ${url}`);
  });
  browser.unref();
}

async function start() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    if (server.exitCode !== null) return;
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (server.exitCode !== null) return;
    if (await checkServer()) {
      ready = true;
      console.log(`Página disponible en ${url}`);
      openBrowser();
      return;
    }
  }

  console.error("El servidor no respondió. Verifica que el puerto 8000 esté disponible.");
  server.kill();
  process.exitCode = 1;
}

start();
