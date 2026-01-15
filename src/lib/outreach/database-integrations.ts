/**
 * External Database Integrations for Mass Business Discovery
 * 
 * This module provides integration with multiple external data sources for discovering
 * and importing business leads at scale (200+ at a time).
 * 
 * Supported sources:
 * - Google Places API (find local businesses)
 * - Apollo.io (B2B contact database)
 * - Hunter.io (email finder and verification)
 * - Data.gov (nonprofit and government data)
 * - IRS Nonprofit Database (501c3 organizations)
 */

import { Prospect } from '@prisma/client';
import { prisma } from '@/lib/prisma';

// ============================================================================
// GOOGLE PLACES API INTEGRATION
// ============================================================================

interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  business_status?: string;
  types: string[];
  formatted_phone_number?: string;
  website?: string;
}

interface GooglePlacesSearchParams {
  query?: string;
  location?: string; // "Louisville, KY"
  radius?: number; // meters, max 50000
  type?: string; // e.g., "nonprofit_organization", "school", "church"
  keyword?: string;
  maxResults?: number; // How many to fetch (we'll support 200+)
}

/**
 * Search Google Places API for businesses matching criteria
 * Supports bulk fetching with pagination
 */
export async function searchGooglePlaces(params: GooglePlacesSearchParams): Promise<GooglePlaceResult[]> {
  // Support both env var names for flexibility
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error('Google API key not configured. Set GOOGLE_MAPS_API_KEY or GOOGLE_PLACES_API_KEY');
  }

  const maxResults = params.maxResults || 200;
  const results: GooglePlaceResult[] = [];
  let pageToken: string | undefined = undefined;

  // Google Places returns max 60 results (20 per page, 3 pages)
  // We'll make multiple different queries to get 200+ results
  const queries = generateSearchQueries(params);

  for (const query of queries) {
    if (results.length >= maxResults) break;

    let pagesForThisQuery = 0;
    pageToken = undefined;

    do {
      const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
      url.searchParams.set('key', apiKey);
      if (query) url.searchParams.set('query', query);
      if (params.type) url.searchParams.set('type', params.type);
      if (pageToken) url.searchParams.set('pagetoken', pageToken);

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        console.error('Google Places API error:', data);
        break;
      }

      if (data.results && Array.isArray(data.results)) {
        results.push(...data.results);
      }

      pageToken = data.next_page_token;
      pagesForThisQuery++;

      // Wait 2 seconds before next page (Google requirement)
      if (pageToken && pagesForThisQuery < 3) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } while (pageToken && pagesForThisQuery < 3 && results.length < maxResults);
  }

  return results.slice(0, maxResults);
}

/**
 * Generate multiple search queries to maximize results
 */
function generateSearchQueries(params: GooglePlacesSearchParams): string[] {
  const baseQuery = params.query || '';
  const location = params.location || 'Louisville, KY';

  if (params.query) {
    return [params.query]; // Use exact query if provided
  }

  // Generate variations to get more results
  const categories = [
    'nonprofit organizations',
    'charities',
    'community organizations',
    'foundations',
    'associations',
    'churches',
    'schools',
    'educational institutions',
    'health organizations',
    'arts organizations',
  ];

  return categories.map(cat => `${cat} in ${location}`);
}

/**
 * Get detailed place information including website, phone, etc.
 */
export async function getPlaceDetails(placeId: string): Promise<any> {
  // Support both env var names for flexibility
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error('Google API key not configured. Set GOOGLE_MAPS_API_KEY or GOOGLE_PLACES_API_KEY');
  }

  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
  url.searchParams.set('key', apiKey);
  url.searchParams.set('place_id', placeId);
  url.searchParams.set('fields', 'name,formatted_phone_number,website,formatted_address,geometry,rating,user_ratings_total,business_status,types,opening_hours,reviews');

  const response = await fetch(url.toString());
  const data = await response.json();

  if (data.status !== 'OK') {
    throw new Error(`Failed to fetch place details: ${data.status}`);
  }

  return data.result;
}

