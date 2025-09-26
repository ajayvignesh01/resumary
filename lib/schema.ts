import { z } from 'zod'

export const phoneNumberSchema = z
  .e164()
  .describe('Phone number in E.164 format. Use US/Canada (+1) if not provided.')

export const addressSchema = z.object({
  streetAddressLine1: z.string().optional().describe('house/building number, street name'),
  streetAddressLine2: z.string().optional().describe('apartment, suite, unit, floor, etc'),
  city: z.string().optional().describe('city, town, village, etc'),
  state: z
    .string()
    .optional()
    .describe(
      'State/Province/Region name followed by state code (ISO 3166-2 format) in parenthesis. For example, Virginia (VA).'
    ),
  postalCode: z.string().optional().describe('Postal code, zip code, etc'),
  country: z
    .string()
    .optional()
    .describe(
      'Country name followed by country code (ISO 3166-1 alpha-2 format) in parenthesis. For example, United States of America (US).'
    )
})

export const shortAddressSchema = z.object({
  city: z.string().optional().describe('city, town, village, etc'),
  state: z
    .string()
    .optional()
    .describe(
      'State/Province/Region name followed by state code (ISO 3166-2 format) in parenthesis. For example, Virginia (VA).'
    ),
  country: z
    .string()
    .optional()
    .describe(
      'Country name followed by country code (ISO 3166-1 alpha-2 format) in parenthesis. For example, United States of America (US).'
    )
})

// define a schema for the notifications
export const resumeSchema = z.object({
  name: z.object({
    firstName: z.string(),
    lastName: z.string()
  }),
  email: z.email().optional(),
  phone: phoneNumberSchema.optional(),
  address: addressSchema.optional(),
  summary: z.string().optional(),
  aiSummary: z
    .string()
    .describe(
      'Based on the provided information, generate a brief summary of the resume. Keep it short and concise.'
    ),
  links: z.object({
    linkedin: z.url().optional(),
    github: z.url().optional(),
    website: z.url().optional(),
    other: z.array(z.url())
  }),
  workExperience: z.array(
    z.object({
      company: z.string(),
      remote: z
        .boolean()
        .optional()
        .describe('If not explicitly stated, it is assumed to be false.'),
      address: addressSchema.optional(),
      position: z.string(),
      startDate: z
        .string()
        .optional()
        .describe('Date in YYYY-MM format. If month is not provided, it is assumed to be January.'),
      endDate: z
        .string()
        .optional()
        .describe(
          'Date in YYYY-MM format. If month is not provided, it is assumed to be December. If end date is not provided, leave it blank.'
        ),
      summary: z.string(),
      skills: z.array(z.string())
    })
  ),
  education: z.array(
    z.object({
      institution: z.string(),
      degree: z.string(),
      field: z.string(),
      specialization: z.string().optional(),
      startDate: z
        .string()
        .optional()
        .describe('Date in YYYY-MM format. If month is not provided, it is assumed to be January.'),
      endDate: z
        .string()
        .optional()
        .describe(
          'Date in YYYY-MM format. If month is not provided, it is assumed to be December. If end date is not provided, leave it blank.'
        ),
      address: shortAddressSchema.optional()
    })
  ),
  certifications: z.array(
    z.object({
      name: z.string(),
      issuer: z.string(),
      issueDate: z
        .string()
        .optional()
        .describe('Date in YYYY-MM format. If month is not provided, it is assumed to be January.'),
      expirationDate: z
        .string()
        .optional()
        .describe('Date in YYYY-MM format. If month is not provided, it is assumed to be December.')
    })
  ),
  skills: z.array(z.string())
})
