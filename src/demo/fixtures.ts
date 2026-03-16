import type { ApiUser, ChatHistoryResponse, ChatTurn, Page } from '@/types/api';
import type { Document, Lease } from '@/types/leaseTypes';
import type { Regulation } from '@/types/regulationTypes';
import type { RawRentalProperty } from '@/types/rentalTypes';

/**
 * Seed data for demo mode.
 *
 * Shapes match the Django serializers in the sibling `bnbu_backend_api` repo
 * exactly, including the parts that are awkward — decimals as strings, the
 * `filtered-list` envelope wrapping an object, the space-separated
 * `document_uploaded_at`. If the fixtures were tidied up, demo mode would stop
 * exercising the code that copes with the real thing.
 */

const page = <T>(results: T[], count = results.length, next: string | null = null): Page<T> => ({
  count,
  next,
  previous: null,
  results,
});

export const DEMO_USER: ApiUser = {
  id: 1,
  email: 'dana.reyes@bnbu.example',
  username: null,
  first_name: 'Dana',
  last_name: 'Reyes',
  user_type: 'admin',
  is_active: true,
  is_first_login: false,
};

export const DEMO_USERS: Page<ApiUser> = page(
  [
    DEMO_USER,
    { id: 2, email: 'sam.owens@bnbu.example', username: null, first_name: 'Sam', last_name: 'Owens', user_type: 'coach', is_active: true },
    { id: 3, email: 'priya.nair@bnbu.example', username: null, first_name: 'Priya', last_name: 'Nair', user_type: 'research', is_active: true },
    { id: 4, email: 'marcus.hale@bnbu.example', username: null, first_name: 'Marcus', last_name: 'Hale', user_type: 'client', is_active: true },
    { id: 5, email: 'lena.fischer@bnbu.example', username: null, first_name: 'Lena', last_name: 'Fischer', user_type: 'customer', is_active: true },
    { id: 6, email: 'tom.alvarez@bnbu.example', username: null, first_name: 'Tom', last_name: 'Alvarez', user_type: 'client', is_active: false },
    { id: 7, email: 'nina.kowalski@bnbu.example', username: null, first_name: 'Nina', last_name: 'Kowalski', user_type: 'customer', is_active: true },
    { id: 8, email: 'ravi.subram@bnbu.example', username: null, first_name: 'Ravi', last_name: 'Subramanian', user_type: 'coach', is_active: true },
    { id: 9, email: 'gio.ferrari@bnbu.example', username: null, first_name: 'Giovanni', last_name: 'Ferrari', user_type: 'client', is_active: true },
    { id: 10, email: 'amara.osei@bnbu.example', username: null, first_name: 'Amara', last_name: 'Osei', user_type: 'research', is_active: true },
  ] as ApiUser[],
  23,
  'http://demo/account/users/?page=2'
);

const DOCUMENTS: Record<number, Document[]> = {
  41: [
    {
      id: 910,
      lease_id: 41,
      name: 'pine_st_lease_v1',
      uploaded_at: '2026-08-28T14:02:10.004512Z',
      status: 'Rejected',
      version: 1,
      file_url: 'https://example.invalid/pine_st_lease_v1.pdf',
    },
    {
      id: 911,
      lease_id: 41,
      name: 'pine_st_lease_v2',
      uploaded_at: '2026-09-02T18:22:41.512345Z',
      status: 'Approved',
      version: 2,
      file_url: 'https://example.invalid/pine_st_lease_v2.pdf',
    },
  ],
  42: [
    {
      id: 921,
      lease_id: 42,
      name: 'cedar_ave_lease_v1',
      uploaded_at: '2026-09-11T09:14:00.000000Z',
      status: 'Draft',
      version: 1,
      file_url: 'https://example.invalid/cedar_ave_lease_v1.pdf',
    },
  ],
  43: [
    {
      id: 931,
      lease_id: 43,
      name: 'harbor_view_lease_v1',
      uploaded_at: '2026-09-15T11:40:00.000000Z',
      status: 'Approved',
      version: 1,
      file_url: 'https://example.invalid/harbor_view_lease_v1.pdf',
    },
  ],
};

