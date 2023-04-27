/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ExecAction } from "./exec-action";
import type { HttpGetAction } from "./http-get-action";
import type { TcpSocketAction } from "./tcp-socket-action";

/**
 * Describes a health check to be performed against a container to determine whether
 * it is alive or ready to receive traffic.
 */
export interface Probe {
  exec?: ExecAction;

  /**
   * Minimum consecutive failures for the probe to be considered failed after having succeeded.
   *
   * @default 3
   * @minimum 1
   */
  failureThreshold?: number;

  httpGet?: HttpGetAction;

  /**
   * Duration after the container has started before liveness probes are initiated.
   *
   * More info: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes
   */
  initialDelaySeconds?: number;

  /**
   * How often to perform the probe.
   *
   * @default 10
   * @minimum 1
   */
  periodSeconds?: number;

  /**
   * Minimum consecutive successes for the probe to be considered successful after having failed.
   *
   * Must be 1 for liveness and startup.
   *
   * @default 1
   * @minimum 1
   */
  successThreshold?: number;

  tcpSocket?: TcpSocketAction;

  /**
   * Duration the pod needs to terminate gracefully upon probe failure.
   *
   * The grace period is the duration in seconds after the processes running in the pod are sent a
   * termination signal and the time when the processes are forcibly halted with a kill signal.
   *
   * Set this value longer than the expected cleanup time for your process.
   *
   * If this value is not set, the pod's terminationGracePeriodSeconds will be used. Otherwise,
   * this value overrides the value provided by the pod spec. Value must be non-negative integer.
   * The value zero indicates stop immediately via the kill signal (no opportunity to shut down).
   *
   * This is a beta field and requires enabling ProbeTerminationGracePeriod feature gate.
   *
   * @minimum 1
   */
  terminationGracePeriodSeconds?: number;

  /**
   * Duration after which the probe times out.
   *
   * More info: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes
   *
   * @default 1
   * @minimum 1
   */
  timeoutSeconds?: number;
}
