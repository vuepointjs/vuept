/**
 * check-auth.js: VP global middleware (all routes and pages) to check for basic user auth
 */
export default function(ctx) {
  console.log('MW: check-auth');
  ctx.app.$auth.check();
}
