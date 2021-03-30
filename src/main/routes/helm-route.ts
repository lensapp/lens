import { LensApiRequest } from "../router";
import { helmService } from "../helm/helm-service";
import { LensApi } from "../lens-api";
import logger from "../logger";

class HelmApiRoute extends LensApi {
  public async listCharts(request: LensApiRequest) {
    const { response } = request;
    const charts = await helmService.listCharts();

    this.respondJson(response, charts);
  }

  public async getChart(request: LensApiRequest) {
    const { params, query, response } = request;

    try {
      const chart = await helmService.getChart(params.repo, params.chart, query.get("version"));

      this.respondJson(response, chart);
    } catch (error) {
      this.respondText(response, error, 422);
    }
  }

  public async getChartValues(request: LensApiRequest) {
    const { params, query, response } = request;

    try {
      const values = await helmService.getChartValues(params.repo, params.chart, query.get("version"));

      this.respondJson(response, values);
    } catch (error) {
      this.respondText(response, error, 422);
    }
  }

  public async installChart(request: LensApiRequest) {
    const { payload, cluster, response } = request;

    try {
      const result = await helmService.installChart(cluster, payload);

      this.respondJson(response, result, 201);
    } catch (error) {
      logger.debug(error);
      this.respondText(response, error, 422);
    }
  }

  public async updateRelease(request: LensApiRequest) {
    const { cluster, params, payload, response } = request;

    try {
      const result = await helmService.updateRelease(cluster, params.release, params.namespace, payload );

      this.respondJson(response, result);
    } catch (error) {
      logger.debug(error);
      this.respondText(response, error, 422);
    }
  }

  public async rollbackRelease(request: LensApiRequest) {
    const { cluster, params, payload, response } = request;

    try {
      const result = await helmService.rollback(cluster, params.release, params.namespace, payload.revision);

      this.respondJson(response, result);
    } catch (error) {
      logger.debug(error);
      this.respondText(response, error, 422);
    }
  }

  public async listReleases(request: LensApiRequest) {
    const { cluster, params, response } = request;

    try {
      const result = await helmService.listReleases(cluster, params.namespace);

      this.respondJson(response, result);
    } catch(error) {
      logger.debug(error);
      this.respondText(response, error, 422);
    }
  }

  public async getRelease(request: LensApiRequest) {
    const { cluster, params, response } = request;

    try {
      const result = await helmService.getRelease(cluster, params.release, params.namespace);

      this.respondJson(response, result);
    } catch (error) {
      logger.debug(error);
      this.respondText(response, error, 422);
    }
  }

  public async getReleaseValues(request: LensApiRequest) {
    const { cluster, params, response } = request;

    try {
      const result = await helmService.getReleaseValues(cluster, params.release, params.namespace);

      this.respondText(response, result);
    } catch (error) {
      logger.debug(error);
      this.respondText(response, error, 422);
    }
  }

  public async getReleaseHistory(request: LensApiRequest) {
    const { cluster, params, response } = request;

    try {
      const result = await helmService.getReleaseHistory(cluster, params.release, params.namespace);

      this.respondJson(response, result);
    } catch (error) {
      logger.debug(error);
      this.respondText(response, error, 422);
    }
  }

  public async deleteRelease(request: LensApiRequest) {
    const { cluster, params, response } = request;

    try {
      const result = await helmService.deleteRelease(cluster, params.release, params.namespace);

      this.respondJson(response, result);
    } catch (error) {
      logger.debug(error);
      this.respondText(response, error, 422);
    }
  }
}

export const helmRoute = new HelmApiRoute();
