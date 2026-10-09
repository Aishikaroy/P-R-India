import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("matches a page for /request-service route", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    const matches = router.matchRoutes("/request-service");
    expect(matches.at(-1)?.routeId).toBe("/request-service");
  });

  it("matches a page for /home-icu route", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    const matches = router.matchRoutes("/home-icu");
    expect(matches.at(-1)?.routeId).toBe("/home-icu");
  });

  it("matches a page for /join-team route", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    const matches = router.matchRoutes("/join-team");
    expect(matches.at(-1)?.routeId).toBe("/join-team");
  });

  it("matches a page for /contact route", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    const matches = router.matchRoutes("/contact");
    expect(matches.at(-1)?.routeId).toBe("/contact");
  });

  it("matches a page for /privacy-policy route", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    const matches = router.matchRoutes("/privacy-policy");
    expect(matches.at(-1)?.routeId).toBe("/privacy-policy");
  });

  it("matches a page for /terms route", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    const matches = router.matchRoutes("/terms");
    expect(matches.at(-1)?.routeId).toBe("/terms");
  });

  it("matches a page for /medical-disclaimer route", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    const matches = router.matchRoutes("/medical-disclaimer");
    expect(matches.at(-1)?.routeId).toBe("/medical-disclaimer");
  });

  it("matches a page for /admin/equipment route", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    const matches = router.matchRoutes("/admin/equipment");
    expect(matches.at(-1)?.routeId).toBe("/admin/equipment");
  });

  it("matches a page for /services route", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    const matches = router.matchRoutes("/services");
    expect(matches.at(-1)?.routeId).toBe("/services");
  });

  it("matches a page for /nursing-services route", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    const matches = router.matchRoutes("/nursing-services");
    expect(matches.at(-1)?.routeId).toBe("/nursing-services");
  });

  it("matches a page for /doctor-visits route", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    const matches = router.matchRoutes("/doctor-visits");
    expect(matches.at(-1)?.routeId).toBe("/doctor-visits");
  });

  it("matches a page for /caregiver-services route", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    const matches = router.matchRoutes("/caregiver-services");
    expect(matches.at(-1)?.routeId).toBe("/caregiver-services");
  });

  it("matches a page for /physiotherapy route", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    const matches = router.matchRoutes("/physiotherapy");
    expect(matches.at(-1)?.routeId).toBe("/physiotherapy");
  });

  it("matches a page for /medical-equipment route", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    const matches = router.matchRoutes("/medical-equipment");
    expect(matches.at(-1)?.routeId).toBe("/medical-equipment");
  });
});

