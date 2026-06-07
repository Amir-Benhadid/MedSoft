/**
 * Application Configuration Context
 * 
 * Provides application-wide configuration settings such as database path,
 * logo path, business information, and application mode. This context
 * allows components throughout the application to access configuration
 * without prop drilling.
 */

import { createContext, useContext } from 'react';

/**
 * Application configuration interface
 */
interface AppConfig {
    /** Path to the local database file */
    dbPath?: string;
    /** Server mode: 'host' for server app, 'client' for remote app */
    serverMode?: 'host' | 'client';
    /** Path to the business logo image */
    logoPath?: string;
    /** Name of the business/practice */
    businessName?: string;
    /** Type of business/practice */
    businessType?: string;
    /** Application mode: 'both' for full access, 'secretary' for secretary-only */
    appMode?: 'both' | 'secretary';
}

/**
 * React context for application configuration
 * Defaults to an empty object if no provider is present
 */
const ConfigContext = createContext<AppConfig>({});

/**
 * Provider component that supplies configuration to child components
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components that will have access to config
 * @param {AppConfig} props.config - Configuration object to provide
 * @returns {JSX.Element} Context provider component
 */
export function ConfigProvider({ children, config }: { children: React.ReactNode; config: AppConfig }) {
    return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
}

/**
 * Hook to access application configuration from context
 * 
 * @returns {AppConfig} Current application configuration
 * @throws {Error} If used outside of ConfigProvider
 */
export function useConfig() {
    return useContext(ConfigContext);
}
