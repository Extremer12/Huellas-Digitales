
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';
import Auth from '../pages/Auth'; // Auth serves as the login page

// Mock dependencies
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => vi.fn(),
    };
});

// Wrapper for router context
const renderWithRouter = (component: React.ReactNode) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Auth Page (Login)', () => {
    it('renders login form correctly', () => {
        renderWithRouter(<Auth />);

        expect(screen.getByPlaceholderText(/ejemplo@correo.com/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
    });

    it('updates input values when typing', () => {
        renderWithRouter(<Auth />);

        const emailInput = screen.getByPlaceholderText(/ejemplo@correo.com/i) as HTMLInputElement;
        const passwordInput = screen.getByPlaceholderText(/••••••••/i) as HTMLInputElement;

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        expect(emailInput.value).toBe('test@example.com');
        expect(passwordInput.value).toBe('password123');
    });

    // Note: Full integration test mocking Supabase response would go here
    // But for "Basic Testing", input validation and rendering is a solid start.
});
