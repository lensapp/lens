//-- App readiness checker

import { Router } from "express";

export function readyStateRoute() {
  const router = Router();

  router.route('/ready')
    .get(async (req, res) => {
      const serviceWaitingList: string[] = [];

      res.json(serviceWaitingList);
    });

  return router;
}
