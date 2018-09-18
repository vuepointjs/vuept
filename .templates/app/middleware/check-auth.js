/**
 * check-auth.js: VP global middleware (all routes and pages) to check for user auth
 */
export default function(context) {
  console.log('MW: check-auth');

  let isAuthenticated = context.app.$auth.isAuthenticated();
  // console.log(context, null, 2);

  // const loggedUser = isServer ? getUserFromCookie(req) : getUserFromLocalStorage();
  // store.commit('SET_USER', loggedUser);
}
