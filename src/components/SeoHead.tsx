import { Helmet } from 'react-helmet-async';

interface SeoHeadProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
}

const SeoHead = ({
    title = 'Huellas Digitales - Bienestar Animal',
    description = 'Únete a la comunidad de bienestar animal más grande. Adopta, reporta perdidos y encuentra veterinarias. 100% Gratuito.',
    image = '/logo-512.png',
    url = window.location.href,
    type = 'website'
}: SeoHeadProps) => {
    const fullTitle = title.includes('Huellas') ? title : `${title} | Huellas Digitales`;
    const fullImage = image.startsWith('http') ? image : `${window.location.origin}${image}`;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={url} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={fullImage} />
            <meta property="og:url" content={url} />
            <meta property="og:site_name" content="Huellas Digitales" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={fullImage} />
        </Helmet>
    );
};

export default SeoHead;
