import { supabase } from './supabaseClient';
import { MedicineOption } from '../hooks/useMedicinesPaginated';

export interface SupabaseMedicine {
    id: string;
    medication_name: string;
    strength?: string;
    type?: string;
    packaging?: string;
    instructions?: string;
    category?: string;
    created_at: string;
    updated_at: string;
}

export interface MedicineSearchResult {
    medicines: MedicineOption[];
    total: number;
    hasMore: boolean;
}

class SupabaseMedicineService {
    /**
     * Search medicines with pagination and filtering
     */
    async searchMedicines(
        searchTerm: string = '',
        limit: number = 20,
        offset: number = 0
    ): Promise<MedicineSearchResult> {
        try {
            let query = supabase
                .from('medicines')
                .select('*', { count: 'exact' })
                .order('medication_name', { ascending: true })
                .range(offset, offset + limit - 1);

            // Add search filter if search term is provided
            if (searchTerm.trim()) {
                const searchTermLower = searchTerm.toLowerCase().trim();
                query = query.or(
                    `medication_name.ilike.%${searchTermLower}%,type.ilike.%${searchTermLower}%,strength.ilike.%${searchTermLower}%,category.ilike.%${searchTermLower}%`
                );
            }

            const { data, error, count } = await query;

            if (error) {
                console.error('Error searching medicines:', error);
                throw error;
            }

            const medicines: MedicineOption[] = (data || []).map((medicine) => ({
                value: medicine.medication_name,
                label: medicine.strength
                    ? `${medicine.medication_name} - ${medicine.strength}`
                    : medicine.medication_name,
                category: medicine.category || 'Other',
                form: medicine.type || '',
                strength: medicine.strength || '',
                defaultDosage: medicine.instructions || '',
                prescriptionRequired: true,
                packaging: medicine.packaging || '',
                id: medicine.id,
                manufacturer: '',
                activeIngredient: '',
            }));

            const total = count || 0;
            const hasMore = offset + limit < total;

            return {
                medicines,
                total,
                hasMore,
            };
        } catch (error) {
            console.error('Error in searchMedicines:', error);
            return {
                medicines: [],
                total: 0,
                hasMore: false,
            };
        }
    }

    /**
     * Get medicine by ID
     */
    async getMedicineById(id: string): Promise<SupabaseMedicine | null> {
        try {
            const { data, error } = await supabase
                .from('medicines')
                .select('*')
                .eq('id', id)
                .eq('is_available', true)
                .single();

            if (error) {
                console.error('Error getting medicine by ID:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in getMedicineById:', error);
            return null;
        }
    }

    /**
     * Add a new medicine to the database
     */
    async addMedicine(medicine: {
        medicationName: string;
        strength?: string;
        type?: string;
        packaging?: string;
        instructions?: string;
        category?: string;
        activeIngredient?: string;
        manufacturer?: string;
        prescriptionRequired?: boolean;
    }): Promise<SupabaseMedicine> {
        try {
            // Determine category if not provided
            const category = medicine.category || this.getCategoryFromType(medicine.type || '');

            const { data, error } = await supabase
                .from('medicines')
                .insert({
                    medication_name: medicine.medicationName,
                    strength: medicine.strength || null,
                    type: medicine.type || null,
                    packaging: medicine.packaging || null,
                    instructions: medicine.instructions || null,
                    category: category,
                })
                .select()
                .single();

            if (error) {
                console.error('Error adding medicine:', error);
                throw error;
            }

            return data;
        } catch (error) {
            console.error('Error in addMedicine:', error);
            throw error;
        }
    }

    /**
     * Update an existing medicine
     */
    async updateMedicine(
        id: string,
        updates: Partial<{
            medication_name: string;
            strength: string;
            type: string;
            packaging: string;
            instructions: string;
            category: string;
            active_ingredient: string;
            manufacturer: string;
            prescription_required: boolean;
            is_available: boolean;
        }>
    ): Promise<SupabaseMedicine> {
        try {
            const { data, error } = await supabase
                .from('medicines')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Error updating medicine:', error);
                throw error;
            }

            return data;
        } catch (error) {
            console.error('Error in updateMedicine:', error);
            throw error;
        }
    }

    /**
     * Delete a medicine (soft delete by setting is_available to false)
     */
    async deleteMedicine(id: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('medicines')
                .update({ is_available: false })
                .eq('id', id);

            if (error) {
                console.error('Error deleting medicine:', error);
                throw error;
            }
        } catch (error) {
            console.error('Error in deleteMedicine:', error);
            throw error;
        }
    }

    /**
     * Get medicines by category
     */
    async getMedicinesByCategory(
        category: string,
        limit: number = 20,
        offset: number = 0
    ): Promise<MedicineSearchResult> {
        try {
            const { data, error, count } = await supabase
                .from('medicines')
                .select('*', { count: 'exact' })
                .eq('category', category)
                .eq('is_available', true)
                .order('medication_name', { ascending: true })
                .range(offset, offset + limit - 1);

            if (error) {
                console.error('Error getting medicines by category:', error);
                throw error;
            }

            const medicines: MedicineOption[] = (data || []).map((medicine) => ({
                value: medicine.medication_name,
                label: medicine.strength
                    ? `${medicine.medication_name} - ${medicine.strength}`
                    : medicine.medication_name,
                category: medicine.category || 'Other',
                form: medicine.type || '',
                strength: medicine.strength || '',
                defaultDosage: medicine.instructions || '',
                prescriptionRequired: true,
                packaging: medicine.packaging || '',
                id: medicine.id,
                manufacturer: '',
                activeIngredient: '',
            }));

            const total = count || 0;
            const hasMore = offset + limit < total;

            return {
                medicines,
                total,
                hasMore,
            };
        } catch (error) {
            console.error('Error in getMedicinesByCategory:', error);
            return {
                medicines: [],
                total: 0,
                hasMore: false,
            };
        }
    }

    /**
     * Get all available categories
     */
    async getCategories(): Promise<string[]> {
        try {
            const { data, error } = await supabase
                .from('medicines')
                .select('category')
                .eq('is_available', true)
                .not('category', 'is', null);

            if (error) {
                console.error('Error getting categories:', error);
                return [];
            }

            // Get unique categories
            const categories = [...new Set(data.map((item) => item.category))];
            return categories.sort();
        } catch (error) {
            console.error('Error in getCategories:', error);
            return [];
        }
    }

    /**
     * Helper function to determine category from type
     */
    private getCategoryFromType(type: string): string {
        const typeToCategory: { [key: string]: string } = {
            collyre: 'Ophthalmic',
            'pommade ophtalmique': 'Ophthalmic',
            cp: 'Tablet/Capsule',
            comprimés: 'Tablet/Capsule',
            gélules: 'Tablet/Capsule',
            capsules: 'Tablet/Capsule',
            injection: 'Injectable',
            gel: 'Topical',
            pommade: 'Topical',
            sirop: 'Syrup/Solution',
            solution: 'Syrup/Solution',
            gouttes: 'Drops',
        };

        return typeToCategory[type?.toLowerCase()] || 'Other';
    }
}

// Export singleton instance
export const supabaseMedicineService = new SupabaseMedicineService();
