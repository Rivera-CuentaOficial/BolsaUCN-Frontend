import { MapPin, Calendar, DollarSign, Mail, Phone, Package, Tag, Clock, FileText } from 'lucide-react';
import { formatDate, thousandSeparatorPipe } from '@/lib';
import type { MyPublicationDetails } from '@/models/responses';

interface Props {
  publication: MyPublicationDetails;
}

export function PublicationDetailSection({ publication }: Props) {
  const isOffer = publication.publicationType === "Oferta";
  const isBuySell = publication.publicationType === "CompraVenta";

  return (
    <div className="space-y-8">
      
      {/* Description Section */}
      <section className="pb-6 border-b border-slate-200">
        <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-2">
          <FileText className="w-6 h-6 text-purple-600" />
          Descripción
        </h2>
        <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-base">
          {publication.description}
        </p>
      </section>

      {/* Basic Information Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-200">
        
        {/* Location */}
        <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl">
          <div className="bg-purple-100 p-2 rounded-xl">
            <MapPin className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-1">
              Ubicación
            </h3>
            <p className="text-slate-900 font-medium">{publication.location}</p>
          </div>
        </div>

        {/* Publication Date */}
        <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl">
          <div className="bg-purple-100 p-2 rounded-xl">
            <Clock className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-1">
              Fecha de Publicación
            </h3>
            <p className="text-slate-900 font-medium">{formatDate(publication.createdAt)}</p>
          </div>
        </div>
      </section>

      {/* Job Offer Specific Fields */}
      {isOffer && (
        <section className="space-y-6 pb-6 border-b border-slate-200">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Tag className="w-5 h-5 text-indigo-600" />
            Detalles de la Oferta
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {publication.offerType && (
              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl">
                <div className="bg-indigo-100 p-2 rounded-xl">
                  <Tag className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-1">
                    Tipo de Oferta
                  </h3>
                  <p className="text-slate-900 font-medium">{publication.offerType}</p>
                </div>
              </div>
            )}

            {publication.remuneration !== undefined && publication.remuneration !== null && (
              <div className="flex items-start gap-3 bg-green-50 p-4 rounded-2xl">
                <div className="bg-green-100 p-2 rounded-xl">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-1">
                    Remuneración
                  </h3>
                  <p className="text-slate-900 font-bold text-lg">
                    ${thousandSeparatorPipe(publication.remuneration)}
                  </p>
                </div>
              </div>
            )}

            {publication.applicationDeadline && (
              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl">
                <div className="bg-purple-100 p-2 rounded-xl">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-1">
                    Fecha Límite de Postulación
                  </h3>
                  <p className="text-slate-900 font-medium">{formatDate(publication.applicationDeadline)}</p>
                </div>
              </div>
            )}

            {publication.endDate && (
              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl">
                <div className="bg-purple-100 p-2 rounded-xl">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-1">
                    Fecha de Término
                  </h3>
                  <p className="text-slate-900 font-medium">{formatDate(publication.endDate)}</p>
                </div>
              </div>
            )}

            {publication.isCvRequired !== undefined && (
              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl">
                <div className="bg-purple-100 p-2 rounded-xl">
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-1">
                    CV Requerido
                  </h3>
                  <p className="text-slate-900 font-medium">
                    {publication.isCvRequired ? (
                      <span className="text-green-600 font-bold">Sí</span>
                    ) : (
                      <span className="text-slate-600">No</span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {publication.applicationsCount !== undefined && (
              <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-2xl">
                <div className="bg-blue-100 p-2 rounded-xl">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-1">
                    Total de Postulaciones
                  </h3>
                  <p className="text-slate-900 font-bold text-lg">{publication.applicationsCount}</p>
                </div>
              </div>
            )}
            {publication.remainingSlots !== undefined && (
              <div className="flex items-start gap-3 bg-indigo-50 p-4 rounded-2xl">
                <div className="bg-indigo-100 p-2 rounded-xl">
                  <Package className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-1">
                    Cupos Restantes
                  </h3>
                  <p className="text-slate-900 font-bold text-lg">{publication.remainingSlots}</p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* BuySell Specific Fields */}
      {isBuySell && (
        <section className="space-y-6 pb-6 border-b border-slate-200">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Tag className="w-5 h-5 text-purple-600" />
            Detalles del Producto
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {publication.price !== undefined && publication.price !== null && (
              <div className="flex items-start gap-3 bg-green-50 p-4 rounded-2xl">
                <div className="bg-green-100 p-2 rounded-xl">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-1">
                    Precio
                  </h3>
                  <p className="text-slate-900 font-bold text-lg">
                    ${thousandSeparatorPipe(publication.price)}
                  </p>
                </div>
              </div>
            )}

            {publication.category && (
              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl">
                <div className="bg-purple-100 p-2 rounded-xl">
                  <Tag className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-1">
                    Categoría
                  </h3>
                  <p className="text-slate-900 font-medium">{publication.category}</p>
                </div>
              </div>
            )}

            {publication.condition && (
              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl">
                <div className="bg-purple-100 p-2 rounded-xl">
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-1">
                    Condición
                  </h3>
                  <p className="text-slate-900 font-medium">{publication.condition}</p>
                </div>
              </div>
            )}

            {publication.quantity !== undefined && publication.quantity !== null && (
              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl">
                <div className="bg-blue-100 p-2 rounded-xl">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-1">
                    Cantidad Disponible
                  </h3>
                  <p className="text-slate-900 font-bold text-lg">{publication.quantity}</p>
                </div>
              </div>
            )}

            {publication.availability && (
              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl">
                <div className="bg-green-100 p-2 rounded-xl">
                  <Package className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-1">
                    Disponibilidad
                  </h3>
                  <p className="text-slate-900 font-medium">{publication.availability}</p>
                </div>
              </div>
            )}
          </div>

          {/* Images */}
          {publication.imageUrls && publication.imageUrls.length > 0 && (
            <div className="mt-6">
              <h3 className="font-bold text-lg text-slate-900 mb-4">Imágenes del Producto</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {publication.imageUrls.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Imagen ${idx + 1}`}
                    className="w-full h-48 object-cover rounded-xl border-2 border-slate-200 hover:border-purple-400 transition"
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Contact Information Section */}
      <section className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-2xl border border-purple-100">
        <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5 text-purple-600" />
          Información de Contacto
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Primary Contact Email */}
          <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-purple-100">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Mail className="w-4 h-4 text-purple-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-1">
                Email Principal
              </h3>
              <a 
                href={`mailto:${publication.contactEmail}`}
                className="text-slate-900 hover:text-purple-600 font-medium truncate block transition"
              >
                {publication.contactEmail}
              </a>
            </div>
          </div>

          {/* Primary Contact Phone */}
          <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-purple-100">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Phone className="w-4 h-4 text-purple-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-1">
                Teléfono Principal
              </h3>
              <a 
                href={`tel:${publication.contactPhone}`}
                className="text-slate-900 hover:text-purple-600 font-medium transition"
              >
                {publication.contactPhone}
              </a>
            </div>
          </div>

          {/* Additional Contact Email */}
          {publication.additionalContactEmail && (
            <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-indigo-100">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <Mail className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-1">
                  Email Adicional
                </h3>
                <a 
                  href={`mailto:${publication.additionalContactEmail}`}
                  className="text-slate-900 hover:text-indigo-600 font-medium truncate block transition"
                >
                  {publication.additionalContactEmail}
                </a>
              </div>
            </div>
          )}

          {/* Additional Contact Phone */}
          {publication.additionalContactPhoneNumber && (
            <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-indigo-100">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <Phone className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-1">
                  Teléfono Adicional
                </h3>
                <a 
                  href={`tel:${publication.additionalContactPhoneNumber}`}
                  className="text-slate-900 hover:text-indigo-600 font-medium transition"
                >
                  {publication.additionalContactPhoneNumber}
                </a>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}