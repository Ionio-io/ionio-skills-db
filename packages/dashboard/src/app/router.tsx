/**
 * Routes. Every page renders inside the app shell.
 *
 * The overview and skill list load with the app. The other pages load on first
 * visit: they pull in the markdown pipeline or the MCP client, which the landing
 * pages do not need.
 */
import { createBrowserRouter } from 'react-router';

import { PageSkeleton } from '@/components/common/States';
import { AppShell } from '@/components/layout/AppShell';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { OverviewPage } from '@/pages/OverviewPage';
import { SkillsPage } from '@/pages/SkillsPage';

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    hydrateFallbackElement: <PageSkeleton />,
    children: [
      { index: true, element: <OverviewPage /> },
      { path: 'skills', element: <SkillsPage /> },
      {
        path: 'skills/:name',
        lazy: () => import('@/pages/skill/SkillPage').then((module) => ({ Component: module.SkillPage })),
      },
      {
        path: 'departments/:id',
        lazy: () => import('@/pages/DepartmentPage').then((module) => ({ Component: module.DepartmentPage })),
      },
      {
        path: 'health',
        lazy: () => import('@/pages/HealthPage').then((module) => ({ Component: module.HealthPage })),
      },
      {
        path: 'connect',
        lazy: () =>
          import('@/pages/connect/ConnectPage').then((module) => ({ Component: module.ConnectPage })),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
