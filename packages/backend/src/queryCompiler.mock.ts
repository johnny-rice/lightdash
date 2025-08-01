import {
    CompiledDimension,
    CompiledMetricQuery,
    DimensionType,
    Explore,
    FieldType,
    MetricQuery,
    MetricType,
    SupportedDbtAdapter,
    WarehouseClient,
} from '@lightdash/common';
import { emptyTable } from './utils/QueryBuilder/queryBuilder.mock';

const DIMENSION: CompiledDimension = {
    name: 'dim_1',
    fieldType: FieldType.DIMENSION,
    type: DimensionType.STRING,
    table: 'table1',
    label: 'dim_1',
    tableLabel: 'table1',
    hidden: false,
    sql: '${TABLE}.dim_1',
    compiledSql: '`some`.`table1`.`dim_1`',
    tablesReferences: ['table1'],
};

export const EXPLORE: Pick<Explore, 'targetDatabase' | 'tables'> = {
    targetDatabase: SupportedDbtAdapter.POSTGRES,
    tables: {
        table1: {
            ...emptyTable('table1'),
            dimensions: {
                [DIMENSION.name]: DIMENSION,
            },
        },
    },
};

export const METRIC_QUERY_NO_CALCS: MetricQuery = {
    exploreName: 'table1',
    dimensions: ['table1_dim_1', 'table_2_dim_2'],
    metrics: ['table_3_metric_1', 'table55_metric__23_1'],
    filters: {},
    sorts: [],
    limit: 500,
    tableCalculations: [],
};

export const METRIC_QUERY_VALID_REFERENCES: MetricQuery = {
    ...METRIC_QUERY_NO_CALCS,
    tableCalculations: [
        { name: 'calc1', displayName: '', sql: 'no references ${nope ' },
        {
            name: 'calc2',
            displayName: '',
            sql: 'dim reference ${table1.dim_1}',
        },
        {
            name: 'calc3',
            displayName: '',
            sql: 'metric reference ${table_3.metric_1}',
        },
    ],
};

export const METRIC_QUERY_VALID_REFERENCES_COMPILED: CompiledMetricQuery = {
    ...METRIC_QUERY_VALID_REFERENCES,
    compiledAdditionalMetrics: [],
    compiledTableCalculations: [
        {
            name: 'calc1',
            displayName: '',
            sql: 'no references ${nope ',
            compiledSql: 'no references ${nope ',
        },
        {
            name: 'calc2',
            displayName: '',
            sql: 'dim reference ${table1.dim_1}',
            compiledSql: 'dim reference "table1_dim_1"',
        },
        {
            name: 'calc3',
            displayName: '',
            sql: 'metric reference ${table_3.metric_1}',
            compiledSql: 'metric reference "table_3_metric_1"',
        },
    ],
    compiledCustomDimensions: [],
};

export const METRIC_QUERY_MISSING_REFERENCE: MetricQuery = {
    ...METRIC_QUERY_NO_CALCS,
    tableCalculations: [
        { name: 'calc1', displayName: '', sql: '${notexists.nah}' },
    ],
};

export const METRIC_QUERY_INVALID_REFERENCE_FORMAT: MetricQuery = {
    ...METRIC_QUERY_NO_CALCS,
    tableCalculations: [{ name: 'calc1', displayName: '', sql: '${nodot}' }],
};

export const METRIC_QUERY_DUPLICATE_NAME: MetricQuery = {
    ...METRIC_QUERY_NO_CALCS,
    tableCalculations: [
        { name: 'table_3_metric_1', displayName: '', sql: '${table1.dim_1}' },
    ],
};

const ADDITIONAL_METRIC = {
    name: 'additional_metric_1',
    sql: '${TABLE}.dim_1',
    table: 'table1',
    type: MetricType.COUNT,
    description: 'My description',
};

export const METRIC_QUERY_WITH_ADDITIONAL_METRICS: MetricQuery = {
    ...METRIC_QUERY_NO_CALCS,
    additionalMetrics: [ADDITIONAL_METRIC],
};

export const METRIC_QUERY_WITH_INVALID_ADDITIONAL_METRIC: MetricQuery = {
    ...METRIC_QUERY_NO_CALCS,
    additionalMetrics: [
        {
            ...ADDITIONAL_METRIC,
            table: 'not-exists',
        },
    ],
};

export const METRIC_QUERY_WITH_ADDITIONAL_METRICS_COMPILED: CompiledMetricQuery =
    {
        ...METRIC_QUERY_WITH_ADDITIONAL_METRICS,
        compiledTableCalculations: [],
        compiledAdditionalMetrics: [
            {
                ...ADDITIONAL_METRIC,
                label: 'Additional metric 1',
                tableLabel: 'table1',
                hidden: false,
                compiledSql: 'COUNT("table1".dim_1)',
                tablesReferences: ['table1'],
                fieldType: FieldType.METRIC,
                round: undefined,
                percentile: undefined,
                compact: undefined,
                source: undefined,
                showUnderlyingValues: undefined,
                format: undefined,
                filters: [],
                requiredAttributes: undefined,
                dimensionReference: undefined,
                groups: [],
            },
        ],
        compiledCustomDimensions: [],
    };
