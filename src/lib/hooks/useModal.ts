import { useCallback, useState } from 'react';

export function useModal<T>() {
  const [selected, setSelected] = useState<T>();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleOpen = useCallback((item?: T) => {
    setSelected(item);
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    handleClose,
    handleOpen,
    isOpen,
    selected,
  };
}
