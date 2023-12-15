/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps } from "@aws-amplify/ui-react";
export declare type EscapeHatchProps = {
    [elementHierarchy: string]: Record<string, unknown>;
} | null;
export declare type VariantValues = {
    [key: string]: string;
};
export declare type Variant = {
    variantValues: VariantValues;
    overrides: EscapeHatchProps;
};
export declare type ValidationResponse = {
    hasError: boolean;
    errorMessage?: string;
};
export declare type ValidationFunction<T> = (value: T, validationResponse: ValidationResponse) => ValidationResponse | Promise<ValidationResponse>;
export declare type SignupInputValues = {};
export declare type SignupValidationValues = {};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type SignupOverridesProps = {
    SignupGrid?: PrimitiveOverrideProps<GridProps>;
} & EscapeHatchProps;
export declare type SignupProps = React.PropsWithChildren<{
    overrides?: SignupOverridesProps | undefined | null;
} & {
    onSubmit: (fields: SignupInputValues) => void;
    onChange?: (fields: SignupInputValues) => SignupInputValues;
    onValidate?: SignupValidationValues;
} & React.CSSProperties>;
export default function Signup(props: SignupProps): React.ReactElement;
