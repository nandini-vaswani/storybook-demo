'use client'

import * as React from 'react'
import { ChevronDownIcon } from 'lucide-react'
import { Accordion as AccordionPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

// Ported as-is from apps/web/src/components/ui/accordion.tsx (hgu-platform).

function Accordion({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn('max-w-3xl mx-auto space-y-4', className)}
      {...props}
    />
  )
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        'faq-item bg-[#1a1a1a] rounded-2xl overflow-hidden border-b last:border-b-0',
        className,
      )}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'p-6 text-lg font-light text-white hover:no-underline hover:text-(--primary-yellow) transition-colors w-full flex items-center justify-between text-left group',
          '[&>svg]:w-6 [&>svg]:h-6 [&>svg]:text-gray-400 [&>svg]:transition-colors  data-[state=open]:text-(--primary-yellow) [&[data-state=open]>svg]:rotate-180 [&[data-state=open]>svg]:text-(--primary-yellow)',
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon className="pointer-events-none size-4 shrink-0 translate-y-0.5 text-muted-foreground transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down "
      {...props}
    >
      <div
        className={cn(
          'pt-0 p-0 px-6 pb-6  text-gray-400 prose prose-invert prose-sm max-w-full',
          className,
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
