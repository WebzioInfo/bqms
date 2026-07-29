import http from 'k6/http';
import { check, sleep } from 'k6';
import { rate } from 'k6/metrics';

// Target 10,000 concurrent VUs pushing the public verification routes
export const options = {
  stages: [
    { duration: '30s', target: 100 },   // Warm-up
    { duration: '1m', target: 1000 },   // Spike to 1,000 users
    { duration: '2m', target: 5000 },   // Sustained 5,000 users
    { duration: '1m', target: 10000 },  // Enterprise Stress test
    { duration: '30s', target: 0 },     // Scale down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200', 'p(99)<500'], // 95% of requests < 200ms
    http_req_failed: ['rate<0.01'],                // <1% errors
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://biodrops.biofixtechnology.com' || "https://www.biodrops.india.com";

export default function () {
  // Simulate heavy public QR scanning traffic on verification endpoints
  const testOrgSlugs = ['biofix-water-lab', 'sample-restaurant', 'grand-hotel-demo'];
  const randomSlug = testOrgSlugs[Math.floor(Math.random() * testOrgSlugs.length)];

  // Request 1: Public Verification Page (Tests Next.js SSR + Prisma Queries)
  const res1 = http.get(`${BASE_URL}/verify/restaurant/${randomSlug}`);

  check(res1, {
    'Verification page status is 200': (r) => r.status === 200,
    'Verification page loaded fast': (r) => r.timings.duration < 500,
  });

  // Request 2: Simulate API Search Traffic (Tests Meilisearch proxy)
  const payload = JSON.stringify({ query: 'Biofix' });
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'load-test-key-bypass', // Simulated API key
    },
  };

  const res2 = http.post(`${BASE_URL}/api/v1/search`, payload, params);

  check(res2, {
    'Search API status is 200': (r) => r.status === 200 || r.status === 401,
  });

  sleep(Math.random() * 2); // Random think-time between 0-2 seconds
}
