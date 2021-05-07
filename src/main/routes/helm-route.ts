import { LensApiRequest } from "../router";
import { helmService } from "../helm/helm-service";
import { respondJson, respondText } from "../utils/http-responses";
import logger from "../logger";

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
      respondText(response, error, 422);
    }
  }

  static async getChartValues(request: LensApiRequest) {
    const { params, query, response } = request;

    try {
      const values = await helmService.getChartValues(params.repo, params.chart, query.get("version"));

      respondJson(response, values);
    } catch (error) {
      respondText(response, error, 422);
    }
  }

  static async installChart(request: LensApiRequest) {
    const { payload, cluster, response } = request;

    try {
      const result = await helmService.installChart(cluster, payload);

      respondJson(response, result, 201);
    } catch (error) {
      logger.debug(error);
      respondText(response, error, 422);
    }
  }

  static async updateRelease(request: LensApiRequest) {
    const { cluster, params, payload, response } = request;

    try {
      const result = await helmService.updateRelease(cluster, params.release, params.namespace, payload );

      respondJson(response, result);
    } catch (error) {
      logger.debug(error);
      respondText(response, error, 422);
    }
  }

  static async rollbackRelease(request: LensApiRequest) {
    const { cluster, params, payload, response } = request;

    try {
      const result = await helmService.rollback(cluster, params.release, params.namespace, payload.revision);

      respondJson(response, result);
    } catch (error) {
      logger.debug(error);
      respondText(response, error, 422);
    }
  }

  static async listReleases(request: LensApiRequest) {
    const { cluster, params, response } = request;

    try {
      const result = await helmService.listReleases(cluster, params.namespace);

      respondJson(response, result);
    } catch(error) {
      logger.debug(error);
      respondText(response, error, 422);
    }
  }

  static async getRelease(request: LensApiRequest) {
    const { cluster, params, response } = request;

    try {
      const result = await helmService.getRelease(cluster, params.release, params.namespace);

      respondJson(response, result);
    } catch (error) {
      logger.debug(error);
      respondText(response, error, 422);
    }
  }

  static async getReleaseValues(request: LensApiRequest) {
    const { cluster, params, response, query } = request;

    try {
      const result = await helmService.getReleaseValues(cluster, params.release, params.namespace, query.has("all"));

      respondText(response, result);
    } catch (error) {
      logger.debug(error);
      respondText(response, error, 422);
    }
  }

  static async getReleaseHistory(request: LensApiRequest) {
    const { cluster, params, response } = request;

    try {
      const result = await helmService.getReleaseHistory(cluster, params.release, params.namespace);

      respondJson(response, result);
    } catch (error) {
      logger.debug(error);
      respondText(response, error, 422);
    }
  }

  static async deleteRelease(request: LensApiRequest) {
    const { cluster, params, response } = request;

    try {
      const result = await helmService.deleteRelease(cluster, params.release, params.namespace);

      respondJson(response, result);
    } catch (error) {
      logger.debug(error);
      respondText(response, error, 422);
    }
  }
}
