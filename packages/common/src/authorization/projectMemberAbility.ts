import { type AbilityBuilder } from '@casl/ability';
import { type ProjectMemberProfile } from '../types/projectMemberProfile';
import { type ProjectMemberRole } from '../types/projectMemberRole';
import { ProjectType } from '../types/projects';
import { SpaceMemberRole } from '../types/space';
import { type MemberAbility } from './types';

// eslint-disable-next-line import/prefer-default-export
export const projectMemberAbilities: Record<
    ProjectMemberRole,
    (
        member: Pick<ProjectMemberProfile, 'role' | 'projectUuid' | 'userUuid'>,
        builder: Pick<AbilityBuilder<MemberAbility>, 'can'>,
    ) => void
> = {
    viewer(member, { can }) {
        can('view', 'Dashboard', {
            projectUuid: member.projectUuid,
            isPrivate: false,
        });
        can('view', 'JobStatus', {
            createdByUserUuid: member.userUuid,
        });
        can('view', 'SavedChart', {
            projectUuid: member.projectUuid,
            isPrivate: false,
        });
        can('view', 'Dashboard', {
            projectUuid: member.projectUuid,
            access: {
                $elemMatch: { userUuid: member.userUuid },
            },
        });
        can('view', 'SavedChart', {
            projectUuid: member.projectUuid,
            access: {
                $elemMatch: { userUuid: member.userUuid },
            },
        });
        can('view', 'Space', {
            projectUuid: member.projectUuid,
            isPrivate: false,
        });
        can('view', 'Space', {
            projectUuid: member.projectUuid,
            access: {
                $elemMatch: { userUuid: member.userUuid },
            },
        });
        can('view', 'Project', {
            projectUuid: member.projectUuid,
        });
        can('view', 'PinnedItems', {
            projectUuid: member.projectUuid,
        });
        can('manage', 'ExportCsv', {
            projectUuid: member.projectUuid,
        });
        can('view', 'DashboardComments', {
            projectUuid: member.projectUuid,
        });
        can('view', 'Tags', {
            projectUuid: member.projectUuid,
        });
        can('view', 'MetricsTree', {
            projectUuid: member.projectUuid,
        });
        can('view', 'SpotlightTableConfig', {
            projectUuid: member.projectUuid,
        });
        can('view', 'AiAgentThread', {
            projectUuid: member.projectUuid,
            userUuid: member.userUuid,
        });
    },
    interactive_viewer(member, { can }) {
        projectMemberAbilities.viewer(member, { can });
        can('view', 'UnderlyingData', {
            projectUuid: member.projectUuid,
        });
        can('view', 'SemanticViewer', {
            projectUuid: member.projectUuid,
        });
        can('manage', 'Explore', {
            projectUuid: member.projectUuid,
        });
        can('manage', 'ChangeCsvResults', {
            projectUuid: member.projectUuid,
        });
        can('create', 'ScheduledDeliveries', {
            projectUuid: member.projectUuid,
        });
        can('create', 'DashboardComments', {
            projectUuid: member.projectUuid,
        });
        can('manage', 'Dashboard', {
            projectUuid: member.projectUuid,
            access: {
                $elemMatch: {
                    userUuid: member.userUuid,
                    role: SpaceMemberRole.EDITOR,
                },
            },
        });
        can('manage', 'SavedChart', {
            projectUuid: member.projectUuid,
            access: {
                $elemMatch: {
                    userUuid: member.userUuid,
                    role: SpaceMemberRole.EDITOR,
                },
            },
        });
        can('manage', 'Dashboard', {
            projectUuid: member.projectUuid,
            access: {
                $elemMatch: {
                    userUuid: member.userUuid,
                    role: SpaceMemberRole.ADMIN,
                },
            },
        });
        can('manage', 'SavedChart', {
            projectUuid: member.projectUuid,
            access: {
                $elemMatch: {
                    userUuid: member.userUuid,
                    role: SpaceMemberRole.ADMIN,
                },
            },
        });

        can('manage', 'Space', {
            projectUuid: member.projectUuid,

            access: {
                $elemMatch: {
                    userUuid: member.userUuid,
                    role: SpaceMemberRole.ADMIN,
                },
            },
        });
        can('view', 'AiAgent', {
            projectUuid: member.projectUuid,
        });
        can('create', 'AiAgentThread', {
            projectUuid: member.projectUuid,
        });
    },
    editor(member, { can }) {
        projectMemberAbilities.interactive_viewer(member, { can });
        can('create', 'Space', {
            projectUuid: member.projectUuid,
        });
        can('manage', 'Space', {
            projectUuid: member.projectUuid,
            isPrivate: false,
        });
        can('manage', 'Job');
        can('manage', 'PinnedItems', {
            projectUuid: member.projectUuid,
        });
        can('manage', 'ScheduledDeliveries', {
            projectUuid: member.projectUuid,
        });
        can('manage', 'DashboardComments', {
            projectUuid: member.projectUuid,
        });
        can('manage', 'Tags', {
            projectUuid: member.projectUuid,
        });
        can('manage', 'MetricsTree', {
            projectUuid: member.projectUuid,
        });

        can('manage', 'AiAgentThread', {
            projectUuid: member.projectUuid,
            userUuid: member.userUuid,
        });
    },
    developer(member, { can }) {
        projectMemberAbilities.editor(member, { can });
        can('manage', 'VirtualView', {
            projectUuid: member.projectUuid,
        });
        can('manage', 'CustomSql', {
            projectUuid: member.projectUuid,
        });
        can('manage', 'SqlRunner', {
            projectUuid: member.projectUuid,
        });
        can('manage', 'Validation', {
            projectUuid: member.projectUuid,
        });

        can('manage', 'CompileProject', {
            projectUuid: member.projectUuid,
        });

        can('delete', 'Project', {
            type: ProjectType.PREVIEW,
            createdByUserUuid: member.userUuid,
        });

        can('create', 'Project', {
            upstreamProjectUuid: member.projectUuid,
            type: ProjectType.PREVIEW,
        });

        can('update', 'Project', {
            projectUuid: member.projectUuid,
        });
        can('manage', 'SpotlightTableConfig', {
            projectUuid: member.projectUuid,
        });
        can('manage', 'ContentAsCode', {
            projectUuid: member.projectUuid,
        });
        can('view', 'JobStatus', {
            projectUuid: member.projectUuid,
        });
        can('manage', 'AiAgent', {
            projectUuid: member.projectUuid,
        });
        can('manage', 'AiAgentThread', {
            projectUuid: member.projectUuid,
            userUuid: member.userUuid,
        });
    },
    admin(member, { can }) {
        projectMemberAbilities.developer(member, { can });

        can('delete', 'Project', {
            projectUuid: member.projectUuid,
        });

        can('view', 'Analytics', {
            projectUuid: member.projectUuid,
        });

        can('manage', 'Project', {
            projectUuid: member.projectUuid,
        });

        can('manage', 'Space', {
            projectUuid: member.projectUuid,
        });

        can('manage', 'Dashboard', {
            projectUuid: member.projectUuid,
        });

        can('manage', 'SavedChart', {
            projectUuid: member.projectUuid,
        });
        can('view', 'AiAgentThread', {
            projectUuid: member.projectUuid,
        });
        can('manage', 'AiAgentThread', {
            projectUuid: member.projectUuid,
        });
    },
};
