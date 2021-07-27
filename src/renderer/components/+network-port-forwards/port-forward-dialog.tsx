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

import "./port-forward-dialog.scss";

import React, { Component } from "react";
import { computed, observable, makeObservable } from "mobx";
import { observer } from "mobx-react";
import { Dialog, DialogProps } from "../dialog";
import { Wizard, WizardStep } from "../wizard";
import { Icon } from "../icon";
import { Input } from "../input";
import { Notifications } from "../notifications";
import { cssNames } from "../../utils";
import { PortForwardItem, portForwardStore } from "./port-forward.store";
import { isNumber } from "../input/input_validators";
  
 interface Props extends Partial<DialogProps> {
 }
 
const dialogState = observable.object({
  isOpen: false,
  data: null as PortForwardItem,
});
 
 @observer
 export class PortForwardDialog extends Component<Props> {
   @observable ready = false;
   @observable currentPort = 0;
   @observable desiredPort = 0;
 
   constructor(props: Props) {
     super(props);
     makeObservable(this);
   }
 
   static open(portForward: PortForwardItem) {
     dialogState.isOpen = true;
     dialogState.data = portForward;
   }
 
   static close() {
     dialogState.isOpen = false;
   }
 
   get portForward() {
     return dialogState.data;
   }
 
   close = () => {
     PortForwardDialog.close();
   };
 
   @computed get scaleMax() {
     const { currentPort } = this;
     const defaultMax = 50;
 
     return currentPort <= defaultMax
       ? defaultMax * 2
       : currentPort * 2;
   }
 
   onOpen = async () => {
     const { portForward } = this;
 
     this.currentPort = +portForward.forwardPort;
     this.desiredPort = this.currentPort;
     this.ready = true;
   };
 
   onClose = () => {
     this.ready = false;
   };
 
   changePort = async () => {
     const { portForward } = this;
     const { currentPort, desiredPort, close } = this;
 
    try {
      if (currentPort !== desiredPort) {
        await portForwardStore.modify(portForward, desiredPort);
      }
      close();
    } catch (err) {
      Notifications.error(err);
    }
  };
 
   renderContents() {
     return (
       <>
        <div className="flex gaps align-center">
          <div className="input-container flex align-center">
            <div className="current-port" data-testid="current-port">
                Current port: {this.currentPort}
            </div>
            <Input
              required autoFocus
              iconLeft="import_export"
              placeholder="Desired port"
              trim
              validators={isNumber}
              onChange={v => this.desiredPort = +v}
            />
          </div>
        </div>
        <div className="warning" data-testid="warning">
          <Icon material="warning"/>
          Current port-forwarding will be removed and a new one will be started
        </div>
      </>
    );
  }
 
   render() {
     const { className, ...dialogProps } = this.props;
     const resourceName = this.portForward ? this.portForward.getName() : "";
     const header = (
       <h5>
         Change Port <span>{resourceName}</span>
       </h5>
     );
 
     return (
       <Dialog
         {...dialogProps}
         isOpen={dialogState.isOpen}
         className={cssNames("PortForwardDialog", className)}
         onOpen={this.onOpen}
         onClose={this.onClose}
         close={this.close}
       >
         <Wizard header={header} done={this.close}>
           <WizardStep
             contentClass="flex gaps column"
             next={this.changePort}
             nextLabel="Change Port"
             disabledNext={!this.ready}
           >
             {this.renderContents()}
           </WizardStep>
         </Wizard>
       </Dialog>
     );
   }
 }
 