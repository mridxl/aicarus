import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// All routes are public except the /dashboard, /create, /join and /qa routes
const isprivate = createRouteMatcher([
  "/dashboard(.*)",
  "/create(.*)",
  "/join(.*)",
  "/qa(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (isprivate(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
