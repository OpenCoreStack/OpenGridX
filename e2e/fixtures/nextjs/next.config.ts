import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';

// No aliases: since 3.6 the optional export peers (exceljs, jspdf) need none (docs/features/nextjs.md).
//
// Test isolation only, not something apps need: this fixture lives inside the OpenGridX repository,
// whose own node_modules has exceljs. Turbopack would otherwise resolve it from that parent folder
// and the "peer not installed" case would never be tested.
const nextConfig: NextConfig = {
    turbopack: { root: dirname(fileURLToPath(import.meta.url)) },
};

export default nextConfig;