// ============================================================================
// APOLLO.IO INTEGRATION (B2B Contact Database)
// ============================================================================

interface ApolloSearchParams {
  organizationIds?: string[];
  organizationNames?: string[];
  organizationLocations?: string[];
  organizationIndustryTagIds?: string[];
  personTitles?: string[]; // "Executive Director", "CEO", "Founder"
  personSeniorities?: string[]; // "owner", "c_suite"
  organizationNumEmployeesRanges?: string[]; // "1,10", "11,50"
  page?: number;
  perPage?: number; // Max 200
}

interface ApolloOrganization {
  id: string;
  name: string;
  website_url: string;
  blog_url?: string;
  angellist_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  facebook_url?: string;
  primary_phone?: {
    number: string;
  };
  languages?: string[];
  alexa_ranking?: number;
  phone?: string;
  linkedin_uid?: string;
  founded_year?: number;
  publicly_traded_symbol?: string;
  publicly_traded_exchange?: string;
  logo_url?: string;
  crunchbase_url?: string;
  primary_domain?: string;
  industry?: string;
  keywords?: string[];
  estimated_num_employees?: number;
  snippets_loaded?: boolean;
  industry_tag_id?: string;
  retail_location_count?: number;
  raw_address?: string;
  street_address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  owned_by_organization_id?: string;
  suborganizations?: any[];
  num_suborganizations?: number;
  seo_description?: string;
  short_description?: string;
  annual_revenue_printed?: string;
  annual_revenue?: number;
  total_funding?: number;
  latest_funding_round_date?: string;
  latest_funding_stage?: string;
  technology_names?: string[];
  current_technologies?: any[];
}

interface ApolloPerson {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  linkedin_url?: string;
  title?: string;
  email?: string;
  email_status?: string;
  photo_url?: string;
  twitter_url?: string;
  github_url?: string;
  facebook_url?: string;
  organization_id?: string;
  organization?: ApolloOrganization;
  phone_numbers?: Array<{
    raw_number: string;
    sanitized_number?: string;
    type?: string;
    position?: number;
    status?: string;
  }>;
}

/**
 * Search Apollo.io for organizations and contacts
 * Note: Requires Apollo.io API key and paid plan for bulk operations
 */
export async function searchApollo(params: ApolloSearchParams): Promise<{ people: ApolloPerson[]; organizations: ApolloOrganization[] }> {
  const apiKey = process.env.APOLLO_API_KEY;
  if (!apiKey) {
    throw new Error('APOLLO_API_KEY not configured. Get one at https://apollo.io');
  }

  const url = 'https://api.apollo.io/v1/mixed_people/search';
  const perPage = params.perPage || 200; // Apollo supports up to 200 per page
  const page = params.page || 1;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'X-Api-Key': apiKey,
    },
    body: JSON.stringify({
      ...params,
      per_page: perPage,
      page,
    }),
  });

  if (!response.ok) {
    throw new Error(`Apollo API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return {
    people: data.people || [],
    organizations: data.organizations || [],
  };
}

// ============================================================================
// HUNTER.IO INTEGRATION (Email Finder & Verification)
// ============================================================================

interface HunterDomainSearchParams {
  domain: string;
  type?: 'personal' | 'generic';
  limit?: number; // Max 100
  offset?: number;
}

interface HunterEmail {
  value: string;
  type: string;
  confidence: number;
  first_name?: string;
  last_name?: string;
  position?: string;
  seniority?: string;
  department?: string;
  linkedin?: string;
  twitter?: string;
  phone_number?: string;
  verification?: {
    date: string;
    status: 'valid' | 'invalid' | 'accept_all' | 'webmail' | 'disposable' | 'unknown';
  };
}

/**
 * Find email addresses for a domain using Hunter.io
 */
export async function findEmailsForDomain(params: HunterDomainSearchParams): Promise<HunterEmail[]> {
  const apiKey = process.env.HUNTER_API_KEY;
  if (!apiKey) {
    throw new Error('HUNTER_API_KEY not configured. Get one at https://hunter.io');
  }

  const url = new URL('https://api.hunter.io/v2/domain-search');
  url.searchParams.set('domain', params.domain);
  url.searchParams.set('api_key', apiKey);
  if (params.type) url.searchParams.set('type', params.type);
  if (params.limit) url.searchParams.set('limit', params.limit.toString());
  if (params.offset) url.searchParams.set('offset', params.offset.toString());

  const response = await fetch(url.toString());
  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Hunter.io API error: ${data.errors?.[0]?.details || response.statusText}`);
  }

  return data.data?.emails || [];
}

