import React from "react";
import { FiSearch } from "react-icons/fi";
import { AdminInput, AdminInputProps } from "./AdminInput";

export type AdminSearchInputProps = AdminInputProps;

export const AdminSearchInput = React.forwardRef<HTMLInputElement, AdminSearchInputProps>(
  (props, ref) => {
    const { startContent, ...otherProps } = props;

    return (
      <AdminInput
        ref={ref}
        startContent={
          startContent || (
            <FiSearch className="text-xs text-[var(--text-color-secondary)]" />
          )
        }
        {...otherProps}
      />
    );
  }
);

AdminSearchInput.displayName = "AdminSearchInput";
