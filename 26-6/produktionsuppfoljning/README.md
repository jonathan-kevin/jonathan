# Produktionsuppfoljning

Standalone static concert production reporting demo using Softadmin markup. No AI
generation, backend, authentication, or Pegasus data connection. All people,
time entries, expenses and deviations are fictional. The mockup generator in
the parent directory is unchanged.

Open `index.html` directly or visit the directory through the existing web
server. Styles, fonts and the Softadmin logo are reused from the surrounding
repository, so keep this folder in its current location.

## Presentation

Pegasus's Visa Produktion is the direct visual reference: compact mode
(`saCompact`), sidebar, breadcrumbs, page actions, production InfoSQL,
Detailview tabs and Grid reports. The existing `screen.template.css` supplies
the typography, controls, tables, tabs, KPI values and meters. Local CSS is
limited to standalone shell layout, responsive behavior and report overflow.

The production list is a separate view. A production opens with six tabs:
Uppfoljning, Bemanning, Tid & genomforande, Kostnader, Avvikelser and
Publiceringshistorik. Person, session and expense details open in dialogs.
Use Andra urval to change production, period or operation. Comparison uses
the same reports with all productions selected.

`konserthuset.png` is the logo from the supplied Pegasus reference, bundled
locally for this demo. No live personnel records are included.

Overview meters include the native outer interval arcs and hour labels.
Illustrative thresholds are 75% and 90% of the published plan (red, yellow,
green); these are demo settings, not agreed operational targets. The inner
arc color follows the same thresholds. Hover titles explain each interval.

## Demo flow

1. Bancroft overview: 32 resources, 736 published hours, 672 current hours.
2. Staffing: search Viktor; inspect 19 reported hours, absence and cancellation.
3. Time: inspect the cancelled concert on September 19.
4. Costs: inspect labor calculations and the instrument expense awaiting approval.
5. Compare productions; select Pintscher to see a missing time report.
6. Open Publiceringshistorik to compare publication with subsequent changes.
7. Use Andra urval to select August for the empty state; export the active report.

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
search, sorting, grouping, detail dialogs, sidebar collapse, CSV export and
print styling. The publication history is illustrative and derived from the
fictional publication and cancellation records; it is not a live audit log.
