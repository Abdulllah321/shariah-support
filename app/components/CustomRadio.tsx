import {useRadio, VisuallyHidden, RadioProps, cn} from "@heroui/react";

export const CustomRadio = (props: RadioProps) => {
    const {
        Component,
        children,
        description,
        getBaseProps,
        getWrapperProps,
        getInputProps,
        getLabelProps,
        getLabelWrapperProps,
        getControlProps,
    } = useRadio(props);

    return (
        <Component
            {...getBaseProps()}
            className={cn(
                "group inline-flex items-center justify-between flex-row-reverse",
                "w-full cursor-pointer border-2 border-default rounded-lg gap-4 p-4",
                "data-[selected=true]:border-secondary",
            )}
        >
            <VisuallyHidden>
                <input {...getInputProps()} />
            </VisuallyHidden>
            <span {...getWrapperProps()}>
        <span {...getControlProps()} />
      </span>
            <div {...getLabelWrapperProps()}>
                {children && <span {...getLabelProps()}>{children}</span>}
                {description && (
                    <span className="text-small text-foreground opacity-70">{description}</span>
                )}
            </div>
        </Component>
    );
};
