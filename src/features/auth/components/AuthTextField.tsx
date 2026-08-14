import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

const FIELD_CLASSES =
  'w-full rounded-lg border bg-transparent px-3 py-2 text-base text-[#1B1D1B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3652E0] dark:text-[#ECEEE8] dark:focus-visible:outline-[#8493FF]'
const FIELD_BORDER = 'border-[#DBDFD3] dark:border-[#2C3130]'
const FIELD_BORDER_INVALID = 'border-[#C23A2E] dark:border-[#FF7A6B]'

interface AuthTextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string
  invalid?: boolean
  /** Rendered inside the field, right-aligned (e.g. the password show/hide toggle). */
  trailing?: ReactNode
}

/** Standard labeled input box used by the Login/Register forms — replaces
 *  the earlier inline fill-in-the-blank sentence pattern. */
export const AuthTextField = forwardRef<HTMLInputElement, AuthTextFieldProps>(
  function AuthTextField({ label, invalid = false, trailing, id, name, ...rest }, ref) {
    const fieldId = id ?? name

    return (
      <label className="flex flex-col gap-1.5 text-sm" htmlFor={fieldId}>
        <span className="font-semibold text-[#1B1D1B] dark:text-[#ECEEE8]">{label}</span>
        <div className="relative">
          <input
            {...rest}
            id={fieldId}
            name={name}
            ref={ref}
            className={[
              FIELD_CLASSES,
              invalid ? FIELD_BORDER_INVALID : FIELD_BORDER,
              trailing ? 'pr-14' : '',
            ].join(' ')}
          />
          {trailing && (
            <div className="absolute inset-y-0 right-3 flex items-center">{trailing}</div>
          )}
        </div>
      </label>
    )
  },
)
