import { App } from "./app";
import { pool } from "./config";

const application = new App(pool);
application.start();
