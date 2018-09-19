/**
 * check-auth.js: VP global middleware (all routes and pages) to check for user auth
 */
export default function(ctx) {
  console.log('MW: check-auth');
  const $auth = ctx.app.$auth;

  console.log(ctx, null, 2);

  let isAuthenticated = $auth.isAuthenticated();
  if (isAuthenticated) {
    $auth.parseUserProfile($auth.getUserProfile());

    // Don't stay logged-in if the user isn't with the tenant
    if (!$auth.isWithTenant()) {
      console.log('Not a tenant user, logging out...');
      $auth.signOut();
      return;
    }

    $auth.acquireApiToken();
  }

  // const loggedUser = isServer ? getUserFromCookie(req) : getUserFromLocalStorage();
  // store.commit('SET_USER', loggedUser);
}
