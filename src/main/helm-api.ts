import { LensApiRequest } from "./router";
import { helmService } from "./helm-service";
import { LensApi } from "./lens-api";
import logger from "./logger";

class HelmApi extends LensApi {
  public async listCharts(request: LensApiRequest): Promise<void> {
    const { response } = request;
    const charts = await helmService.listCharts();
    this.respondJson(response, charts);
  }

  public async getChart(request: LensApiRequest): Promise<void> {
    const { params, query, response } = request;
    const chart = await helmService.getChart(params.repo, params.chart, query.get("version"));
    this.respondJson(response, chart);
  }

  public async getChartValues(request: LensApiRequest): Promise<void> {
    const { params, query, response } = request;
    const values = await helmService.getChartValues(params.repo, params.chart, query.get("version"));
    this.respondJson(response, values);
  }

  public async installChart(request: LensApiRequest): Promise<void> {
    const { payload, cluster, response } = request;
    try {
      const result = await helmService.installChart(cluster, payload);
      this.respondJson(response, result, 201);
    } catch (error) {
      logger.debug(error);
      this.respondText(response, error, 422);
    }
  }

  public async updateRelease(request: LensApiRequest): Promise<void> {
    const { cluster, params, payload, response } = request;
    try {
      const result = await helmService.updateRelease(cluster, params.release, params.namespace, payload );
      this.respondJson(response, result);
    } catch (error) {
      logger.debug(error);
      this.respondText(response, error, 422);
    }
  }

  public async rollbackRelease(request: LensApiRequest): Promise<void> {
    const { cluster, params, payload, response } = request;
    try {
      const result = await helmService.rollback(cluster, params.release, params.namespace, payload.revision);
      this.respondJson(response, result);
    } catch (error) {
      logger.debug(error);
      this.respondText(response, error);
    }
  }

  public async listReleases(request: LensApiRequest): Promise<void> {
    const { cluster, params, response } = request;
    try {
      const result = await helmService.listReleases(cluster, params.namespace);
      this.respondJson(response, result);
    } catch(error) {
      logger.debug(error);
      this.respondText(response, error);
    }
  }

  public async getRelease(request: LensApiRequest): Promise<void> {
    const { cluster, params, response } = request;
    try {
      const result = await helmService.getRelease(cluster, params.release, params.namespace);
      this.respondJson(response, result);
    } catch (error) {
      logger.debug(error);
      this.respondText(response, error, 422);
    }
  }

  public async getReleaseValues(request: LensApiRequest): Promise<void> {
    const { cluster, params, response } = request;
    try {
      const result = await helmService.getReleaseValues(cluster, params.release, params.namespace);
      this.respondText(response, result);
    } catch (error) {
      logger.debug(error);
      this.respondText(response, error, 422);
    }
  }

  public async getReleaseHistory(request: LensApiRequest): Promise<void> {
    const { cluster, params, response } = request;
    try {
      const result = await helmService.getReleaseHistory(cluster, params.release, params.namespace);
      this.respondJson(response, result);
    } catch (error) {
      logger.debug(error);
      this.respondText(response, error, 422);
    }
  }

  public async deleteRelease(request: LensApiRequest): Promise<void> {
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

export const helmApi = new HelmApi();
