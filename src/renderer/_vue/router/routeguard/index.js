import { userStore } from "../../../../common/user-store"

export function whatsNew() {
  if(userStore.hasNewAppVersion){
    console.log("router: guard: whatsNew: activated");
    return {
      path: '/whats-new'
    }
  }
}
