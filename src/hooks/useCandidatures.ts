import { useState, useEffect, useCallback } from 'react';
import { Candidature } from '../types/candidature';
import { getCandidatures, createCandidature, updateCandidature, deleteCandidature } from '../lib/db';

export function useCandidatures() {
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCandidatures = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await getCandidatures();
      setCandidatures(data);
      setError(null);
    } catch (err: unknown) {
      console.error('Failed to fetch candidatures:', err);
      setError('Erreur lors du chargement des candidatures.');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCandidatures();
  }, [fetchCandidatures]);

  const add = async (c: Omit<Candidature, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await createCandidature(c);
      await fetchCandidatures(false);
    } catch (err: unknown) {
      console.error('Failed to create candidature:', err);
      throw err;
    }
  };

  const update = async (id: number, c: Partial<Omit<Candidature, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      await updateCandidature(id, c);
      await fetchCandidatures(false);
    } catch (err: unknown) {
      console.error('Failed to update candidature:', err);
      throw err;
    }
  };

  const remove = async (id: number) => {
    try {
      await deleteCandidature(id);
      await fetchCandidatures(false);
    } catch (err: unknown) {
      console.error('Failed to delete candidature:', err);
      throw err;
    }
  };

  return { candidatures, loading, error, add, update, remove, refetch: fetchCandidatures };
}
