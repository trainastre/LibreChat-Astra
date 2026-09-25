import { Controller, useFormContext } from 'react-hook-form';
import type { AgentForm } from '~/common';
import { VariableEditor } from '~/components/Variables';
import { useLocalize } from '~/hooks';

export default function Instructions() {
  const localize = useLocalize();
  const { control } = useFormContext<AgentForm>();

  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center">
        <label className="sr-only" htmlFor="instructions">
          {localize('com_ui_instructions')}
        </label>
        <div title="Add variables to instructions">
          <DropdownPopup
            portal={true}
            mountByState={true}
            unmountOnHide={true}
            preserveTabOrder={true}
            isOpen={isMenuOpen}
            setIsOpen={setIsMenuOpen}
            trigger={
              <Menu.MenuButton
                id="variables-menu-button"
                aria-label="Add variable to instructions"
                className="flex h-7 items-center gap-1 rounded-md border border-border-medium bg-surface-secondary px-2 py-0 text-sm text-text-primary transition-colors duration-200 hover:bg-surface-tertiary"
              >
                <PlusCircle className="mr-1 h-3 w-3 text-text-secondary" aria-hidden={true} />
                {localize('com_ui_variables')}
              </Menu.MenuButton>
            }
            items={variableOptions.map((option) => ({
              label: localize(option.label) || option.label,
              onClick: () => handleAddVariable(option.label, option.value),
            }))}
            menuId={menuId}
            className="z-30"
          />
        </div>
      </div>
      <Controller
        name="instructions"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <>
            <textarea
              {...field}
              value={field.value ?? ''}
              className={cn(inputClass, 'min-h-[100px] resize-y')}
              id="instructions"
              placeholder={localize('com_agents_instructions_placeholder')}
              rows={3}
              aria-label="Agent instructions"
              aria-required="true"
              aria-invalid={error ? 'true' : 'false'}
            />
            {error && (
              <span
                className="text-sm text-red-500 transition duration-300 ease-in-out"
                role="alert"
              >
                {localize('com_ui_field_required')}
              </span>
            )}
          </>
        )}
      />
    </div>
  );
}