export const DEMO_LEASES: Page<Lease> = page(
  [
    { id: 41, date: '2026-09-02', address1: '1200 Pine St', address2: 'Apt 4B', city: 'Seattle', state: 'WA', zip_code: '98101', status: 'Approved', num_of_docs: 2, documents: DOCUMENTS[41] },
    { id: 42, date: '2026-09-11', address1: '88 Cedar Ave', address2: null, city: 'Austin', state: 'TX', zip_code: '78701', status: 'Draft', num_of_docs: 1, documents: DOCUMENTS[42] },
    { id: 43, date: '2026-09-15', address1: '4 Harbor View', address2: 'Unit 12', city: 'Portland', state: 'ME', zip_code: '04101', status: 'Approved', num_of_docs: 1, documents: DOCUMENTS[43] },
    { id: 44, date: '2026-09-18', address1: '2207 Alder Way', address2: null, city: 'Denver', state: 'CO', zip_code: '80206', status: 'Rejected', num_of_docs: 3 },
    { id: 45, date: '2026-09-19', address1: '19 Bayfront Rd', address2: null, city: 'Savannah', state: 'GA', zip_code: '31401', status: 'Draft', num_of_docs: 1 },
    { id: 46, date: '2026-09-20', address1: '640 Juniper Ln', address2: 'Suite 2', city: 'Boise', state: 'ID', zip_code: '83702', status: 'Approved', num_of_docs: 2 },
    { id: 47, date: '2026-09-21', address1: '77 Mission Hill', address2: null, city: 'San Diego', state: 'CA', zip_code: '92103', status: 'Approved', num_of_docs: 1 },
    { id: 48, date: '2026-09-22', address1: '310 Quarry Rd', address2: null, city: 'Asheville', state: 'NC', zip_code: '28801', status: 'Draft', num_of_docs: 1 },
  ],
  14,
  'http://demo/api/leases/?page=2'
);

export const leaseDocuments = (leaseId: number): Document[] => DOCUMENTS[leaseId] ?? [];

const LEASE_ANALYSIS = `**Term and rent**

- Twelve-month term beginning 1 October 2026, renewing month-to-month unless either party gives 60 days' notice.
- Base rent of $2,400, due on the 1st. A flat $75 late fee applies after the 5th (Clause 6).
- Security deposit equals one month's rent and is held in a separate account, returnable within 21 days of vacancy.

**Clauses that affect short-term rental use**

- **Clause 14 prohibits subletting** without prior written consent from the landlord. Consent "shall not be unreasonably withheld", but no timeline is specified — the tenant carries the risk of a slow answer.
- Clause 19 caps occupancy at two people per bedroom plus one, which limits nightly capacity to five on a two-bedroom unit.
- Clause 22 requires the tenant to carry $300,000 of liability coverage and to name the landlord as an additional insured.

**What to negotiate**

1. A written carve-out to Clause 14 covering platform rentals, with a response deadline attached to the consent requirement.
2. A defined quiet-hours window, so Clause 27's open-ended "nuisance" language cannot be read against normal guest turnover.
3. Clarification that the $75 late fee is the sole late charge, since Clause 6 and Clause 31 both mention interest on arrears.`;

export const DEMO_DOCUMENT_CHAT: Record<number, ChatHistoryResponse> = {
  911: {
    document_uploaded_at: '2026-09-02 18:22:41.512345+00:00',
    gpt_response: {
      message: LEASE_ANALYSIS,
      status: 'Approved',
      timestamp: '2026-09-02T18:25:03+00:00',
    },
    chat_history: [
      { role: 'user', content: 'Can I sublet this unit on a nightly basis?', timestamp: '2026-09-02T18:30:00.123456+00:00' },
      {
        role: 'assistant',
        content:
          'Not without written consent. Clause 14 prohibits subletting outright and makes consent a precondition; it does not distinguish nightly stays from a long-term sublet. The clause does say consent "shall not be unreasonably withheld", so a refusal would need a reason — but there is no deadline on the landlord\'s answer, which is the practical problem.',
        timestamp: '2026-09-02T18:30:04.998877+00:00',
      },
      { role: 'user', content: 'What happens if I pay on the 6th?', timestamp: '2026-09-02T18:33:10.000000+00:00' },
      {
        role: 'assistant',
        content:
          'A flat $75 late fee under Clause 6. Note that Clause 31 also refers to interest accruing on arrears at 1% per month — the two are not reconciled in the document, so ask for the late fee to be stated as the only charge.',
        timestamp: '2026-09-02T18:33:15.441233+00:00',
      },
      { role: 'user', content: 'How many guests can stay overnight?', timestamp: '2026-09-02T18:36:02.000000+00:00' },
      {
        role: 'assistant',
        content:
          'Five, on this two-bedroom unit. Clause 19 sets the cap at two people per bedroom plus one. That is the binding number for listing capacity regardless of what the platform allows.',
        timestamp: '2026-09-02T18:36:08.220091+00:00',
      },
    ],
  },
  910: {
    document_uploaded_at: '2026-08-28 14:02:10.004512+00:00',
    gpt_response: {
      message:
        'This version was rejected: Clause 14 prohibited subletting with no consent mechanism at all, and the deposit was not held in a separate account. Both were addressed in version 2.',
      status: 'Rejected',
      timestamp: '2026-08-28T14:06:00+00:00',
    },
    chat_history: [],
  },
  921: {
    document_uploaded_at: '2026-09-11 09:14:00.000000+00:00',
    gpt_response: { message: null, status: 'Pending', timestamp: null },
    chat_history: [],
  },
};

