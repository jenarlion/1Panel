import { Layout } from '@/routers/constant';

// demo
const appStoreRouter = {
    sort: 2,
    path: '/apps',
    component: Layout,
    redirect: '/apps',
    meta: {
        icon: 'p-appstore',
        title: 'menu.apps',
    },
    children: [
        {
            path: '/apps',
            name: 'App',
            component: () => import('@/views/app-store/index.vue'),
            meta: {
                keepAlive: true,
            },
        },
    ],
};

export default appStoreRouter;