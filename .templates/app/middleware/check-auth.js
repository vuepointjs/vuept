export default function({ isServer, store, req, app }) {
  // Nothing to do in certain cases
  if (isServer && !req) return;

  // const loggedUser = isServer ? getUserFromCookie(req) : getUserFromLocalStorage();
  // store.commit('SET_USER', loggedUser);
}
