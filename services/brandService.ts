import { supabase } from './supabase';

export const brandService = {
    /** Fetch all brands ordered by position. */
    async getBrands(): Promise<string[]> {
        const { data, error } = await supabase
            .from('brands')
            .select('name')
            .order('position', { ascending: true });
        if (error) {
            console.error('Error fetching brands:', error);
            return [];
        }
        return (data ?? []).map((row: { name: string }) => row.name);
    },

    /** Add a new brand (upsert to avoid duplicates). */
    async addBrand(name: string): Promise<void> {
        const { error } = await supabase
            .from('brands')
            .upsert({ name }, { onConflict: 'name' });
        if (error) console.error('Error adding brand:', error);
    }
};