const KIRKLAND_ANALYSIS = `**SHORT-TERM RENTALS ALLOWED WITH RESTRICTIONS**

Kirkland permits short-term rentals of fewer than 30 consecutive nights, subject to the conditions below.

- **Owner or authorised agent occupancy** is required for at least 245 days of the calendar year on the parcel being rented.
- A **city business licence** and a separate short-term rental registration are both required before the first booking; the registration number must appear in every listing.
- **Two-unit cap**: no operator may register more than two short-term rental units within city limits.
- Lodging tax is collected at the state level, but the city levies an additional 1% transient occupancy charge remitted quarterly.
- Parking must be provided on-site at one space per bedroom; street parking does not satisfy the requirement in the R-6 and R-8 zones.

**Practical read**

The occupancy requirement is the binding constraint: a pure investment property with no owner presence does not qualify. An owner-occupied unit with a rented accessory dwelling is the pattern that fits the ordinance most cleanly.`;

export const DEMO_REGULATIONS: Page<Regulation> = page(
  [
    {
      id: 17,
      date: '2026-09-02',
      search: 'Kirkland, WA',
      status: 'STR Allowed with Restrictions',
      gpt_response: { status: 'STR Allowed with Restrictions', message: KIRKLAND_ANALYSIS, created_time: '2026-09-02T18:05:12.441233+00:00' },
      chat_history: [
        { role: 'user', content: 'Does the occupancy rule apply to tenants as well as owners?', timestamp: '2026-09-02T19:01:00.000123+00:00' },
        { role: 'assistant', content: 'No. The ordinance names the owner or an authorised agent. A tenant operating a sublet does not satisfy the 245-day requirement, and the registration would be refused.', timestamp: '2026-09-02T19:01:06.220091+00:00' },
      ],
    },
    { id: 18, date: '2026-09-05', search: 'Austin, TX', status: 'STR Allowed with Restrictions', gpt_response: { status: 'STR Allowed with Restrictions', message: 'Type 1 (owner-occupied) licences are issued without a density cap. Type 2 (non-owner-occupied) licences are capped by census tract and most central tracts are at their limit.', created_time: '2026-09-05T10:11:00+00:00' }, chat_history: [] },
    { id: 19, date: '2026-09-08', search: 'Santa Monica, CA', status: 'STR Not Allowed', gpt_response: { status: 'STR Not Allowed', message: 'Whole-home rentals under 30 days are prohibited. Home-sharing with the host present is permitted under a separate licence.', created_time: '2026-09-08T09:30:00+00:00' }, chat_history: [] },
    { id: 20, date: '2026-09-12', search: 'Gatlinburg, TN', status: 'STR Allowed', gpt_response: { status: 'STR Allowed', message: 'Permitted in all residential zones with a city permit and an annual fire inspection. No density cap and no owner-occupancy requirement.', created_time: '2026-09-12T15:45:00+00:00' }, chat_history: [] },
    { id: 21, date: '2026-09-14', search: 'Maricopa County, AZ', status: 'STR Allowed', gpt_response: { status: 'STR Allowed', message: 'State law pre-empts local bans. Counties may require registration and an emergency contact, which Maricopa does.', created_time: '2026-09-14T12:00:00+00:00' }, chat_history: [] },
    { id: 22, date: '2026-09-17', search: '1200 Pine St, Seattle, WA', status: 'STR Allowed with Restrictions', gpt_response: { status: 'STR Allowed with Restrictions', message: 'Seattle caps most operators at two units, one of which must be a primary residence. This parcel sits in the Downtown Urban Center, which is exempt from the cap.', created_time: '2026-09-17T08:20:00+00:00' }, chat_history: [] },
    { id: 23, date: '2026-09-20', search: 'Asheville, NC', status: 'STR Not Allowed', gpt_response: { status: 'STR Not Allowed', message: 'Whole-house short-term rentals are prohibited in residential districts. Homestays with the owner present are allowed by permit.', created_time: '2026-09-20T16:02:00+00:00' }, chat_history: [] },
    { id: 24, date: '2026-09-22', search: 'Savannah, GA', status: 'pending', gpt_response: null, chat_history: [] },
  ],
  19,
  'http://demo/api/regulations/?page=2'
);

