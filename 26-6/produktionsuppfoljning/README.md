# Produktionsuppfoljning

Standalone static Softadmin-style concert production reporting demo. No AI
generation, backend, authentication, or Pegasus data connection. All people,
time entries, expenses and deviations are fictional. The mockup generator in
the parent directory is unchanged.

Open `index.html` directly or visit the directory through the existing web
server. Styles, fonts and the Softadmin logo are reused from the surrounding
repository, so keep this folder in its current location.

## Demo flow

1. Bancroft overview: 32 resources, 736 published hours, 672 current hours.
2. Staffing: search Viktor; inspect 19 reported hours, absence and cancellation.
3. Time: inspect the cancelled concert on September 19.
4. Costs: inspect labor calculations and the instrument expense awaiting approval.
5. Compare productions; select Pintscher to see a missing time report.
6. Select August for the empty state; export the active report as CSV.

Metrics, tables, drill-downs and exports derive from the same records in
`data.js`. Published hours are retained after cancellation. Missing reports are
`null`, not absence. Utilization excludes unreported shifts from the denominator;
it does not represent employment percentage or total resource availability.
Personnel cost includes actual reported hours times fictional loaded hourly
rates plus expenses, including pending expenses. It is not a final forecast.

All fixtures belong to concert operations. The operation selector therefore
returns the same scope for concert operations and all operations. The period
selector offers September, autumn, and an empty August. Resource counts are
distinct people, not summed production staffing counts.

## Verification

`node --test produktionsuppfoljning/data.test.cjs` from the parent directory.

No dependencies or build step. Browser interactions include filters, tabs,
search, sorting, detail dialogs, sidebar collapse, CSV export and print styling.
