/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import type { LensApiRequest } from "../router";
import { helmService } from "../helm/helm-service";
import logger from "../../common/logger";
import { respondJson, respondText } from "../utils/http-responses";
import { getBoolean } from "../utils/parse-query";

export class HelmApiRoute {
  static async listCharts(request: LensApiRequest) {
    const { response } = request;
    const charts = await helmService.listCharts();

    respondJson(response, charts);
  }

  static async getChart(request: LensApiRequest) {
    const { params, query, response } = request;

    try {
      const chart = await helmService.getChart(params.repo, params.chart, query.get("version"));

      respondJson(response, chart);
    } catch (error) {
      respondText(response, error?.toString() || "Error getting chart", 422);
    }
  }

  static async getChartValues(request: LensApiRequest) {
    const { params, query, response } = request;

    try {
      const values = await helmService.getChartValues(params.repo, params.chart, query.get("version"));

      respondJson(response, values);
    } catch (error) {
      respondText(response, error?.toString() || "Error getting chart values", 422);
    }
  }

  static async installChart(request: LensApiRequest) {
    const { payload, cluster, response } = request;

    try {
      const result = await helmService.installChart(cluster, payload);

      respondJson(response, result, 201);
    } catch (error) {
      logger.debug(error);
      respondText(response, error?.toString() || "Error installing chart", 422);
    }
  }

  static async updateRelease(request: LensApiRequest) {
    const { cluster, params, payload, response } = request;

    try {
      const result = await helmService.updateRelease(cluster, params.release, params.namespace, payload );

      respondJson(response, result);
    } catch (error) {
      logger.debug(error);
      respondText(response, error?.toString() || "Error updating chart", 422);
    }
  }

  static async rollbackRelease(request: LensApiRequest) {
    const { cluster, params, payload, response } = request;

    try {
      const result = await helmService.rollback(cluster, params.release, params.namespace, payload.revision);

      respondJson(response, result);
    } catch (error) {
      logger.debug(error);
      respondText(response, error?.toString() || "Error rolling back chart", 422);
    }
  }

  static async listReleases(request: LensApiRequest) {
    const { cluster, params, response } = request;

    try {
      const result = await helmService.listReleases(cluster, params.namespace);

      respondJson(response, result);
    } catch(error) {
      logger.debug(error);
      respondText(response, error?.toString() || "Error listing release", 422);
    }
  }

  static async getRelease(request: LensApiRequest) {
    const { cluster, params, response } = request;

    try {
      const result = await helmService.getRelease(cluster, params.release, params.namespace);

      respondJson(response, result);
    } catch (error) {
      logger.debug(error);
      respondText(response, error?.toString() || "Error getting release", 422);
    }
  }

  static async getReleaseValues(request: LensApiRequest) {
    const { cluster, params: { namespace, release }, response, query } = request;
    const all = getBoolean(query, "all");

    try {
      const result = await helmService.getReleaseValues(release, { cluster, namespace, all });

      respondText(response, result);
    } catch (error) {
      logger.debug(error);
      respondText(response, error?.toString() || "Error getting release values", 422);
    }
  }

  static async getReleaseHistory(request: LensApiRequest) {
    const { cluster, params, response } = request;

    try {
      const result = await helmService.getReleaseHistory(cluster, params.release, params.namespace);

      respondJson(response, result);
    } catch (error) {
      logger.debug(error);
      respondText(response, error?.toString() || "Error getting release history", 422);
    }
  }

  static async deleteRelease(request: LensApiRequest) {
    const { cluster, params, response } = request;

    try {
      const result = await helmService.deleteRelease(cluster, params.release, params.namespace);

      respondJson(response, result);
    } catch (error) {
      logger.debug(error);
      respondText(response, error?.toString() || "Error deleting release", 422);
    }
  }
}
