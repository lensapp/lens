import config, { BUILD_DIR, CLIENT_DIR } from "../server/config"

import path from "path"
import fs from "fs"
import express from "express"
import cookieSession from "cookie-session"
import compression from "compression"
import helmet from "helmet"
import morgan from "morgan"
import { logger } from "../server/utils/logger"
import { configRoute, kubeconfigRoute, kubewatchRoute, metricsRoute, readyStateRoute } from "../server/routes";
import { useRequestHeaderToken } from "../server/middlewares";

const {
  IS_PRODUCTION, LOCAL_SERVER_PORT, API_PREFIX,
  SESSION_NAME, SESSION_SECRET,
} = config;

const app = express();
const localApis = express.Router();
const outputDir = path.resolve(process.cwd(), BUILD_DIR, CLIENT_DIR);

app.set('trust proxy', 1); // trust first proxy

localApis.use(
  configRoute(),
  readyStateRoute(),
  kubeconfigRoute(),
  kubewatchRoute(),
  metricsRoute()
);

// https://github.com/expressjs/cookie-session
app.use(cookieSession({
  name: SESSION_NAME,
  secret: SESSION_SECRET,
  secure: IS_PRODUCTION,
  httpOnly: true,
  maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
}));

// protect from well-known web vulnerabilities by setting HTTP headers appropriately
// https://github.com/helmetjs/helmet
app.use(helmet({
  hsts: {
    includeSubDomains: false,
  }
}));

// use auth-token from request headers (if applicable via proxy)
app.use(useRequestHeaderToken());

// requests logging
app.use(morgan('tiny'));

// enable gzip compression
app.use(compression());

app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use("/", express.static(outputDir)); // handle static files (assets)

app.use(API_PREFIX.BASE, express.json({ limit: "10mb" }), localApis);

// handle all page requests via index.html, in development mode it's managed by webpack-dev-server
app.all('*', (req, res) => {
  const indexHtml = path.resolve(outputDir, 'index.html');
  if (fs.existsSync(indexHtml)) res.sendFile(indexHtml);
  else {
    res.send("Error: build/index.html doesn't exists");
  }
});

// run server
const server = app.listen(LOCAL_SERVER_PORT, "127.0.0.1", () => {
  logger.appStarted(LOCAL_SERVER_PORT, 'Server started');
});
