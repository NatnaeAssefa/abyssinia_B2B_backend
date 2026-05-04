import app from "./app";
import { env } from "./config";

app.listen(env.PORT, () => {
  console.log(`Running on port ${env.PORT}`);
});