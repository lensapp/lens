import fs from "fs";
import path from "path";
import hb from "handlebars";
import { observable } from "mobx";
import { ResourceApplier } from "../main/resource-applier";
import { Cluster } from "../main/cluster";
import logger from "../main/logger";
import { app } from "electron";
import { requestMain } from "../common/ipc";
import { clusterKubectlApplyAllHandler } from "../common/cluster-ipc";

export interface ClusterFeatureStatus {
  /** feature's current version, as set by the implementation */
  currentVersion: string;
  /** feature's latest version, as set by the implementation */
  latestVersion: string;
  /** whether the feature is installed or not, as set by the implementation */
  installed: boolean;
  /** whether the feature can be upgraded or not, as set by the implementation */
  canUpgrade: boolean;
}

export abstract class ClusterFeature {

  /**
   * this field sets the template parameters that are to be applied to any templated kubernetes resources that are to be installed for the feature.
   * See the renderTemplates() method for more details
   */
  templateContext: any;

  /**
   * this field holds the current feature status, is accessed directly by Lens
   */
  @observable status: ClusterFeatureStatus = {
    currentVersion: null,
    installed: false,
    latestVersion: null,
    canUpgrade: false
  };

  /**
   * to be implemented in the derived class, this method is typically called by Lens when a user has indicated that this feature is to be installed. The implementation
   * of this method should install kubernetes resources using the applyResources() method, or by directly accessing the kubernetes api (K8sApi)
   * 
   * @param cluster the cluster that the feature is to be installed on
   */
  abstract async install(cluster: Cluster): Promise<void>;

  /**
   * to be implemented in the derived class, this method is typically called by Lens when a user has indicated that this feature is to be upgraded. The implementation
   * of this method should upgrade the kubernetes resources already installed, if relevant to the feature
   * 
   * @param cluster the cluster that the feature is to be upgraded on
   */
  abstract async upgrade(cluster: Cluster): Promise<void>;

  /**
   * to be implemented in the derived class, this method is typically called by Lens when a user has indicated that this feature is to be uninstalled. The implementation
   * of this method should uninstall kubernetes resources using the kubernetes api (K8sApi)
   * 
   * @param cluster the cluster that the feature is to be uninstalled from
   */
  abstract async uninstall(cluster: Cluster): Promise<void>;

  /**
   * to be implemented in the derived class, this method is called periodically by Lens to determine details about the feature's current status. The implementation
   * of this method should provide the current status information. The currentVersion and latestVersion fields may be displayed by Lens in describing the feature. 
   * The installed field should be set to true if the feature has been installed, otherwise false. Also, Lens relies on the canUpgrade field to determine if the feature
   * can be upgraded so the implementation should set the canUpgrade field according to specific rules for the feature, if relevant.
   * 
   * @param cluster the cluster that the feature may be installed on
   * 
   * @return a promise, resolved with the updated ClusterFeatureStatus
   */
  abstract async updateStatus(cluster: Cluster): Promise<ClusterFeatureStatus>;

  /**
   * this is a helper method that conveniently applies kubernetes resources to the cluster.
   * 
   * @param cluster the cluster that the resources are to be applied to
   * @param resourceSpec as a string type this is a folder path that is searched for files specifying kubernetes resources. The files are read and if any of the resource
   * files are templated, the template parameters are filled using the templateContext field (See renderTemplate() method). Finally the resources are applied to the
   * cluster. As a string[] type resourceSpec is treated as an array of fully formed (not templated) kubernetes resources that are applied to the cluster
   */
  protected async applyResources(cluster: Cluster, resourceSpec: string | string[]) {
    let resources: string[];

    if ( typeof resourceSpec === "string" ) {
      resources = this.renderTemplates(resourceSpec);
    } else {
      resources = resourceSpec;
    }

    if (app) {
      await new ResourceApplier(cluster).kubectlApplyAll(resources);
    } else {
      await requestMain(clusterKubectlApplyAllHandler, cluster.id, resources);
    }
  }

  /**
   * this is a helper method that conveniently reads kubernetes resource files into a string array. It also fills templated resource files with the template parameter values
   * specified by the templateContext field. Templated files must end with the extension '.hb' and the template syntax must be compatible with handlebars.js
   * 
   * @param folderPath this is a folder path that is searched for files defining kubernetes resources.
   * 
   * @return an array of strings, each string being the contents of a resource file found in the folder path. This can be passed directly to applyResources()
   */
  protected renderTemplates(folderPath: string): string[] {
    const resources: string[] = [];

    logger.info(`[FEATURE]: render templates from ${folderPath}`);
    fs.readdirSync(folderPath).forEach(filename => {
      const file = path.join(folderPath, filename);
      const raw = fs.readFileSync(file);

      if (filename.endsWith(".hb")) {
        const template = hb.compile(raw.toString());

        resources.push(template(this.templateContext));
      } else {
        resources.push(raw.toString());
      }
    });

    return resources;
  }
}
