import React, {
  forwardRef,
  useState,
  useImperativeHandle,  
} from 'react';
import type { ReactNode } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import AppDialogService from '../../services/appDialogService';
import type { DialogProps } from '@mui/material';

/* ================= TYPES ================= */

type ActionType = {
  id?: string | number;
  name?: string;
  type?: string;
  label?: string;
  event?: () => void;
};

type AppDialogData = {
  title?: string | null;
  contentText?: string | null;
  component?: ReactNode;
  maxWidth?: DialogProps['maxWidth'];
  type?: string | null;
  requiredCancelBtn?: boolean;
  requiredOKBtn?: boolean;
  actions?: ActionType[];
};

export type AppDialogRef = {
  handleOpen: (data: AppDialogData) => void;
  handleClose: () => void;
};

type AppDialogProps = {
  children?: ReactNode;
  maxWidth?: DialogProps['maxWidth'];
  requiredCancelBtn?: boolean;
  requiredOKBtn?: boolean;
  actions?: ActionType[];
};

/* ================= COMPONENT ================= */

const AppDialog = forwardRef<AppDialogRef, AppDialogProps>(
  (
    {
      children,
      maxWidth,
      requiredCancelBtn = false,
      requiredOKBtn = false,
      actions = []
    },
    ref
  ) => {
    const [open, setOpen] = useState<boolean>(false);

    const defaultProps: AppDialogData = {
      title: null,
      contentText: null,
      component: null,
      maxWidth: 'xs',
      type: null
    };

    const [data, setData] = useState<AppDialogData>(defaultProps);

    const { title, contentText, component, type } = data;

    /* ===== expose methods ===== */
    useImperativeHandle(ref, () => ({
      handleOpen,
      handleClose
    }));

    /* ===== handlers ===== */
    const handleOpen = (incoming: AppDialogData) => {
      setOpen(true);
      setData((prev) => ({
        ...prev,
        ...incoming
      }));
    };

    const handleClose = () => {
      setOpen(false);
      setData(defaultProps);
    };

    /* ===== actions builder ===== */
    const getActions = (): ReactNode[] => {
      const arr: ReactNode[] = [];

      /* ---- Cancel Button ---- */
      let needCancelBtn = false;

      if ('requiredCancelBtn' in data) {
        needCancelBtn = !!data.requiredCancelBtn;
      } else {
        needCancelBtn = requiredCancelBtn;
      }

      if (needCancelBtn) {
        arr.push(
          <Button
            key="default-cancel"
            onClick={handleClose}
            color="primary"
            variant="outlined"
            size="small"
            sx={{ fontSize: 12, lineHeight: 1 }}
          >
            Cancel
          </Button>
        );
      }

      /* ---- OK Button ---- */
      let needOkBtn = false;

      if ('requiredOKBtn' in data) {
        needOkBtn = !!data.requiredOKBtn;
      } else {
        needOkBtn = requiredOKBtn;
      }

      if (needOkBtn) {
        arr.push(
          <Button
            key="default-ok"
            onClick={handleClose}
            color="primary"
            variant="outlined"
            size="small"
            sx={{ fontSize: 12, lineHeight: 1 }}
          >
            OK
          </Button>
        );
      }

      /* ---- Custom Actions ---- */
      const arrActions = data.actions ?? actions;

      if (arrActions?.length) {
        const btnProps = {
          color: 'primary' as const,
          variant: 'outlined' as const,
          size: 'small' as const,
          sx: { fontSize: 12, lineHeight: 1 }
        };

        arrActions.forEach((obj, index) => {
          const name = obj.name?.toUpperCase();
          const type = obj.type?.toUpperCase();

          if (name === 'CANCEL' || type === 'CANCEL') {
            arr.push(
              <Button
                key={`ac-btn-cancel-${index}`}
                {...btnProps}
                onClick={handleClose}
              >
                {obj.label ?? 'Cancel'}
              </Button>
            );
          } else if (name === 'OK' || type === 'OK') {
            arr.push(
              <Button
                key={`ac-btn-ok-${index}`}
                {...btnProps}
                onClick={handleClose}
              >
                {obj.label ?? 'OK'}
              </Button>
            );
          } else {
            arr.push(
              <Button
                key={`ac-btn-${obj.id ?? index}`}
                {...btnProps}
                onClick={obj.event}
              >
                {obj.label}
              </Button>
            );
          }
        });
      }

      return arr;
    };

    /* ===== render ===== */
    return (
      <div>
        {open && (
          <Dialog
            open={open}
            onClose={() => {}}
            aria-labelledby="form-dialog-title"
            maxWidth={data.maxWidth ?? maxWidth}
            fullWidth
          >
            {title && (
              <DialogTitle
                id="form-dialog-title"
                sx={{ fontSize: 16, lineHeight: 1, p: 1, fontWeight: 'bold' }}
              >
                {title}
              </DialogTitle>
            )}

            {(children ||
              contentText ||
              component ||
              type === 'FORM' ||
              type === 'MULTIPART-FORM') && (
              <DialogContent sx={{ p: 0 }}>
                {contentText && (
                  <DialogContentText>{contentText}</DialogContentText>
                )}

                {children}
                {component}

                {(type === 'FORM' || type === 'MULTIPART-FORM') &&
                  AppDialogService.getContent(data)}
              </DialogContent>
            )}

            {type !== 'FORM' && type !== 'MULTIPART-FORM' && (
              <DialogActions>
                {getActions()}
              </DialogActions>
            )}
          </Dialog>
        )}
      </div>
    );
  }
);

export default AppDialog;