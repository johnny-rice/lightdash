import {
    ApiErrorPayload,
    ApiSlackChannelsResponse,
    ApiSlackCustomSettingsResponse,
    ApiSuccessEmpty,
    ForbiddenError,
    OpenIdIdentityIssuerType,
    SlackAppCustomSettings,
} from '@lightdash/common';
import {
    Body,
    Get,
    Middlewares,
    OperationId,
    Put,
    Query,
    Request,
    Response,
    Route,
    SuccessResponse,
    Tags,
} from '@tsoa/runtime';
import express from 'express';
import {
    allowApiKeyAuthentication,
    isAuthenticated,
    unauthorisedInDemo,
} from './authentication';
import { BaseController } from './baseController';

@Route('/api/v1/slack')
@Response<ApiErrorPayload>('default', 'Error')
@Tags('Integrations')
export class SlackController extends BaseController {
    /**
     * Get slack channels
     * @param req express request
     */
    @Middlewares([allowApiKeyAuthentication, isAuthenticated])
    @SuccessResponse('200', 'Success')
    @Get('/channels')
    @OperationId('getSlackChannels')
    async get(
        @Request() req: express.Request,
        @Query() search?: string,
        @Query() excludeArchived?: boolean,
        @Query() excludeDms?: boolean,
        @Query() excludeGroups?: boolean,
        @Query() forceRefresh?: boolean,
    ): Promise<ApiSlackChannelsResponse> {
        this.setStatus(200);
        const organizationUuid = req.user?.organizationUuid;
        if (!organizationUuid) throw new ForbiddenError();
        return {
            status: 'ok',
            results: await req.clients
                .getSlackClient()
                .getChannels(organizationUuid, search, {
                    excludeArchived,
                    excludeDms,
                    excludeGroups,
                    forceRefresh,
                }),
        };
    }

    /**
     * Update slack notification channel to send notifications to scheduled jobs fail
     * @param req express request
     */
    @Middlewares([
        allowApiKeyAuthentication,
        isAuthenticated,
        unauthorisedInDemo,
    ])
    @SuccessResponse('200', 'Success')
    @Put('/custom-settings')
    @OperationId('UpdateCustomSettings')
    async updateCustomSettings(
        @Request() req: express.Request,
        @Body() body: SlackAppCustomSettings,
    ): Promise<ApiSlackCustomSettingsResponse> {
        this.setStatus(200);
        const organizationUuid = req.user?.organizationUuid;
        if (!organizationUuid) throw new ForbiddenError();
        return {
            status: 'ok',
            results: await req.clients
                .getSlackClient()
                .updateAppCustomSettings(
                    `${req.user?.firstName} ${req.user?.lastName}`,
                    organizationUuid,
                    body,
                ),
        };
    }

    /**
     * Check if the user has an OpenID identity for Slack
     * @param req express request
     */
    @Middlewares([isAuthenticated])
    @Get('/is-authenticated')
    @OperationId('IsSlackOpenIdLinked')
    async isSlackOpenIdLinked(
        @Request() req: express.Request,
    ): Promise<ApiSuccessEmpty> {
        this.setStatus(200);

        // This will throw a 404 if not found
        await req.services
            .getUserService()
            .isOpenIdLinked(
                req.user?.userUuid!,
                OpenIdIdentityIssuerType.SLACK,
            );

        return {
            status: 'ok',
            results: undefined,
        };
    }
}
