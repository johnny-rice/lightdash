import { Ability } from '@casl/ability';
import {
    AbilityAction,
    AnyType,
    DimensionType,
    Explore,
    ExploreError,
    FieldType,
    FilterOperator,
    InlineErrorType,
    LightdashMode,
    MetricType,
    OrganizationMemberRole,
    SessionUser,
    SupportedDbtAdapter,
    TableSelectionType,
    TablesConfiguration,
    type DashboardFilters,
} from '@lightdash/common';
import { LightdashConfig } from '../../config/parseConfig';
import { type SavedChartModel } from '../../models/SavedChartModel';

export const config = {
    mode: LightdashMode.DEFAULT,
    siteUrl: 'https://test.lightdash.cloud',
} as LightdashConfig;

export const project = { organizationUuid: 'orgUuid' };
export const user: SessionUser = {
    userUuid: 'userUuid',
    email: 'email',
    firstName: 'firstName',
    lastName: 'lastName',
    organizationUuid: 'organizationUuid',
    organizationName: 'organizationName',
    organizationCreatedAt: new Date(),
    isTrackingAnonymized: false,
    isMarketingOptedIn: false,
    isSetupComplete: true,
    userId: 0,
    role: OrganizationMemberRole.ADMIN,
    ability: new Ability<[AbilityAction, AnyType]>([
        {
            subject: 'Validation',
            action: ['manage'],
        },
    ]),
    isActive: true,
    abilityRules: [],
    createdAt: new Date(),
    updatedAt: new Date(),
};

export const chartForValidation: Awaited<
    ReturnType<SavedChartModel['findChartsForValidation']>
>[number] = {
    uuid: 'chartUuid',
    name: 'Test chart',
    tableName: 'table',
    filters: {
        dimensions: {
            id: 'dimensionFilterUuid',
            and: [
                {
                    id: '',
                    target: { fieldId: 'table_dimension' },
                    values: ['2018-01-01'],
                    operator: FilterOperator.EQUALS,
                },
            ],
        },
        metrics: {
            id: 'metricFilterUuid',
            or: [
                {
                    id: '',
                    target: { fieldId: 'table_metric' },
                    values: ['2018-01-01'],
                    operator: FilterOperator.EQUALS,
                },
                {
                    id: '',
                    target: { fieldId: 'table_custom_metric' },
                    values: [10],
                    operator: FilterOperator.EQUALS,
                },
            ],
        },
    },
    dimensions: ['table_dimension'],
    metrics: ['table_metric'],
    tableCalculations: ['table_calculation'],
    customMetrics: ['table_custom_metric'],
    customMetricsBaseDimensions: ['table_dimension'],
    customBinDimensions: [],
    customSqlDimensions: [],
    sorts: ['table_dimension'],
    dashboardUuid: undefined,
    customMetricsFilters: [
        {
            id: 'table_custom_metric',
            target: {
                fieldRef: 'table.dimension',
            },
            values: ['n'],
            operator: FilterOperator.ENDS_WITH,
        },
    ],
};

export const chartForValidationWithJoinedField: Awaited<
    ReturnType<SavedChartModel['findChartsForValidation']>
>[number] = {
    ...chartForValidation,
    tableName: 'another_table',
    dimensions: ['table_dimension', 'another_table_dimension'],
    metrics: ['table_metric', 'another_table_metric'],
    sorts: ['another_table_dimension'],
};

export const chartForValidationWithCustomMetricFilters: Awaited<
    ReturnType<SavedChartModel['findChartsForValidation']>
>[number] = {
    ...chartForValidation,
    tableName: 'another_table',
    dimensions: ['table_dimension', 'another_table_dimension'],
    customMetricsFilters: [
        {
            id: 'table_custom_metric',
            target: {
                fieldRef: 'another_table.dimension',
            },
            values: ['n'],
            operator: FilterOperator.ENDS_WITH,
        },
        {
            id: 'table_custom_metric',
            target: {
                fieldRef: 'table.dimension',
            },
            values: ['A'],
            operator: FilterOperator.STARTS_WITH,
        },
    ],
};

