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
import { getDiForUnitTesting as getRendererDi } from "../renderer/components/getDiForUnitTesting";
import { getDiForUnitTesting as getMainDi } from "../main/getDiForUnitTesting";
import { overrideIpcBridge } from "./override-ipc-bridge";

export const getDisForUnitTesting = ({ doGeneralOverrides } = { doGeneralOverrides: false }) => {
  const rendererDi = getRendererDi({ doGeneralOverrides });
  const mainDi = getMainDi({ doGeneralOverrides });

  overrideIpcBridge({ rendererDi, mainDi });

  return {
    rendererDi,
    mainDi,
    runSetups: () => Promise.all([rendererDi.runSetups(), mainDi.runSetups()]),
  };
};
