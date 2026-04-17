import React, { useState, createContext, useContext, useRef } from "react";
import type { ReactNode } from "react";
import AppBackDrop from "../../components/ui/AppBackDrop";
import AppDialog from "../../components/ui/AppDialog";

/** Ref types (based on your component methods) */
type AppBackDropRef = {
  handleBackDrop: (value: boolean) => void;
};

type AppDialogRef = {
  handleOpen: (value: unknown) => void;
  handleClose: () => void;
};

/** Context type */
type AppContextType = {
  handleBackDrop: (value: boolean) => void;
  handleDialogOpen: (value: unknown) => void;
  handleDialogClose: () => void;
} & Record<string, unknown>; // allows merging with `value`

/** Create context */
const AppContext = createContext<AppContextType | null>(null);

/** Provider props */
type AppContextProviderProps = {
  children: ReactNode;
  value?: Record<string, unknown>;
};

/** Provider */
const AppContextProvider = ({
  children,
  value = {},
  ...otherProps
}: AppContextProviderProps) => {
  const appBackDropRef = useRef<AppBackDropRef | null>(null);
  const appDialogRef = useRef<AppDialogRef | null>(null);

  const getAppContextProps = (): AppContextType => ({
    handleBackDrop: (val: boolean) => {
      appBackDropRef.current?.handleBackDrop(val);
    },
    handleDialogOpen: (val: unknown) => {
      appDialogRef.current?.handleOpen(val);
    },
    handleDialogClose: () => {
      appDialogRef.current?.handleClose();
    },
    ...value
  });

  return (
    <AppContext.Provider value={getAppContextProps()}>
      {children}
      <AppBackDrop ref={appBackDropRef} />
      <AppDialog ref={appDialogRef} />
    </AppContext.Provider>
  );
};

/** Custom hook (recommended) */
const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppContextProvider");
  }
  return context;
};

export { AppContext, AppContextProvider, useAppContext };