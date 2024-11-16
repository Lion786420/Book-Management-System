import { configType } from "./@types";
const config: configType = require("./utils/config.ts");
import app from "./app.ts";

app.listen(config.PORT, (): void => {
  console.log(`Server running on port ${config.PORT}`);
});
