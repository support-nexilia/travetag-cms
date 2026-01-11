import { collections } from '@/lib/mongodb';
import type { AppSettings } from '@/entities/app-settings';

const COLLECTION_NAME = 'app_settings';
const FIXED_ID = 'app_settings'; // ID fisso per il singolo documento

/**
 * Ottiene le impostazioni dell'applicazione
 * Esiste sempre e solo un documento
 */
export async function getAppSettings(): Promise<AppSettings | null> {
  const settings = await collections.db
    .collection(COLLECTION_NAME)
    .findOne({ _id: FIXED_ID as any });
  
  if (!settings) return null;
  
  return {
    ...settings,
    _id: settings._id?.toString(),
  } as AppSettings;
}

/**
 * Aggiorna le impostazioni dell'applicazione
 * Se non esiste, lo crea
 */
export async function updateAppSettings(data: Partial<AppSettings>): Promise<AppSettings> {
  const now = new Date();
  
  // Rimuovi _id dai dati se presente
  const { _id, created_at, ...updateData } = data;
  
  const result = await collections.db
    .collection(COLLECTION_NAME)
    .findOneAndUpdate(
      { _id: FIXED_ID as any },
      {
        $set: {
          ...updateData,
          updated_at: now,
        },
        $setOnInsert: {
          _id: FIXED_ID,
          created_at: now,
        },
      },
      {
        upsert: true,
        returnDocument: 'after',
      }
    );
  
  if (!result) {
    throw new Error('Failed to update app settings');
  }
  
  return {
    ...result,
    _id: result._id?.toString(),
  } as AppSettings;
}

/**
 * Inizializza le impostazioni con valori di default
 * Solo se non esistono
 */
export async function initializeAppSettings(): Promise<AppSettings> {
  const existing = await getAppSettings();
  if (existing) return existing;
  
  const defaultSettings: Partial<AppSettings> = {
    minimum_supported_version: 0,
    main_sections_order: ['main', 'adv', 'chat'],
  };
  
  return await updateAppSettings(defaultSettings);
}
