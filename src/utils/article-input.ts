import { ObjectId } from 'mongodb';

const mediaFields = [
  'image_media_id',
  'image_hero_media_id',
  'video_full_media_id',
  'itinerary_image_media_id',
];

const dateFields = [
  'published_date',
  'date',
  'start_date',
  'end_date',
  'deadline_date',
  'trip_start_at',
  'trip_end_at',
];

const numberFields = [
  'duration_days',
  'min_people',
  'max_people',
  'max_booking_num',
  'travelers_adults_min',
  'travelers_adults_max',
  'travelers_children_min',
  'travelers_children_max',
  'travelers_couples_min',
  'travelers_couples_max',
  'travelers_newborns_min',
  'travelers_newborns_max',
];

const priceFields = [
  'price_adults',
  'price_children',
  'price_couples',
  'price_newborns',
];

const booleanFields = [
  'travelers_adults_allowed',
  'travelers_children_allowed',
  'travelers_couples_allowed',
  'travelers_newborns_allowed',
];

const nullAllowedFields = new Set(mediaFields);

function asObjectId(value: unknown, field: string) {
  if (typeof value !== 'string') return value;
  if (!ObjectId.isValid(value)) {
    const error = new Error(`Invalid ${field}`);
    (error as Error & { name?: string }).name = 'ValidationError';
    throw error;
  }
  return new ObjectId(value);
}

export function normalizeArticleInput(raw: Record<string, unknown>) {
  const data: Record<string, unknown> = { ...raw };
  const nullFields: string[] = [];

  // Track explicit nulls for fields we want to allow clearing
  Object.keys(data).forEach((key) => {
    if (data[key] === null && nullAllowedFields.has(key)) {
      nullFields.push(key);
      delete data[key];
    }
  });

  if (data.author_id) {
    data.author_id = asObjectId(data.author_id, 'author_id');
  }
  if (data.tour_leader_id) {
    data.tour_leader_id = asObjectId(data.tour_leader_id, 'tour_leader_id');
  }
  if (data.category_id && typeof data.category_id === 'string') {
    data.category_id = parseInt(data.category_id, 10);
  }
  if (data.tag_ids && Array.isArray(data.tag_ids)) {
    data.tag_ids = data.tag_ids.map((id) => asObjectId(id, 'tag_ids'));
  }
  mediaFields.forEach((field) => {
    if (data[field] && typeof data[field] === 'string') {
      data[field] = asObjectId(data[field], field);
    }
  });

  dateFields.forEach((field) => {
    if (data[field] && typeof data[field] === 'string') {
      data[field] = new Date(data[field] as string);
    }
  });

  numberFields.forEach((field) => {
    if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
      const parsed = typeof data[field] === 'string'
        ? parseFloat(data[field] as string)
        : data[field];
      data[field] = Number.isNaN(parsed) ? undefined : parsed;
    }
  });

  priceFields.forEach((field) => {
    if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
      const parsed = typeof data[field] === 'string'
        ? parseFloat(data[field] as string)
        : data[field];
      data[field] = Number.isNaN(parsed) ? undefined : Math.round((parsed as number) * 100) / 100;
    }
  });

  booleanFields.forEach((field) => {
    if (data[field] !== undefined) {
      if (typeof data[field] === 'string') {
        data[field] = data[field] === 'true' || data[field] === 'on';
      } else if (typeof data[field] !== 'boolean') {
        data[field] = false;
      }
    }
  });

  if (data.type_of_trip_items && typeof data.type_of_trip_items === 'string') {
    try {
      data.type_of_trip_items = JSON.parse(data.type_of_trip_items as string);
    } catch {
      data.type_of_trip_items = undefined;
    }
  }

  if (data.itinerary_items && Array.isArray(data.itinerary_items)) {
    data.itinerary_items = data.itinerary_items.map((item, index) => {
      const orderValue = item?.order ?? index;
      const parsedOrder = typeof orderValue === 'string' ? parseInt(orderValue, 10) : orderValue;
      return {
        ...item,
        order: Number.isNaN(parsedOrder) ? index : parsedOrder,
      };
    });
  }

  if (data.optional_products && Array.isArray(data.optional_products)) {
    data.optional_products = data.optional_products.map((item) => {
      const refundableRaw = item?.refundable;
      const optionalRaw = item?.optional;
      const refundable = typeof refundableRaw === 'string'
        ? refundableRaw === 'true' || refundableRaw === 'on'
        : typeof refundableRaw === 'boolean'
          ? refundableRaw
          : false;
      const optional = typeof optionalRaw === 'string'
        ? optionalRaw === 'true' || optionalRaw === 'on'
        : typeof optionalRaw === 'boolean'
          ? optionalRaw
          : false;

      const normalizePrice = (value: unknown) => {
        if (value === undefined || value === null || value === '') return undefined;
        const parsed = typeof value === 'string' ? parseFloat(value) : value;
        return Number.isNaN(parsed) ? undefined : Math.round((parsed as number) * 100) / 100;
      };

      return {
        ...item,
        refundable,
        optional,
        price_adults: normalizePrice(item?.price_adults),
        price_children: normalizePrice(item?.price_children),
        price_couples: normalizePrice(item?.price_couples),
        price_newborns: normalizePrice(item?.price_newborns),
      };
    });
  }

  Object.keys(data).forEach((key) => {
    if (data[key] === undefined || data[key] === '') {
      delete data[key];
    }
  });

  return { data, nullFields };
}

export function applyNullFields<T extends Record<string, unknown>>(
  data: T,
  nullFields: string[]
) {
  if (nullFields.length === 0) {
    return data;
  }

  const result = { ...data } as Record<string, unknown>;
  nullFields.forEach((field) => {
    result[field] = null;
  });

  return result as T;
}
