export function auth ( to, from, store ) {
  if(!store.getters.isLoggedIn){
    console.log("router: guard: auth: activated");
    return {
      path: '/login'
    }
  }
}

export function eula ( to, from, store ) {
  if(!store.getters.isEulaAccepted){
    console.log("router: guard: eula: activated");
    return {
      path: '/accept-eula'
    }
  }
}

export function whatsNew( to, from, store ) {
  if(store.getters.showWhatsNew){
    console.log("router: guard: whatsNew: activated");
    return {
      path: '/whats-new'
    }
  }
}
