/**
 * React Query hooks over the API. Query keys are centralised so the live-update
 * stream can invalidate everything in one call.
 */
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { api } from './api';

export const keys = {
  all: ['library'] as const,
  catalog: () => [...keys.all, 'catalog'] as const,
  department: (id: string) => [...keys.all, 'department', id] as const,
  skill: (name: string) => [...keys.all, 'skill', name] as const,
  file: (name: string, path: string) => [...keys.all, 'file', name, path] as const,
  search: (query: string) => [...keys.all, 'search', query] as const,
  health: () => [...keys.all, 'health'] as const,
  activity: () => [...keys.all, 'activity'] as const,
  server: () => ['server'] as const,
};

export const useCatalog = () => useQuery({ queryKey: keys.catalog(), queryFn: api.catalog });

export const useDepartment = (id: string) =>
  useQuery({ queryKey: keys.department(id), queryFn: () => api.department(id) });

export const useSkill = (name: string) =>
  useQuery({ queryKey: keys.skill(name), queryFn: () => api.skill(name) });

export const useSkillFile = (name: string, path: string | null) =>
  useQuery({
    queryKey: keys.file(name, path ?? ''),
    queryFn: () => api.file(name, path!),
    enabled: path !== null,
  });

export const useSearch = (query: string) =>
  useQuery({
    queryKey: keys.search(query),
    queryFn: () => api.search(query),
    enabled: query.trim().length >= 2,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

export const useHealth = () => useQuery({ queryKey: keys.health(), queryFn: api.health });

export const useActivity = () => useQuery({ queryKey: keys.activity(), queryFn: () => api.activity(30) });

export const useServerInfo = () =>
  useQuery({ queryKey: keys.server(), queryFn: api.server, staleTime: Infinity });
