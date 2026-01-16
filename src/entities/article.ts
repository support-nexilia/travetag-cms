import { z } from 'zod';
import { ObjectId } from 'mongodb';

// Article type enum
export const ArticleTypeSchema = z.enum(['REMEMBER', 'BOOK_NOW']);

// Social type enum (reused from author)
export const ProductIdSchema = z.enum([
  'volo', 'hotel', 'vitto', 'biglietti', 'assicurazione', 'altro',
  'volo2', 'hotel2', 'vitto2', 'biglietti2', 'assicurazione2', 'altro2'
]);

// Product schema
export const ProductSchema = z.object({
  id: ProductIdSchema,
  title: z.string(),
  description: z.string(),
  refundable: z.boolean(),
  optional: z.boolean(),
  price_adults: z.number().optional(),
  price_children: z.number().optional(),
  price_couples: z.number().optional(),
  price_newborns: z.number().optional(),
});

// Itinerary Item schema
export const ItineraryItemSchema = z.object({
  order: z.number(),
  title: z.string(),
  content: z.string(), // HTML
});

// Base Article schema (common fields)
const BaseArticleSchema = z.object({
  _id: z.instanceof(ObjectId),
  author_id: z.instanceof(ObjectId),
  namespace: z.string().optional(), // Namespace for multi-tenancy
  title: z.string().min(1),
  subtitle: z.string().optional(),
  description: z.string(),
  image_media_id: z.instanceof(ObjectId).optional(),
  image_hero_media_id: z.instanceof(ObjectId).optional(),
  video_full_media_id: z.instanceof(ObjectId).optional(),
  slug: z.string(),
  type: ArticleTypeSchema,
  tag_ids: z.array(z.instanceof(ObjectId)).default([]),
  category_id: z.number().optional(),
  published: z.boolean().default(false),
  published_date: z.date(),
  created_at: z.date(),
  updated_at: z.date(),
});

// REMEMBER fields
const RememberFieldsSchema = z.object({
  date: z.date().optional(),
  description_HTML: z.string().optional(),
  indicative_price: z.string().optional(),
});

// BOOKING fields
const BookingFieldsSchema = z.object({
  // Dates
  trip_start_at: z.date().optional(),
  trip_end_at: z.date().optional(),
  trip_start_at_description: z.string().optional(),
  trip_end_at_description: z.string().optional(),
  
  // Tour Leader
  tour_leader_id: z.instanceof(ObjectId).optional(),
  
  // Stripe
  stripe_product_id: z.string().optional(),
  stripe_price_id: z.string().optional(),
  
  // Limits
  max_booking_num: z.number().optional(),
  
  // Prices (flat structure)
  price_adults: z.number().optional(),
  price_children: z.number().optional(),
  price_couples: z.number().optional(),
  price_newborns: z.number().optional(),
  
  // Travelers configuration (flat structure)
  travelers_adults_allowed: z.boolean().optional(),
  travelers_adults_min: z.number().optional(),
  travelers_adults_max: z.number().optional(),
  travelers_children_allowed: z.boolean().optional(),
  travelers_children_min: z.number().optional(),
  travelers_children_max: z.number().optional(),
  travelers_couples_allowed: z.boolean().optional(),
  travelers_couples_min: z.number().optional(),
  travelers_couples_max: z.number().optional(),
  travelers_newborns_allowed: z.boolean().optional(),
  travelers_newborns_min: z.number().optional(),
  travelers_newborns_max: z.number().optional(),
  
  // Itinerary image
  itinerary_image_media_id: z.instanceof(ObjectId).optional(),
  
  // Optional products
  optional_products: z.array(ProductSchema).optional(),
  
  // Content sections (8 sections with title + body_HTML)
  trip_in_a_nutshell_title: z.string().optional(),
  trip_in_a_nutshell_body_HTML: z.string().optional(),
  highlights_title: z.string().optional(),
  highlights_body_HTML: z.string().optional(),
  additional_information_title: z.string().optional(),
  additional_information_body_HTML: z.string().optional(),
  how_we_move_title: z.string().optional(),
  how_we_move_body_HTML: z.string().optional(),
  where_we_sleep_title: z.string().optional(),
  where_we_sleep_body_HTML: z.string().optional(),
  not_included_in_the_price_title: z.string().optional(),
  not_included_in_the_price_body_HTML: z.string().optional(),
  included_in_the_price_title: z.string().optional(),
  included_in_the_price_body_HTML: z.string().optional(),
  type_of_trip_title: z.string().optional(),
  type_of_trip_body_HTML: z.string().optional(),
  type_of_trip_items: z.record(z.string()).optional(), // Map {"Comfort": "5", ...}
  
  // Itinerary
  itinerary_items: z.array(ItineraryItemSchema).optional(),
});

// Full Article schema with discriminated union
export const ArticleSchema = z.discriminatedUnion('type', [
  BaseArticleSchema.merge(RememberFieldsSchema).extend({
    type: z.literal('REMEMBER'),
  }),
  BaseArticleSchema.merge(BookingFieldsSchema).extend({
    type: z.literal('BOOK_NOW'),
  }),
]);

// Input schemas (without auto-generated fields)
const BaseCreateArticleSchema = BaseArticleSchema.omit({
  _id: true,
  created_at: true,
  updated_at: true,
});

export const CreateRememberArticleSchema = BaseCreateArticleSchema.merge(RememberFieldsSchema).extend({
  type: z.literal('REMEMBER'),
});

export const CreateBookingArticleSchema = BaseCreateArticleSchema.merge(BookingFieldsSchema).extend({
  type: z.literal('BOOK_NOW'),
});

export const CreateArticleSchema = z.union([
  CreateRememberArticleSchema,
  CreateBookingArticleSchema,
]);

// Update schemas - make base fields partial, keep type literal
const BaseUpdateArticleSchema = BaseCreateArticleSchema.partial();

export const UpdateRememberArticleSchema = BaseUpdateArticleSchema.merge(RememberFieldsSchema.partial()).extend({
  type: z.literal('REMEMBER').optional(),
});

export const UpdateBookingArticleSchema = BaseUpdateArticleSchema.merge(BookingFieldsSchema.partial()).extend({
  type: z.literal('BOOK_NOW').optional(),
});

export const UpdateArticleSchema = z.union([
  UpdateRememberArticleSchema,
  UpdateBookingArticleSchema,
]);

export type Article = z.infer<typeof ArticleSchema>;
export type ArticleType = z.infer<typeof ArticleTypeSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type ProductId = z.infer<typeof ProductIdSchema>;
export type ItineraryItem = z.infer<typeof ItineraryItemSchema>;
export type CreateArticle = z.infer<typeof CreateArticleSchema>;
export type UpdateArticle = z.infer<typeof UpdateArticleSchema>;
