
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // TODO: Replace with real ID

export const GoogleAnalytics = () => {
    const location = useLocation();

    useEffect(() => {
        // Only run in production
        if (process.env.NODE_ENV !== 'production') return;

        // Load generic script
        const script = document.createElement('script');
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
        script.async = true;
        document.head.appendChild(script);

        // Initialize datalayer
        window.dataLayer = window.dataLayer || [];
        function gtag(...args: any[]) {
            window.dataLayer.push(args);
        }
        gtag('js', new Date());
        gtag('config', GA_MEASUREMENT_ID);

        // Cleanup
        return () => {
            document.head.removeChild(script);
        };
    }, []);

    // Track page views on route change
    useEffect(() => {
        if (process.env.NODE_ENV !== 'production' || !window.gtag) return;

        window.gtag('config', GA_MEASUREMENT_ID, {
            page_path: location.pathname + location.search,
        });
    }, [location]);

    return null;
};

// Helper to track custom events
export const trackEvent = (action: string, category: string, label: string, value?: number) => {
    if (process.env.NODE_ENV !== 'production' || !window.gtag) {
        console.log('[Analytics Dev]', { action, category, label, value });
        return;
    }

    window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
    });
};

// Add types for window
declare global {
    interface Window {
        dataLayer: any[];
        gtag: (...args: any[]) => void;
    }
}