export const DEMO_REGULATION_CHAT: Record<number, ChatHistoryResponse> = {
  17: {
    gpt_response: {
      message: KIRKLAND_ANALYSIS,
      status: 'STR Allowed with Restrictions',
      timestamp: '2026-09-02T18:05:12.441233+00:00',
    },
    chat_history: DEMO_REGULATIONS.results[0].chat_history as ChatTurn[],
  },
};

/**
 * Priced listings. Decimals are strings, exactly as DRF sends them — this is
 * what the data layer's `normaliseRentalProperty` exists to absorb.
 */
export const DEMO_PROPERTIES: RawRentalProperty[] = [
  { id: 128, created_at: '2026-09-18T18:22:41.512345Z', created_at_formatted: 'September 18, 2026', location: '1200 Pine St, Seattle, WA 98101', rent: 2400, no_of_bedrooms: 2, no_of_bathrooms: 1, square_feet: 980, utilities: '350.00', adr: '245.00', occupancy_rate: '0.72', property_zillow_link: 'https://www.zillow.com/homes/1200-Pine-St-Seattle', property_status: 'Approved', yearly_rent_cost_util: '33000.00', yearly_projected_revenue: 64000, monthly_estimated_profit: '1850.00', batch_id: 7 },
  { id: 129, created_at: '2026-09-18T18:22:42.000000Z', created_at_formatted: 'September 18, 2026', location: '88 Cedar Ave, Austin, TX 78701', rent: 1980, no_of_bedrooms: 2, no_of_bathrooms: 2, square_feet: 1120, utilities: '290.00', adr: '212.00', occupancy_rate: '0.68', property_zillow_link: 'https://www.zillow.com/homes/88-Cedar-Ave-Austin', property_status: 'Approved', yearly_rent_cost_util: '27240.00', yearly_projected_revenue: 52600, monthly_estimated_profit: '2113.00', batch_id: 7 },
  { id: 130, created_at: '2026-09-18T18:22:43.000000Z', created_at_formatted: 'September 18, 2026', location: '4 Harbor View, Portland, ME 04101', rent: 2750, no_of_bedrooms: 3, no_of_bathrooms: 2, square_feet: 1450, utilities: '410.00', adr: '318.00', occupancy_rate: '0.61', property_zillow_link: 'https://www.zillow.com/homes/4-Harbor-View-Portland', property_status: 'Approved', yearly_rent_cost_util: '37920.00', yearly_projected_revenue: 70800, monthly_estimated_profit: '2740.00', batch_id: 7 },
  { id: 131, created_at: '2026-09-18T18:22:44.000000Z', created_at_formatted: 'September 18, 2026', location: '2207 Alder Way, Denver, CO 80206', rent: 3100, no_of_bedrooms: 3, no_of_bathrooms: 2, square_feet: 1600, utilities: '460.00', adr: '268.00', occupancy_rate: '0.54', property_zillow_link: 'https://www.zillow.com/homes/2207-Alder-Way-Denver', property_status: 'Rejected', yearly_rent_cost_util: '42720.00', yearly_projected_revenue: 52800, monthly_estimated_profit: '-826.00', batch_id: 7 },
  { id: 132, created_at: '2026-09-18T18:22:45.000000Z', created_at_formatted: 'September 18, 2026', location: '19 Bayfront Rd, Savannah, GA 31401', rent: 1850, no_of_bedrooms: 2, no_of_bathrooms: 1, square_feet: 900, utilities: '275.00', adr: '198.00', occupancy_rate: '0.74', property_zillow_link: 'https://www.zillow.com/homes/19-Bayfront-Rd-Savannah', property_status: 'Approved', yearly_rent_cost_util: '25500.00', yearly_projected_revenue: 53400, monthly_estimated_profit: '2325.00', batch_id: 7 },
  { id: 133, created_at: '2026-09-18T18:22:46.000000Z', created_at_formatted: 'September 18, 2026', location: '640 Juniper Ln, Boise, ID 83702', rent: 1700, no_of_bedrooms: 2, no_of_bathrooms: 1, square_feet: 1020, utilities: '240.00', adr: '164.00', occupancy_rate: '0.66', property_zillow_link: 'https://www.zillow.com/homes/640-Juniper-Ln-Boise', property_status: 'Approved', yearly_rent_cost_util: '23280.00', yearly_projected_revenue: 39500, monthly_estimated_profit: '1351.00', batch_id: 7 },
  { id: 134, created_at: '2026-09-18T18:22:47.000000Z', created_at_formatted: 'September 18, 2026', location: '77 Mission Hill, San Diego, CA 92103', rent: 3400, no_of_bedrooms: 3, no_of_bathrooms: 2, square_feet: 1380, utilities: '480.00', adr: '352.00', occupancy_rate: '0.69', property_zillow_link: 'https://www.zillow.com/homes/77-Mission-Hill-San-Diego', property_status: 'Approved', yearly_rent_cost_util: '46560.00', yearly_projected_revenue: 88600, monthly_estimated_profit: '3503.00', batch_id: 7 },
  { id: 135, created_at: '2026-09-18T18:22:48.000000Z', created_at_formatted: 'September 18, 2026', location: '310 Quarry Rd, Asheville, NC 28801', rent: 2150, no_of_bedrooms: 2, no_of_bathrooms: 2, square_feet: 1180, utilities: '320.00', adr: '206.00', occupancy_rate: '0.58', property_zillow_link: 'https://www.zillow.com/homes/310-Quarry-Rd-Asheville', property_status: 'Rejected', yearly_rent_cost_util: '29640.00', yearly_projected_revenue: 43600, monthly_estimated_profit: '1163.00', batch_id: 7 },
  { id: 136, created_at: '2026-09-18T18:22:49.000000Z', created_at_formatted: 'September 18, 2026', location: '505 Lakeshore Dr, Gatlinburg, TN 37738', rent: 1600, no_of_bedrooms: 3, no_of_bathrooms: 2, square_feet: 1500, utilities: '260.00', adr: '289.00', occupancy_rate: '0.81', property_zillow_link: 'https://www.zillow.com/homes/505-Lakeshore-Dr-Gatlinburg', property_status: 'Approved', yearly_rent_cost_util: '22320.00', yearly_projected_revenue: 85400, monthly_estimated_profit: '5257.00', batch_id: 7 },
  { id: 137, created_at: '2026-09-18T18:22:50.000000Z', created_at_formatted: 'September 18, 2026', location: '12 Rill Court, Scottsdale, AZ 85251', rent: 2900, no_of_bedrooms: 3, no_of_bathrooms: 2, square_feet: 1710, utilities: '395.00', adr: '301.00', occupancy_rate: '0.63', property_zillow_link: 'https://www.zillow.com/homes/12-Rill-Court-Scottsdale', property_status: 'Approved', yearly_rent_cost_util: '39540.00', yearly_projected_revenue: 69200, monthly_estimated_profit: '2471.00', batch_id: 7 },
  { id: 138, created_at: '2026-09-12T10:00:00.000000Z', created_at_formatted: 'September 12, 2026', location: '3 Willow Bend, Nashville, TN 37203', rent: 2300, no_of_bedrooms: 2, no_of_bathrooms: 2, square_feet: 1090, utilities: '330.00', adr: '241.00', occupancy_rate: '0.70', property_zillow_link: 'https://www.zillow.com/homes/3-Willow-Bend-Nashville', property_status: 'Approved', yearly_rent_cost_util: '31560.00', yearly_projected_revenue: 61600, monthly_estimated_profit: '2503.00', batch_id: 6 },
  { id: 139, created_at: '2026-09-12T10:00:01.000000Z', created_at_formatted: 'September 12, 2026', location: '441 Highgate Rd, Burlington, VT 05401', rent: 1950, no_of_bedrooms: 2, no_of_bathrooms: 1, square_feet: 940, utilities: '380.00', adr: null, occupancy_rate: null, property_zillow_link: 'https://www.zillow.com/homes/441-Highgate-Rd-Burlington', property_status: 'Error', yearly_rent_cost_util: '27960.00', yearly_projected_revenue: null, monthly_estimated_profit: null, batch_id: 6 },
];

export const DEMO_BATCH_IDS = [7, 6, 5];

export const DEMO_CSV = [
  'location,rent,bedrooms,adr,occupancy,monthly_estimated_profit,status',
  ...DEMO_PROPERTIES.map((property) =>
    [
      `"${property.location}"`,
      property.rent ?? '',
      property.no_of_bedrooms ?? '',
      property.adr ?? '',
      property.occupancy_rate ?? '',
      property.monthly_estimated_profit ?? '',
      property.property_status,
    ].join(',')
  ),
].join('\n');
