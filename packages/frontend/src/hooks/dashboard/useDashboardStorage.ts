import {
    type CreateDashboardChartTile,
    type DashboardFilters,
    type DashboardTab,
    type DashboardTile,
} from '@lightdash/common';
import { useCallback, useEffect, useState } from 'react';

const getIsEditingDashboardChart = () => {
    return (
        !!sessionStorage.getItem('fromDashboard') ||
        !!sessionStorage.getItem('dashboardUuid')
    );
};

const useDashboardStorage = () => {
    const [isEditingDashboardChart, setIsEditingDashboardChart] = useState(
        getIsEditingDashboardChart(),
    );

    // Update isEditingDashboardChart when storage changes, so that NavBar can update accordingly
    useEffect(() => {
        const handleStorage = () => {
            setIsEditingDashboardChart(getIsEditingDashboardChart());
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const clearIsEditingDashboardChart = useCallback(() => {
        sessionStorage.removeItem('fromDashboard');
        sessionStorage.removeItem('dashboardUuid');
        // Trigger storage event to update NavBar
        window.dispatchEvent(new Event('storage'));
    }, []);

    const getEditingDashboardInfo = useCallback(() => {
        return {
            name: sessionStorage.getItem('fromDashboard'),
            dashboardUuid: sessionStorage.getItem('dashboardUuid'),
            activeTabUuid: sessionStorage.getItem('activeTabUuid'),
        };
    }, []);

    const setDashboardChartInfo = useCallback(
        (dashboardData: { name: string; dashboardUuid: string }) => {
            sessionStorage.setItem('fromDashboard', dashboardData.name);
            sessionStorage.setItem(
                'dashboardUuid',
                dashboardData.dashboardUuid,
            );
            // Trigger storage event to update NavBar
            window.dispatchEvent(new Event('storage'));
        },
        [],
    );

    const getHasDashboardChanges = useCallback(() => {
        return JSON.parse(
            sessionStorage.getItem('getHasDashboardChanges') ?? 'false',
        );
    }, []);

    const getDashboardActiveTabUuid = useCallback(() => {
        return sessionStorage.getItem('activeTabUuid');
    }, []);

    const clearDashboardStorage = useCallback(() => {
        sessionStorage.removeItem('fromDashboard');
        sessionStorage.removeItem('dashboardUuid');
        sessionStorage.removeItem('unsavedDashboardTiles');
        sessionStorage.removeItem('unsavedDashboardFilters');
        sessionStorage.removeItem('hasDashboardChanges');
        sessionStorage.removeItem('activeTabUuid');
        // Trigger storage event to update NavBar
        window.dispatchEvent(new Event('storage'));
    }, []);

    const storeDashboard = useCallback(
        (
            dashboardTiles: DashboardTile[] | undefined,
            dashboardFilters: DashboardFilters,
            haveTilesChanged: boolean,
            haveFiltersChanged: boolean,
            dashboardUuid?: string,
            dashboardName?: string,
            activeTabUuid?: string,
            dashboardTabs?: DashboardTab[],
        ) => {
            sessionStorage.setItem('fromDashboard', dashboardName ?? '');
            sessionStorage.setItem('dashboardUuid', dashboardUuid ?? '');
            sessionStorage.setItem(
                'unsavedDashboardTiles',
                JSON.stringify(dashboardTiles ?? []),
            );
            if (dashboardTabs && dashboardTabs.length > 0) {
                sessionStorage.setItem(
                    'dashboardTabs',
                    JSON.stringify(dashboardTabs),
                );
            }
            if (
                dashboardFilters.dimensions.length > 0 ||
                dashboardFilters.metrics.length > 0
            ) {
                sessionStorage.setItem(
                    'unsavedDashboardFilters',
                    JSON.stringify(dashboardFilters),
                );
            }
            sessionStorage.setItem(
                'hasDashboardChanges',
                JSON.stringify(haveTilesChanged || haveFiltersChanged),
            );
            if (activeTabUuid) {
                sessionStorage.setItem('activeTabUuid', activeTabUuid);
            }
            // Trigger storage event to update NavBar
            window.dispatchEvent(new Event('storage'));
        },
        [],
    );

    const getUnsavedDashboardTiles = useCallback(() => {
        return JSON.parse(
            sessionStorage.getItem('unsavedDashboardTiles') ?? '[]',
        );
    }, []);

    const setUnsavedDashboardTiles = useCallback(
        (
            unsavedDashboardTiles: DashboardTile[] | CreateDashboardChartTile[],
        ) => {
            sessionStorage.setItem(
                'unsavedDashboardTiles',
                JSON.stringify(unsavedDashboardTiles),
            );
        },
        [],
    );

    return {
        storeDashboard,
        clearDashboardStorage,
        isEditingDashboardChart,
        getIsEditingDashboardChart,
        getEditingDashboardInfo,
        setDashboardChartInfo,
        clearIsEditingDashboardChart,
        getHasDashboardChanges,
        getUnsavedDashboardTiles,
        setUnsavedDashboardTiles,
        getDashboardActiveTabUuid,
    };
};

export default useDashboardStorage;
