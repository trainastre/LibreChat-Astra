import { Input, Label } from '@librechat/client';
import { Controller, useWatch, useFormContext } from 'react-hook-form';
import type { AgentForm } from '~/common';
import { ResolvedProviderIcon } from '~/components/Endpoints/ResolvedProviderIcon';
import AgentCategorySelector from './AgentCategorySelector';
import { useLocalize, useAgentCapabilities } from '~/hooks';
import { useAgentFileEntries } from './Tools/hooks';
import { useAgentPanelContext } from '~/Providers';
import { useProviderIcon } from '~/hooks/Endpoint';
import ToolsSection from './Tools/ToolsSection';
import { validateEmail, cn } from '~/utils';
import Instructions from './Instructions';
import FileContext from './FileContext';
import AgentAvatar from './AgentAvatar';
import { Panel } from '~/common';

const fieldClass = 'h-9';

export default function AgentConfig() {
  const localize = useLocalize();
  const methods = useFormContext<AgentForm>();
  const { setActivePanel, endpointsConfig, agentsConfig } = useAgentPanelContext();
  const { contextEnabled } = useAgentCapabilities(agentsConfig?.capabilities);

  const {
    control,
    formState: { errors },
  } = methods;
  const provider = useWatch({ control, name: 'provider' });
  const model = useWatch({ control, name: 'model' });
  const agent = useWatch({ control, name: 'agent' });
  const agent_id = useWatch({ control, name: 'id' });
  const { contextFiles } = useAgentFileEntries();

  const providerValue = typeof provider === 'string' ? provider : provider?.value;
  const { provider: providerId, imageURL } = useProviderIcon({
    endpoint: providerValue as string,
    endpointsConfig,
  });

  return (
    <>
      <div className="h-auto pt-1">
        {/* === SECTION: Informations Générales === */}
        <div className="mb-6 rounded-xl border border-border-light bg-surface-secondary/30 p-4 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-secondary">Informations Générales</h3>
          {/* Avatar & Name */}
          <div className="mb-4">
            <AgentAvatar avatar={agent?.['avatar'] ?? null} />
          <label className={labelClass} htmlFor="name">
            {localize('com_ui_name')}
          </label>
          <Controller
            name="name"
            rules={{ required: localize('com_ui_agent_name_is_required') }}
            control={control}
            render={({ field }) => (
              <div className="flex flex-col">
                <Input
                  {...field}
                  value={field.value ?? ''}
                  maxLength={256}
                  className={cn(fieldClass, 'font-medium')}
                  id="name"
                  type="text"
                  placeholder={localize('com_agents_name_placeholder')}
                  aria-label={localize('com_ui_agent_name')}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'agent-name-error' : undefined}
                />
                {errors.name && (
                  <div
                    id="agent-name-error"
                    className="mt-1 text-xs text-text-destructive"
                    role="alert"
                  >
                    {errors.name.message}
                  </div>
                )}
              </div>
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                value={field.value ?? ''}
                maxLength={512}
                className={fieldClass}
                id="description"
                type="text"
                placeholder={localize('com_agents_description_placeholder')}
                aria-label={localize('com_ui_agent_description')}
              />
            )}
          />
        </div>
        {/* Category */}
        <div className="mb-4">
          <label className={labelClass} htmlFor="category-selector">
            {localize('com_ui_category')}
          </label>
          <AgentCategorySelector className="w-full" />
        </div>
        </div>

        {/* === SECTION: Comportement === */}
        <div className="mb-6 rounded-xl border border-border-light bg-surface-secondary/30 p-4 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-secondary">Instructions</h3>
        {/* Instructions */}
        <Instructions />
        </div>

        {/* === SECTION: Modèle === */}
        <div className="mb-6 rounded-xl border border-border-light bg-surface-secondary/30 p-4 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-secondary">Modèle & Contexte</h3>
        {/* Model and Provider */}
        <div className="mb-4">
          <label className={labelClass} htmlFor="provider">
            {localize('com_ui_model')}
          </label>
          <button
            id="provider"
            type="button"
            onClick={() => setActivePanel(Panel.model)}
            title={model || undefined}
            className={cn(
              'relative flex h-9 w-full min-w-0 items-center overflow-hidden rounded-lg border border-border-light bg-surface-secondary text-sm font-medium text-text-primary transition-colors hover:bg-surface-tertiary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring-primary',
              model != null && model ? 'px-1' : 'px-3',
            )}
          >
            <div className="flex w-full min-w-0 items-center gap-2">
              {providerValue !== undefined && (
                <div className="shadow-stroke relative flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white text-black dark:bg-white">
                  <ResolvedProviderIcon
                    provider={providerId}
                    imageURL={imageURL}
                    size={16}
                    className="h-2/3 w-2/3"
                  />
                </div>
              )}
            </div>
          </button>
        </div>
        
        {/* File Context moved to Model & Contexte */}
        {contextEnabled && (
          <div className="mt-4 border-t border-border-light pt-4">
            <FileContext agent_id={agent_id} files={context_files} />
          </div>
        )}
        </div>

        {/* === SECTION: Capacités === */}
        <div className="mb-6 rounded-xl border border-border-light bg-surface-secondary/30 p-4 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-secondary">Capacités & Outils</h3>
        {(codeEnabled ||
          fileSearchEnabled ||
          artifactsEnabled ||
          contextEnabled ||
          webSearchEnabled) && (
          <div className="mb-4 flex w-full flex-col items-start gap-3">
            <label className="text-token-text-primary block text-sm font-medium">
              {localize('com_assistants_capabilities')}
            </label>
            {/* Code Execution */}
            {codeEnabled && <CodeForm agent_id={agent_id} files={code_files} />}
            {/* Web Search */}
            {webSearchEnabled && <SearchForm />}
            {/* Artifacts */}
            {artifactsEnabled && <Artifacts />}
            {/* File Search */}
            {fileSearchEnabled && <FileSearch agent_id={agent_id} files={knowledge_files} />}
          </div>
        )}
        {/* MCP Section */}
        {availableMCPServers != null && availableMCPServers.length > 0 && (
          <div className="mt-4 border-t border-border-light pt-4">
            <MCPTools
              agentId={agent_id}
              mcpServerNames={mcpServerNames}
              setShowMCPToolDialog={setShowMCPToolDialog}
            />
          </div>
        )}

        {showSkills && (
          <div className="mt-4 mb-4 border-t border-border-light pt-4">
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="skills_enabled"
                className="text-token-text-primary block text-sm font-medium"
              >
                {localize('com_ui_skills')}
              </label>
              <Controller
                name="skills_enabled"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="skills_enabled"
                    checked={field.value === true}
                    onCheckedChange={(value: boolean) => field.onChange(Boolean(value))}
                    data-testid="skills_enabled"
                    aria-label={localize('com_ui_skills_enable_toggle')}
                  />
                )}
              />
            </div>
            <p className="mb-2 text-xs text-text-secondary">{localize(skillsHintKey)}</p>
            <div
              className={skillsActive === true ? undefined : 'pointer-events-none opacity-50'}
              aria-disabled={skillsActive !== true}
            >
              <div className="mb-1">
                {(skills ?? []).map((skillId) => {
                  const skillName = skillsMap.get(skillId) ?? unresolvedSkills.get(skillId)?.name;
                  /** Hide chips while the catalog page or per-id lookup is in
                   *  flight. Once the backend confirms a miss (deleted or no
                   *  longer shared), the id must stay visible and removable —
                   *  otherwise the allowlist silently scopes the agent to
                   *  zero skills with no way to fix it in the UI. */
                  if (!skillName && unresolvedSkills.get(skillId)?.missing !== true) {
                    return null;
                  }
                  const isUnavailable = !skillName;
                  return (
                    <div
                      key={skillId}
                      className="mb-1 flex items-center justify-between rounded-md border border-border-light px-3 py-2 text-sm"
                    >
                      <span
                        className={
                          isUnavailable
                            ? 'truncate italic text-text-secondary'
                            : 'truncate text-text-primary'
                        }
                        title={isUnavailable ? skillId : undefined}
                      >
                        {skillName ?? localize('com_ui_skill_unavailable')}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const current: string[] = methods.getValues('skills') ?? [];
                          methods.setValue(
                            'skills',
                            current.filter((id) => id !== skillId),
                            { shouldDirty: true },
                          );
                        }}
                        className="ml-2 flex-shrink-0 text-text-secondary transition-colors hover:text-text-primary"
                        aria-label={localize('com_ui_remove_skill_var', {
                          0: skillName ?? skillId,
                        })}
                        disabled={skillsActive !== true}
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => setShowSkillDialog(true)}
                  className="btn btn-neutral border-token-border-light relative h-9 w-full rounded-lg font-medium"
                  aria-haspopup="dialog"
                  disabled={skillsActive !== true}
                >
                  <div className="flex w-full items-center justify-center gap-2">
                    {localize('com_ui_add_skills')}
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Agent Tools & Actions */}
        <div className="mt-4 mb-4 border-t border-border-light pt-4">
          <label className={labelClass}>
            {(() => {
              if (toolsEnabled === true && actionsEnabled === true) {
                return localize('com_ui_tools_and_actions');
              }
              if (toolsEnabled === true) {
                return localize('com_ui_tools');
              }
              if (actionsEnabled === true) {
                return localize('com_assistants_actions');
              }
              return '';
            })()}
          </label>
          <div>
            <div className="mb-1">
              {/* Render all visible IDs */}
              {toolIds.map((toolId, i) => {
                const tool = regularTools?.find((t) => t.pluginKey === toolId);
                if (!tool) return null;
                return (
                  <AgentTool
                    key={`${toolId}-${i}-${agent_id}`}
                    tool={toolId}
                    regularTools={regularTools}
                    agent_id={agent_id}
                  />
                );
              })}
            </div>
            <div className="flex flex-col gap-1">
              {(actions ?? [])
                .filter((action) => action.agent_id === agent_id)
                .map((action, i) => (
                  <Action
                    key={i}
                    action={action}
                    onClick={() => {
                      setAction(action);
                      setActivePanel(Panel.actions);
                    }}
                  />
                ))}
            </div>
            <div className="mt-2 flex space-x-2">
              {(toolsEnabled ?? false) && (
                <button
                  type="button"
                  onClick={() => setShowToolDialog(true)}
                  className="btn btn-neutral border-token-border-light relative h-9 w-full rounded-lg font-medium"
                  aria-haspopup="dialog"
                >
                  <div className="flex w-full items-center justify-center gap-2">
                    {localize('com_assistants_add_tools')}
                  </div>
                </button>
              )}
              {(actionsEnabled ?? false) && (
                <button
                  type="button"
                  disabled={isEphemeralAgent(agent_id)}
                  onClick={handleAddActions}
                  className="btn btn-neutral border-token-border-light relative h-9 w-full rounded-lg font-medium"
                  aria-haspopup="dialog"
                >
                  <div className="flex w-full items-center justify-center gap-2">
                    {localize('com_assistants_add_actions')}
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
        </div>

        {/* === SECTION: Support === */}
        <div className="mb-6 rounded-xl border border-border-light bg-surface-secondary/30 p-4 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-secondary">Contact & Support</h3>
        {/* Support Contact (Optional) */}
        <div className="mb-4">
          <div className="mb-1.5 flex items-center gap-2">
            <span>
              <label className="text-token-text-primary block text-sm font-medium">
                {localize('com_ui_support_contact')}
              </label>
            </span>
          </div>
          <div className="space-y-3">
            {/* Support Contact Name */}
            <div className="flex flex-col">
              <label
                className="mb-1 flex items-center justify-between"
                htmlFor="support-contact-name"
              >
                <span className="text-sm">{localize('com_ui_support_contact_name')}</span>
              </label>
              <Controller
                name="support_contact.name"
                control={control}
                rules={{
                  minLength: {
                    value: 3,
                    message: localize('com_ui_support_contact_name_min_length', { minLength: 3 }),
                  },
                }}
                render={({ field, fieldState: { error } }) => (
                  <>
                    <input
                      {...field}
                      value={field.value ?? ''}
                      className={cn(inputClass, error ? 'border-2 border-red-500' : '')}
                      id="support-contact-name"
                      type="text"
                      placeholder={localize('com_ui_support_contact_name_placeholder')}
                      aria-label={localize('com_ui_support_contact_name')}
                      aria-invalid={error ? 'true' : 'false'}
                      aria-describedby={error ? 'support-contact-name-error' : undefined}
                    />
                    {error && (
                      <span
                        id="support-contact-name-error"
                        className="text-sm text-red-500 transition duration-300 ease-in-out"
                        role="alert"
                        aria-live="polite"
                      >
                        {error.message}
                      </span>
                    )}
                  </>
                )}
              />
            </div>
            {/* Support Contact Email */}
            <div className="flex flex-col">
              <label
                className="mb-1 flex items-center justify-between"
                htmlFor="support-contact-email"
              >
                <span className="text-sm">{localize('com_ui_support_contact_email')}</span>
              </label>
              <Controller
                name="support_contact.email"
                control={control}
                rules={{
                  validate: (value) =>
                    validateEmail(value ?? '', localize('com_ui_support_contact_email_invalid')),
                }}
                render={({ field, fieldState: { error } }) => (
                  <>
                    <input
                      {...field}
                      value={field.value ?? ''}
                      className={cn(inputClass, error ? 'border-2 border-red-500' : '')}
                      id="support-contact-email"
                      type="email"
                      placeholder={localize('com_ui_support_contact_email_placeholder')}
                      aria-label={localize('com_ui_support_contact_email')}
                      aria-invalid={error ? 'true' : 'false'}
                      aria-describedby={error ? 'support-contact-email-error' : undefined}
                    />
                    {error && (
                      <span
                        id="support-contact-email-error"
                        className="text-sm text-red-500 transition duration-300 ease-in-out"
                        role="alert"
                        aria-live="polite"
                      >
                        {error.message}
                      </span>
                    )}
                  </>
                )}
              />
            </div>
          </div>
        </div>
        </div>
      </div>
      <ToolSelectDialog
        isOpen={showToolDialog}
        setIsOpen={setShowToolDialog}
        endpoint={EModelEndpoint.agents}
      />
      {availableMCPServers != null && availableMCPServers.length > 0 && (
        <MCPToolSelectDialog
          agentId={agent_id}
          isOpen={showMCPToolDialog}
          mcpServerNames={mcpServerNames}
          setIsOpen={setShowMCPToolDialog}
          endpoint={EModelEndpoint.agents}
        />
      )}
      {showSkills && <SkillSelectDialog isOpen={showSkillDialog} setIsOpen={setShowSkillDialog} />}
    </>
  );
}