export const dashboardForValidation: {
    dashboardUuid: string;
    name: string;
    filters: DashboardFilters;
    chartUuids: string[];
} = {
    dashboardUuid: 'dashboardUuid',
    name: 'test dashboard',
    filters: {
        dimensions: [],
        metrics: [],
        tableCalculations: [],
    },
    chartUuids: ['chartUuid'],
};

export const explore: Explore = {
    targetDatabase: SupportedDbtAdapter.POSTGRES,
    name: 'valid_explore',
    label: 'valid_explore',
    tags: [],
    baseTable: 'table',
    joinedTables: [],
    tables: {
        table: {
            name: 'table',
            label: 'table',
            database: 'database',
            schema: 'schema',
            sqlTable: 'test.table',
            dimensions: {
                dimension: {
                    table: 'table',
                    tableLabel: 'table',
                    sql: 'sql',
                    name: 'dimension',
                    label: 'dimension',
                    fieldType: FieldType.DIMENSION,
                    type: DimensionType.STRING,
                    compiledSql: 'compiledSql',
                    tablesReferences: undefined,
                    hidden: false,
                },
            },
            metrics: {
                myMetric: {
                    table: 'table',
                    tableLabel: 'table',
                    sql: 'sql',
                    name: 'metric',
                    label: 'metric',
                    fieldType: FieldType.METRIC,
                    type: MetricType.NUMBER,
                    compiledSql: 'compiledSql',
                    tablesReferences: undefined,
                    hidden: false,
                },
            },
            lineageGraph: {},
        },
    },
};

export const exploreWithoutDimension: Explore = {
    ...explore,
    tables: {
        table: {
            ...explore.tables.table!,
            dimensions: {},
        },
    },
};
export const exploreWithoutMetric: Explore = {
    ...explore,
    tables: {
        table: {
            ...explore.tables.table!,
            metrics: {},
        },
    },
};

export const exploreWithJoin: Explore = {
    targetDatabase: SupportedDbtAdapter.POSTGRES,
    name: 'joined_explore',
    label: 'joined_explore',
    tags: [],
    baseTable: 'another_table',
    joinedTables: [], // This would normally be set, but we don't need it for this test
    tables: {
        table: explore.tables.table!, // same as explore
        another_table: {
            name: 'another_table',
            label: 'another_table',
            database: 'database',
            schema: 'schema',
            sqlTable: 'test.table',
            dimensions: {
                dimension: {
                    table: 'another_table',
                    tableLabel: 'another_table',
                    sql: 'sql',
                    name: 'dimension',
                    label: 'dimension',
                    fieldType: FieldType.DIMENSION,
                    type: DimensionType.STRING,
                    compiledSql: 'compiledSql',
                    tablesReferences: undefined,
                    hidden: false,
                },
            },
            metrics: {
                myMetric: {
                    table: 'another_table',
                    tableLabel: 'another_table',
                    sql: 'sql',
                    name: 'metric',
                    label: 'metric',
                    fieldType: FieldType.METRIC,
                    type: MetricType.NUMBER,
                    compiledSql: 'compiledSql',
                    tablesReferences: undefined,
                    hidden: false,
                },
            },
            lineageGraph: {},
        },
    },
};

export const exploreError: ExploreError = {
    name: 'valid_explore',
    label: 'valid_explore',
    tags: [],
    baseTable: 'table',
    joinedTables: [],
    tables: {},
    errors: [
        {
            message:
                'Model "valid_explore" has a dimension reference: ${is_completed} which matches no dimension',
            type: InlineErrorType.METADATA_PARSE_ERROR,
        },
    ],
};

export const tableConfiguration: TablesConfiguration = {
    tableSelection: {
        type: TableSelectionType.ALL,
        value: [],
    },
};
