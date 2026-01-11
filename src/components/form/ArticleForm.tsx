import { useState } from 'react';
import { ItineraryRepeater } from './ItineraryRepeater';
import { ProductsRepeater } from './ProductsRepeater';
import { TravelersConfig } from './TravelersConfig';
import { TagSelector } from './TagSelector';
import { CategorySelector } from './CategorySelector';
import TypesRepeater from './TypesRepeater';

interface Author {
  _id: string;
  name: string;
}

interface Article {
  _id?: string;
  type: 'REMEMBER' | 'BOOK_NOW';
  title: string;
  subtitle?: string;
  excerpt: string;
  slug: string;
  author_id: string;
  tour_leader_id?: string;
  status: 'DRAFT' | 'PUBLISHED';
  published_date: Date;
  image_hero?: string;
  video_full?: string;
  [key: string]: any;
}

interface Props {
  article?: Article;
  authors: Author[];
  tourLeaders: Author[];
  mode: 'new' | 'edit';
}

export function ArticleForm({ article, authors, tourLeaders, mode }: Props) {
  const [articleType, setArticleType] = useState<'REMEMBER' | 'BOOK_NOW'>(
    article?.type || 'REMEMBER'
  );
  const [travelersConfig, setTravelersConfig] = useState({
    adults: article?.travelers_adults_allowed ?? true,
    children: article?.travelers_children_allowed ?? false,
    couples: article?.travelers_couples_allowed ?? false,
    newborns: article?.travelers_newborns_allowed ?? false,
  });

  const isBookNow = articleType === 'BOOK_NOW';
  const isRemember = articleType === 'REMEMBER';

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (mode === 'new') {
      const slug = e.target.value
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
      (document.getElementById('slug') as HTMLInputElement).value = slug;
    }
  };

  return (
    <form id="articleForm" className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20 space-y-6">
      
      {/* Hidden field for type */}
      <input type="hidden" name="type" value={articleType} />
      
      {/* Tipo Articolo */}
      {mode === 'new' && (
        <div className="border-b pb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo Articolo *
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="REMEMBER"
                checked={articleType === 'REMEMBER'}
                onChange={(e) => setArticleType('REMEMBER')}
                className="w-4 h-4 text-[#FF6B35] border-gray-300 focus:ring-[#FF6B35]"
              />
              <span className="text-sm text-gray-700">Remember (Articolo informativo)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="BOOK_NOW"
                checked={articleType === 'BOOK_NOW'}
                onChange={(e) => setArticleType('BOOK_NOW')}
                className="w-4 h-4 text-[#FF6B35] border-gray-300 focus:ring-[#FF6B35]"
              />
              <span className="text-sm text-gray-700">Book Now (Viaggio prenotabile)</span>
            </label>
          </div>
        </div>
      )}

      {mode === 'edit' && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-sm text-gray-600">
            Tipo Articolo: <span className="font-semibold">{article?.type === 'BOOK_NOW' ? 'Book Now (Viaggio)' : 'Remember (Articolo)'}</span>
            <span className="text-xs text-gray-500 ml-2">(non modificabile)</span>
          </p>
        </div>
      )}

      {/* Campi Base */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Titolo *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            defaultValue={article?.title}
            onChange={handleTitleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
          />
        </div>

        <div className="col-span-2">
          <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-2">
            Sottotitolo
          </label>
          <input
            type="text"
            id="subtitle"
            name="subtitle"
            defaultValue={article?.subtitle}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
          />
        </div>

        <div>
          <label htmlFor="author_id" className="block text-sm font-medium text-gray-700 mb-2">
            Autore *
          </label>
          <select
            id="author_id"
            name="author_id"
            defaultValue={article?.author_id}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
          >
            {mode === 'new' && <option value="">Seleziona autore</option>}
            {authors.map((author) => (
              <option key={author._id} value={author._id}>
                {author.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
            Slug *
          </label>
          <input
            type="text"
            id="slug"
            name="slug"
            defaultValue={article?.slug}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
          />
          {mode === 'new' && (
            <p className="text-xs text-gray-500 mt-1">Generato automaticamente dal titolo</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
          Descrizione Breve *
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          defaultValue={article?.excerpt}
          required
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Descrizione Completa
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={article?.description}
          rows={5}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
            URL Immagine Principale
          </label>
          <input
            type="url"
            id="image"
            name="image"
            defaultValue={article?.image}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
          />
        </div>

        <div>
          <label htmlFor="image_hero" className="block text-sm font-medium text-gray-700 mb-2">
            URL Immagine Hero
          </label>
          <input
            type="url"
            id="image_hero"
            name="image_hero"
            defaultValue={article?.image_hero}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
          />
        </div>

        <div>
          <label htmlFor="video_full" className="block text-sm font-medium text-gray-700 mb-2">
            URL Video
          </label>
          <input
            type="url"
            id="video_full"
            name="video_full"
            defaultValue={article?.video_full}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="published_date" className="block text-sm font-medium text-gray-700 mb-2">
            Data Pubblicazione *
          </label>
          <input
            type="date"
            id="published_date"
            name="published_date"
            defaultValue={article?.published_date ? new Date(article.published_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Stato *
          </label>
          <select
            id="status"
            name="status"
            defaultValue={article?.status || 'DRAFT'}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
          >
            <option value="DRAFT">Bozza</option>
            <option value="PUBLISHED">Pubblicato</option>
          </select>
        </div>
      </div>

      {/* Tags and Categories */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categorie *
          </label>
          <CategorySelector 
            initialSelectedIds={article?.category_ids?.map((id: any) => id.toString()) || []}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags *
          </label>
          <TagSelector 
            initialSelectedIds={article?.tag_ids?.map((id: any) => id.toString()) || []}
          />
        </div>
      </div>

      {/* REMEMBER Fields */}
      {isRemember && (
        <div className="border-t pt-4 space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Campi Remember</h3>
          
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Data Evento
            </label>
            <input
              type="date"
              id="date"
              name="date"
              defaultValue={article?.date ? new Date(article.date).toISOString().split('T')[0] : ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
            />
          </div>

          <div>
            <label htmlFor="indicative_price" className="block text-sm font-medium text-gray-700 mb-2">
              Prezzo Indicativo
            </label>
            <input
              type="text"
              id="indicative_price"
              name="indicative_price"
              defaultValue={article?.indicative_price}
              placeholder="es: €500-800"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
            />
          </div>

          <div>
            <label htmlFor="description_HTML" className="block text-sm font-medium text-gray-700 mb-2">
              Contenuto HTML
            </label>
            <textarea
              id="description_HTML"
              name="description_HTML"
              defaultValue={article?.description_HTML}
              rows={8}
              placeholder="<p>Contenuto articolo in HTML...</p>"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] font-mono text-sm"
            />
          </div>
        </div>
      )}

      {/* BOOK_NOW Fields */}
      {isBookNow && (
        <div className="border-t pt-4 space-y-6">
          <h3 className="text-lg font-semibold text-gray-700">Campi Book Now</h3>
          
          {/* Trip Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="trip_start_at" className="block text-sm font-medium text-gray-700 mb-2">
                Data Inizio Viaggio
              </label>
              <input
                type="date"
                id="trip_start_at"
                name="trip_start_at"
                defaultValue={article?.trip_start_at ? new Date(article.trip_start_at).toISOString().split('T')[0] : ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              />
            </div>

            <div>
              <label htmlFor="trip_end_at" className="block text-sm font-medium text-gray-700 mb-2">
                Data Fine Viaggio
              </label>
              <input
                type="date"
                id="trip_end_at"
                name="trip_end_at"
                defaultValue={article?.trip_end_at ? new Date(article.trip_end_at).toISOString().split('T')[0] : ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="trip_start_at_description" className="block text-sm font-medium text-gray-700 mb-2">
                Descrizione Data Inizio
              </label>
              <input
                type="text"
                id="trip_start_at_description"
                name="trip_start_at_description"
                defaultValue={article?.trip_start_at_description}
                placeholder="es: Partenza da Milano Malpensa"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              />
            </div>

            <div>
              <label htmlFor="trip_end_at_description" className="block text-sm font-medium text-gray-700 mb-2">
                Descrizione Data Fine
              </label>
              <input
                type="text"
                id="trip_end_at_description"
                name="trip_end_at_description"
                defaultValue={article?.trip_end_at_description}
                placeholder="es: Arrivo a Roma Fiumicino"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="max_booking_num" className="block text-sm font-medium text-gray-700 mb-2">
                Max Prenotazioni
              </label>
              <input
                type="number"
                id="max_booking_num"
                name="max_booking_num"
                defaultValue={article?.max_booking_num}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              />
            </div>

            <div>
              <label htmlFor="tour_leader_id" className="block text-sm font-medium text-gray-700 mb-2">
                Tour Leader
              </label>
              <select
                id="tour_leader_id"
                name="tour_leader_id"
                defaultValue={article?.tour_leader_id}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              >
                <option value="">Stesso dell'autore</option>
                {tourLeaders.map((leader) => (
                  <option key={leader._id} value={leader._id}>
                    {leader.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="itinerary_image" className="block text-sm font-medium text-gray-700 mb-2">
                URL Immagine Itinerario
              </label>
              <input
                type="url"
                id="itinerary_image"
                name="itinerary_image"
                defaultValue={article?.itinerary_image}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              />
            </div>

            <div>
              <label htmlFor="stripe_product_id" className="block text-sm font-medium text-gray-700 mb-2">
                Stripe Product ID
              </label>
              <input
                type="text"
                id="stripe_product_id"
                name="stripe_product_id"
                defaultValue={article?.stripe_product_id}
                placeholder="prod_..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="stripe_price_id" className="block text-sm font-medium text-gray-700 mb-2">
              Stripe Price ID
            </label>
            <input
              type="text"
              id="stripe_price_id"
              name="stripe_price_id"
              defaultValue={article?.stripe_price_id}
              placeholder="price_..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
            />
          </div>

          {/* Travelers Configuration */}
          <TravelersConfig
            initialConfig={article ? {
              adults: { 
                allowed: article.travelers_adults_allowed ?? true, 
                min: article.travelers_adults_min ?? 1, 
                max: article.travelers_adults_max ?? 2, 
                price: article.price_adults ?? 0 
              },
              children: { 
                allowed: article.travelers_children_allowed ?? false, 
                min: article.travelers_children_min ?? 0, 
                max: article.travelers_children_max ?? 0, 
                price: article.price_children ?? 0 
              },
              couples: { 
                allowed: article.travelers_couples_allowed ?? false, 
                min: article.travelers_couples_min ?? 0, 
                max: article.travelers_couples_max ?? 0, 
                price: article.price_couples ?? 0 
              },
              newborns: { 
                allowed: article.travelers_newborns_allowed ?? false, 
                min: article.travelers_newborns_min ?? 0, 
                max: article.travelers_newborns_max ?? 0, 
                price: article.price_newborns ?? 0 
              },
            } : undefined}
            onConfigChange={setTravelersConfig}
          />

          <ItineraryRepeater initialItems={article?.itinerary_items} />

          <ProductsRepeater 
            initialProducts={article?.optional_products}
            travelersConfig={travelersConfig}
          />
        </div>
      )}

      {/* BOOK_NOW Content Sections */}
      {articleType === 'BOOK_NOW' && (
        <div className="border-t pt-4 space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Sezioni Contenuto</h3>
          
          {/* Trip in a Nutshell */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titolo "Il viaggio in breve"
              </label>
              <input
                type="text"
                name="trip_in_a_nutshell_title"
                defaultValue={article?.trip_in_a_nutshell_title}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contenuto HTML
              </label>
              <textarea
                name="trip_in_a_nutshell_body_HTML"
                defaultValue={article?.trip_in_a_nutshell_body_HTML}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Highlights */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titolo "I punti forti"
              </label>
              <input
                type="text"
                name="highlights_title"
                defaultValue={article?.highlights_title}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contenuto HTML
              </label>
              <textarea
                name="highlights_body_HTML"
                defaultValue={article?.highlights_body_HTML}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titolo "Informazioni aggiuntive"
              </label>
              <input
                type="text"
                name="additional_information_title"
                defaultValue={article?.additional_information_title}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contenuto HTML
              </label>
              <textarea
                name="additional_information_body_HTML"
                defaultValue={article?.additional_information_body_HTML}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* How We Move */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titolo "Come ci muoviamo"
              </label>
              <input
                type="text"
                name="how_we_move_title"
                defaultValue={article?.how_we_move_title}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contenuto HTML
              </label>
              <textarea
                name="how_we_move_body_HTML"
                defaultValue={article?.how_we_move_body_HTML}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Where We Sleep */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titolo "Dove dormiamo"
              </label>
              <input
                type="text"
                name="where_we_sleep_title"
                defaultValue={article?.where_we_sleep_title}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contenuto HTML
              </label>
              <textarea
                name="where_we_sleep_body_HTML"
                defaultValue={article?.where_we_sleep_body_HTML}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Not Included in Price */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titolo "Non incluso nel prezzo"
              </label>
              <input
                type="text"
                name="not_included_in_the_price_title"
                defaultValue={article?.not_included_in_the_price_title}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contenuto HTML
              </label>
              <textarea
                name="not_included_in_the_price_body_HTML"
                defaultValue={article?.not_included_in_the_price_body_HTML}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Included in Price */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titolo "Incluso nel prezzo"
              </label>
              <input
                type="text"
                name="included_in_the_price_title"
                defaultValue={article?.included_in_the_price_title}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contenuto HTML
              </label>
              <textarea
                name="included_in_the_price_body_HTML"
                defaultValue={article?.included_in_the_price_body_HTML}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Type of Trip */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titolo "Tipo di viaggio"
              </label>
              <input
                type="text"
                name="type_of_trip_title"
                defaultValue={article?.type_of_trip_title}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contenuto HTML
              </label>
              <textarea
                name="type_of_trip_body_HTML"
                defaultValue={article?.type_of_trip_body_HTML}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Type of Trip Items (Map) */}
          <TypesRepeater
            name="type_of_trip_items"
            label="Elementi Tipo di Viaggio"
            defaultValue={article?.type_of_trip_items}
          />
        </div>
      )}

      {/* Submit Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#ff8555] transition-colors"
        >
          {mode === 'edit' ? 'Salva Modifiche' : 'Crea Articolo'}
        </button>
        <a
          href="/articles"
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
        >
          Annulla
        </a>
      </div>
    </form>
  );
}
