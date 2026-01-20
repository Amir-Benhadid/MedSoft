/**
 * Application Configuration Types
 * 
 * Defines the structure for application configuration settings including
 * business information, server configuration, and application mode settings.
 */

/**
 * Application configuration interface.
 * Contains all configurable settings for the application.
 */
export interface AppConfig {
    businessName?: string;
    businessType?: 'cabinet-ophthalmologie' | 'kinesis' | string;
    appMode?: string; // 'both' | 'secretary'
    serverMode?: 'host' | 'client';
    serverIP?: string;
    serverPort?: number;
    dbPath?: string;
    logoPath?: string;
    [key: string]: any;
}
