import assert from "node:assert/strict"
import { test } from "node:test"

import {
  buildDashboardAnalyticsUrl,
  resolveDashboardAnalyticsState,
} from "../lib/dashboard-analytics.ts"

test("dashboard analytics defaults to the overview tab on the dashboard route", () => {
  const state = resolveDashboardAnalyticsState("/dashboard", new URLSearchParams(), new Date("2026-05-06T12:00:00.000Z"))

  assert.equal(state.tab, "overview")
  assert.deepEqual(state.filters, {
    startDate: "2026-04-30",
    endDate: "2026-05-06",
    users: "all",
    departments: "all",
    connections: "all",
  })
})

test("dashboard reports defaults to the attendance tab when no query string is provided", () => {
  const state = resolveDashboardAnalyticsState("/dashboard/reports", new URLSearchParams(), new Date("2026-05-06T12:00:00.000Z"))

  assert.equal(state.tab, "attendance")
  assert.equal(state.filters.startDate, "2026-04-30")
  assert.equal(state.filters.endDate, "2026-05-06")
})

test("dashboard analytics parses and serializes query state for the reports route", () => {
  const state = resolveDashboardAnalyticsState(
    "/dashboard/reports",
    new URLSearchParams(
      "tab=attendance&start=2026-05-01&end=2026-05-06&users=ana-souza&departments=comercial&connections=whatsapp",
    ),
    new Date("2026-05-06T12:00:00.000Z"),
  )

  assert.equal(state.tab, "attendance")
  assert.deepEqual(state.filters, {
    startDate: "2026-05-01",
    endDate: "2026-05-06",
    users: "ana-souza",
    departments: "comercial",
    connections: "whatsapp",
  })
  assert.equal(
    buildDashboardAnalyticsUrl("/dashboard/reports", state),
    "/dashboard/reports?tab=attendance&start=2026-05-01&end=2026-05-06&users=ana-souza&departments=comercial&connections=whatsapp",
  )
})
