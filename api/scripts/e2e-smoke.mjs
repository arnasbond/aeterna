/** Gilus API smoke testas — paleisti: node scripts/e2e-smoke.mjs [baseUrl] */
const base = (process.argv[2] || "http://127.0.0.1:4000").replace(/\/$/, "");
const demoParish =
  "parish-vilniaus-sv-vyskupo-stanislovo-ir-sv-vladislovo-arkikatedros-baz";
const ts = Date.now();
const testEmail = `e2e-${ts}@aeterna.test`;

let passed = 0;
let failed = 0;

function ok(name) {
  passed++;
  console.log(`  ✓ ${name}`);
}
function fail(name, detail) {
  failed++;
  console.error(`  ✗ ${name}: ${detail}`);
}

async function json(path, init) {
  const r = await fetch(`${base}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  const text = await r.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: r.status, body };
}

async function run() {
  console.log(`\n=== AETERNA API smoke @ ${base} ===\n`);

  const health = await fetch(`${base}/health`);
  if (health.ok) ok("GET /health");
  else fail("GET /health", health.status);

  const parishes = await json("/api/v1/parishes");
  if (parishes.status === 200 && parishes.body?.success && Array.isArray(parishes.body.data)) {
    ok(`GET /parishes (${parishes.body.data.length} parapijos)`);
  } else fail("GET /parishes", JSON.stringify(parishes.body).slice(0, 120));

  const memorial = await json("/api/v1/memorials/ona-demo");
  if (memorial.status === 200 && memorial.body?.data?.fullName) ok("GET /memorials/ona-demo");
  else fail("GET /memorials/ona-demo", memorial.status);

  const search = await json("/api/v1/memorials/search?q=ona");
  if (search.status === 200 && search.body?.success) ok("GET /memorials/search");
  else fail("GET /memorials/search", search.status);

  const checkout = await json("/api/v1/checkout", {
    method: "POST",
    body: JSON.stringify({ parishId: demoParish, amountCents: 3900, memorialSlug: "ona-demo" }),
  });
  if (checkout.status === 200 && checkout.body?.data?.serviceFeeCents === 3900) {
    ok("POST /checkout (100% platformai)");
  } else fail("POST /checkout", JSON.stringify(checkout.body).slice(0, 150));

  const reg = await json("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({
      fullName: "E2E Testeris",
      email: testEmail,
      password: "TestPass123!",
      passwordConfirm: "TestPass123!",
    }),
  });
  const token = reg.body?.data?.token;
  if (reg.status === 200 && token) ok("POST /auth/register");
  else fail("POST /auth/register", JSON.stringify(reg.body).slice(0, 150));

  const me = await json("/api/v1/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (me.status === 200 && me.body?.data?.email === testEmail) ok("GET /auth/me");
  else fail("GET /auth/me", me.status);

  const create = await json("/api/v1/user/memorials", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      parishId: demoParish,
      fullName: `E2E Atmintis ${ts}`,
      birthDate: "1940-01-01",
      deathDate: "2020-06-01",
      biography: "Automatinis testas.",
    }),
  });
  const slug = create.body?.data?.slug;
  if (create.status === 200 && slug) ok(`POST /user/memorials → ${slug}`);
  else fail("POST /user/memorials", JSON.stringify(create.body).slice(0, 150));

  if (slug) {
    const prem = await json(`/api/v1/user/memorials/${slug}/premium`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ plan: "yearly" }),
    });
    if (prem.status === 200 && prem.body?.data?.isPremium) ok("POST /user/memorials/:slug/premium");
    else fail("POST /premium", JSON.stringify(prem.body).slice(0, 150));

    const patch = await json(`/api/v1/user/memorials/${slug}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        familyTree: [{ id: "n1", name: "Petras Petraitis", relation: "sūnus" }],
        anniversaryRemindersEnabled: true,
      }),
    });
    if (patch.status === 200 && patch.body?.data?.familyTree?.length === 1) {
      ok("PATCH familyTree + anniversary");
    } else fail("PATCH memorial", JSON.stringify(patch.body).slice(0, 150));

    const loc = await json(`/api/v1/user/memorials/${slug}/location`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ lat: 54.687, lng: 25.279 }),
    });
    if (loc.status === 200 && loc.body?.data?.geoLocation) ok("PATCH location");
    else fail("PATCH location", loc.status);
  }

  const priest = await json("/api/v1/priest/login", {
    method: "POST",
    body: JSON.stringify({ parishId: demoParish, password: "" }),
  });
  const priestToken = priest.body?.data?.token;
  if (priest.status === 200 && priestToken) ok("POST /priest/login");
  else fail("POST /priest/login", JSON.stringify(priest.body).slice(0, 150));

  if (priestToken) {
    const dash = await json("/api/v1/priest/dashboard", {
      headers: { Authorization: `Bearer ${priestToken}` },
    });
    if (dash.status === 200 && dash.body?.data?.finances) ok("GET /priest/dashboard");
    else fail("GET /priest/dashboard", dash.status);

    const masses = await json("/api/v1/priest/masses", {
      headers: { Authorization: `Bearer ${priestToken}` },
    });
    if (masses.status === 200) ok("GET /priest/masses");
    else fail("GET /priest/masses", masses.status);
  }

  const candle = await json("/api/v1/candles/light", {
    method: "POST",
    body: JSON.stringify({
      memorialSlug: "ona-demo",
      donorName: "E2E",
      donationAmountCents: 500,
    }),
  });
  if (candle.status === 200 && candle.body?.success) ok("POST /candles (žvakutė)");
  else fail("POST /candles", JSON.stringify(candle.body).slice(0, 150));

  const admin = await json("/api/v1/admin/login", {
    method: "POST",
    body: JSON.stringify({ password: "" }),
  });
  const adminToken = admin.body?.data?.token;
  if (admin.status === 200 && adminToken) ok("POST /admin/login");
  else fail("POST /admin/login", JSON.stringify(admin.body).slice(0, 150));

  if (adminToken) {
    const summary = await json("/api/v1/admin/summary", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (summary.status === 200) ok("GET /admin/summary");
    else fail("GET /admin/summary", summary.status);
  }

  const map = await json("/api/v1/map");
  if (map.status === 200 && map.body?.data?.deaneries) ok("GET /map");
  else fail("GET /map", map.status);

  console.log(`\n--- Rezultatas: ${passed} OK, ${failed} FAIL ---\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
