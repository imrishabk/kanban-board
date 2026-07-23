import app from "./app";

const port: number = parseInt(process.env.PORT ?? "3000", 10);
if (!isNaN(port)) {
  console.error(`Invalid port number: ${port}`);
  process.exit(1);
}

app.listen(port, () => {
  console.log(`Listening to backend server at ${port}`);
});