/**
 * Verify a single email address
 */
export async function verifyEmail(email: string): Promise<{
  result: 'deliverable' | 'undeliverable' | 'risky' | 'unknown';
  score: number;
  email: string;
  regexp: boolean;
  gibberish: boolean;
  disposable: boolean;
  webmail: boolean;
  mx_records: boolean;
  smtp_server: boolean;
  smtp_check: boolean;
  accept_all: boolean;
  block: boolean;
}> {
  const apiKey = process.env.HUNTER_API_KEY;
  if (!apiKey) {
    throw new Error('HUNTER_API_KEY not configured');
  }

  const url = new URL('https://api.hunter.io/v2/email-verifier');
  url.searchParams.set('email', email);
  url.searchParams.set('api_key', apiKey);

  const response = await fetch(url.toString());
  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Hunter.io verification error: ${data.errors?.[0]?.details || response.statusText}`);
  }

  return data.data;
}

// ============================================================================
// IRS NONPROFIT DATABASE (Public 501c3 Organizations)
// ============================================================================

interface IRSNonprofitSearchParams {
  state?: string;
  city?: string;
  nteeCode?: string; // National Taxonomy of Exempt Entities code
  limit?: number;
}

interface IRSNonprofit {
  EIN: string;
  NAME: string;
  ICO?: string; // In Care Of Name
  STREET?: string;
  CITY?: string;
  STATE?: string;
  ZIP?: string;
  GROUP_EXEMPTION_NUMBER?: string;
  SUBSECTION_CODE?: string;
  AFFILIATION_CODE?: string;
  CLASSIFICATION_CODE?: string;
  RULING_DATE?: string;
  DEDUCTIBILITY_CODE?: string;
  FOUNDATION_CODE?: string;
  ACTIVITY_CODE?: string;
  ORGANIZATION_CODE?: string;
  EXEMPT_ORGANIZATION_STATUS_CODE?: string;
  TAX_PERIOD?: string;
  ASSET_CODE?: string;
  INCOME_CODE?: string;
  FILING_REQUIREMENT_CODE?: string;
  PF_FILING_REQUIREMENT_CODE?: string;
  ACCOUNTING_PERIOD?: string;
  ASSET_AMOUNT?: number;
  INCOME_AMOUNT?: number;
  REVENUE_AMOUNT?: number;
  NTEE_CODE?: string;
  SORT_NAME?: string;
}

/**
 * Search IRS nonprofit database (this is a free public dataset)
 * Data source: https://www.irs.gov/charities-non-profits/exempt-organizations-business-master-file-extract-eo-bmf
 */
export async function searchIRSNonprofits(params: IRSNonprofitSearchParams): Promise<IRSNonprofit[]> {
  // Note: The IRS provides this as a downloadable CSV file
  // For production, you'd want to:
  // 1. Download the full dataset periodically
  // 2. Import it into your database
  // 3. Query it locally for much faster searches
  
  // For now, we'll provide a placeholder that explains the process
  console.warn('IRS Nonprofit search requires local database import');
  console.warn('Download from: https://www.irs.gov/charities-non-profits/exempt-organizations-business-master-file-extract-eo-bmf');
  
  return [];
}

// ============================================================================
// BULK IMPORT FUNCTIONS
// ============================================================================

/**
 * Import Google Places results into Prospects table
 */
export async function importGooglePlacesToProspects(places: GooglePlaceResult[]): Promise<{
  imported: number;
  skipped: number;
  errors: string[];
}> {
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const place of places) {
    try {
      // Check if already exists
      const existing = await prisma.prospect.findUnique({
        where: { googlePlaceId: place.place_id },
      });

      if (existing) {
        skipped++;
        continue;
      }

      // Get detailed information
      const details = await getPlaceDetails(place.place_id);

      // Parse address
      const addressParts = (place.formatted_address || '').split(', ');
      const city = addressParts[addressParts.length - 3] || '';
      const stateZip = addressParts[addressParts.length - 2] || '';
      const state = stateZip.split(' ')[0] || '';
      const zipCode = stateZip.split(' ')[1] || '';

      await prisma.prospect.create({
        data: {
          name: place.name,
          company: place.name,
          phone: details.formatted_phone_number || '',
          address: place.formatted_address,
          city,
          state,
          zipCode,
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
          googlePlaceId: place.place_id,
          googleRating: place.rating,
          googleReviews: place.user_ratings_total,
          websiteUrl: details.website || '',
          hasWebsite: !!details.website,
          source: 'GOOGLE_PLACES',
          discoveryMetadata: {
            types: place.types,
            business_status: place.business_status,
            place_id: place.place_id,
          },
          category: categorizeFromTypes(place.types),
          status: 'PROSPECT',
        },
      });

      imported++;
    } catch (error) {
      errors.push(`Failed to import ${place.name}: ${error}`);
    }
  }

  return { imported, skipped, errors };
}

/**
 * Categorize business based on Google Places types
 */
function categorizeFromTypes(types: string[]): string {
  const categoryMap: Record<string, string> = {
    'church': 'Religious',
    'synagogue': 'Religious',
    'mosque': 'Religious',
    'school': 'Education',
    'university': 'Education',
    'library': 'Education',
    'hospital': 'Healthcare',
    'doctor': 'Healthcare',
    'dentist': 'Healthcare',
    'pharmacy': 'Healthcare',
    'museum': 'Arts & Culture',
    'art_gallery': 'Arts & Culture',
    'restaurant': 'Food & Beverage',
    'cafe': 'Food & Beverage',
    'bar': 'Food & Beverage',
    'store': 'Retail',
    'shopping_mall': 'Retail',
    'gym': 'Fitness',
    'spa': 'Wellness',
  };

  for (const type of types) {
    if (categoryMap[type]) {
      return categoryMap[type];
    }
  }

  return 'Other';
}

/**
 * Import Apollo results into Prospects
 */
export async function importApolloToProspects(apolloData: { people: ApolloPerson[]; organizations: ApolloOrganization[] }): Promise<{
  imported: number;
  skipped: number;
  errors: string[];
}> {
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const org of apolloData.organizations) {
    try {
      // Check if already exists by website
      if (org.website_url) {
        const existing = await prisma.prospect.findFirst({
          where: { websiteUrl: org.website_url },
        });

        if (existing) {
          skipped++;
          continue;
        }
      }

      // Find best contact person
      const contact = apolloData.people.find(p => p.organization_id === org.id);

      await prisma.prospect.create({
        data: {
          name: contact?.name || org.name,
          company: org.name,
          email: contact?.email || '',
          phone: contact?.phone_numbers?.[0]?.sanitized_number || org.primary_phone?.number || '',
          address: org.raw_address || org.street_address || '',
          city: org.city || '',
          state: org.state || '',
          zipCode: org.postal_code || '',
          websiteUrl: org.website_url,
          hasWebsite: !!org.website_url,
          annualRevenue: org.annual_revenue || undefined,
          employeeCount: org.estimated_num_employees || undefined,
          source: 'APOLLO',
          discoveryMetadata: {
            apollo_org_id: org.id,
            industry: org.industry,
            founded_year: org.founded_year,
            linkedin_url: org.linkedin_url,
            contact_title: contact?.title,
            contact_linkedin: contact?.linkedin_url,
          },
          category: org.industry || 'Other',
          status: 'PROSPECT',
        },
      });

      imported++;
    } catch (error) {
      errors.push(`Failed to import ${org.name}: ${error}`);
    }
  }

  return { imported, skipped, errors };
}
