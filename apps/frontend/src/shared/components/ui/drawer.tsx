'use client';

import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { Fragment, ReactNode } from 'react';

type DrawerProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
};

export function Drawer({ open, title, children, onClose }: DrawerProps) {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <TransitionChild
          as={Fragment}
          enter="transition-opacity duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </TransitionChild>

        <div className="fixed inset-0 flex justify-end">
          <TransitionChild
            as={Fragment}
            enter="transition-transform duration-200"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition-transform duration-150"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <DialogPanel className="h-full w-full max-w-md border-l border-line bg-panel p-4">
              <h3 className="text-lg font-semibold text-text">{title}</h3>
              <div className="mt-4 h-[calc(100%-2rem)] overflow-auto">{children}</div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
