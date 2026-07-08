import React, { useState } from 'react'
import { ThemeProvider, useTheme } from '@/app/providers/ThemeProvider'
import { Heading, Text, Caption, Label, Code } from '@/shared/ui/Typography'
import { Button, IconButton } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Badge } from '@/shared/ui/Badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/ui/Avatar'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/shared/ui/Card'
import { Surface } from '@/shared/ui/Surface'
import { Separator } from '@/shared/ui/Separator'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/shared/ui/Tooltip'
import { Spinner } from '@/shared/ui/Spinner'
import { Progress } from '@/shared/ui/Progress'
import { Skeleton } from '@/shared/ui/Skeleton'
import { Icons } from '@/shared/ui/Icons'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { Modal, ModalTrigger, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from '@/shared/ui/Modal'
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from '@/shared/ui/Drawer'
import { Toaster, toast } from '@/shared/ui/Toast'

// Phase 3 Infrastructure Imports
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem, SelectLabel } from '@/shared/ui/Select'
import { Combobox } from '@/shared/ui/Combobox'
import { DatePicker } from '@/shared/ui/DatePicker'
import { DataTable } from '@/shared/ui/DataTable'
import { FileUpload } from '@/shared/ui/FileUpload'
import { CommandMenu } from '@/features/command-palette'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/shared/ui/Charts'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <Button 
      variant="outline" 
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? <Icons.sun className="mr-2 h-4 w-4" /> : <Icons.moon className="mr-2 h-4 w-4" />}
      Toggle Theme
    </Button>
  )
}

function Section({ title, children }) {
  return (
    <section className="space-y-6 pt-10 border-t border-[var(--color-border-subtle)]">
      <Heading level={3}>{title}</Heading>
      <div className="space-y-8">{children}</div>
    </section>
  )
}

function ShowcaseGroup({ title, children }) {
  return (
    <div className="space-y-4">
      <Heading level={5} className="text-[var(--text-secondary)]">{title}</Heading>
      <div className="flex flex-wrap gap-4 items-end">
        {children}
      </div>
    </div>
  )
}

// Dummy data for Table & Chart
const tableData = [
  { id: '1', task: 'Design System', status: 'Done', priority: 'High' },
  { id: '2', task: 'Phase 3 Infra', status: 'In Progress', priority: 'High' },
  { id: '3', task: 'Feature Dev', status: 'Todo', priority: 'Medium' },
]
const tableColumns = [
  { accessorKey: 'task', header: 'Task' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'priority', header: 'Priority' },
]

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--accent-cyan)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--accent-violet)",
  },
}


export default function UIDesignSystem() {
  const [progress, setProgress] = useState(33)
  const [date, setDate] = useState()
  const [comboValue, setComboValue] = useState('')

  return (
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] p-8 font-sans transition-colors duration-200">
          <div className="max-w-6xl mx-auto space-y-12 pb-24">
            
            {/* HEADER */}
            <header className="flex items-center justify-between pb-8">
              <div>
                <Heading level={1} className="mb-2">Aura UI System</Heading>
                <Text variant="muted">Living documentation of components and infrastructure.</Text>
              </div>
              <div className="flex gap-4 items-center">
                <CommandMenu />
                <ThemeToggle />
              </div>
            </header>

            {/* PHASE 3: INFRASTRUCTURE (NEW!) */}
            <Section title="Infrastructure Components (Phase 3)">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <Label>Select</Label>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>North America</SelectLabel>
                        <SelectItem value="est">Eastern Standard Time (EST)</SelectItem>
                        <SelectItem value="cst">Central Standard Time (CST)</SelectItem>
                        <SelectItem value="mst">Mountain Standard Time (MST)</SelectItem>
                        <SelectItem value="pst">Pacific Standard Time (PST)</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label>Combobox</Label>
                  <Combobox 
                    options={[
                      { label: "React", value: "react" },
                      { label: "Vue", value: "vue" },
                      { label: "Svelte", value: "svelte" },
                    ]}
                    value={comboValue}
                    onChange={setComboValue}
                    placeholder="Select framework..."
                    className="w-full"
                  />
                </div>

                <div className="space-y-4">
                  <Label>Date Picker</Label>
                  <DatePicker 
                    date={date} 
                    setDate={setDate} 
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                <div className="space-y-4">
                  <Label>Data Table (TanStack)</Label>
                  <DataTable 
                    columns={tableColumns} 
                    data={tableData} 
                    emptyIcon={Icons.search}
                  />
                </div>

                <div className="space-y-4">
                  <Label>File Upload</Label>
                  <FileUpload />
                </div>
              </div>

              <div className="pt-8">
                <Label>Charts (Recharts)</Label>
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Overview Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                      <BarChart accessibilityLayer data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="month"
                          tickLine={false}
                          tickMargin={10}
                          axisLine={false}
                          tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
                        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
            </Section>

            {/* TYPOGRAPHY */}
            <Section title="Typography (Text)">
              <ShowcaseGroup title="Headings">
                <div className="space-y-4 w-full">
                  <Heading level={1}>Heading 1</Heading>
                  <Heading level={2}>Heading 2</Heading>
                  <Heading level={3}>Heading 3</Heading>
                  <Heading level={4}>Heading 4</Heading>
                  <Heading level={5}>Heading 5</Heading>
                  <Heading level={6}>Heading 6</Heading>
                </div>
              </ShowcaseGroup>
              <ShowcaseGroup title="Paragraphs & Utilities">
                <div className="space-y-4 w-full">
                  <Text size="lg">Large Text: The quick brown fox jumps over the lazy dog.</Text>
                  <Text>Default Text: The quick brown fox jumps over the lazy dog.</Text>
                  <Text size="sm" variant="muted">Small Muted Text: The quick brown fox jumps over the lazy dog.</Text>
                  <Label>Label Text</Label>
                  <br />
                  <Caption>Caption Text</Caption>
                  <br />
                  <Code>import React from 'react'</Code>
                </div>
              </ShowcaseGroup>
            </Section>

            {/* BUTTONS */}
            <Section title="Buttons">
              <ShowcaseGroup title="Variants">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
              </ShowcaseGroup>
              <ShowcaseGroup title="Sizes">
                <Button size="xs">Extra Small</Button>
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
              </ShowcaseGroup>
              <ShowcaseGroup title="States & Icons">
                <Button isLoading>Loading</Button>
                <Button disabled>Disabled</Button>
                <Button variant="primary"><Icons.settings className="mr-2 h-4 w-4" /> With Icon</Button>
                <IconButton><Icons.settings className="h-5 w-5" /></IconButton>
              </ShowcaseGroup>
            </Section>

            {/* INPUTS */}
            <Section title="Inputs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="input-sm">Small Input</Label>
                  <Input id="input-sm" size="sm" placeholder="Enter text..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="input-md">Medium Input</Label>
                  <Input id="input-md" size="md" placeholder="Enter text..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="input-lg">Large Input</Label>
                  <Input id="input-lg" size="lg" placeholder="Enter text..." />
                </div>
              </div>
            </Section>

            {/* BADGES & AVATARS */}
            <Section title="Indicators">
              <ShowcaseGroup title="Badges">
                <Badge variant="default">Default</Badge>
                <Badge variant="primary">Primary</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="danger">Danger</Badge>
              </ShowcaseGroup>
              <ShowcaseGroup title="Avatars">
                <Avatar size="sm"><AvatarFallback>SM</AvatarFallback></Avatar>
                <Avatar size="md"><AvatarFallback>MD</AvatarFallback></Avatar>
                <Avatar size="lg">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>LG</AvatarFallback>
                </Avatar>
                <Avatar size="xl"><AvatarFallback>XL</AvatarFallback></Avatar>
              </ShowcaseGroup>
            </Section>

            {/* SURFACES & CARDS */}
            <Section title="Surfaces & Cards">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Surface variant="flat" className="p-6">
                  <Heading level={5}>Flat Surface</Heading>
                  <Text variant="muted" className="mt-2">bg-base with no elevation.</Text>
                </Surface>
                <Surface variant="elevated" className="p-6">
                  <Heading level={5}>Elevated Surface</Heading>
                  <Text variant="muted" className="mt-2">bg-elevated with shadow 1.</Text>
                </Surface>
                <Surface variant="glass" className="p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent-cyan)]/20 to-[var(--accent-violet)]/20 -z-10" />
                  <Heading level={5}>Glass Surface</Heading>
                  <Text variant="muted" className="mt-2">backdrop blur with subtle border.</Text>
                </Surface>
              </div>

              <div className="pt-4">
                <Card className="max-w-md">
                  <CardHeader>
                    <CardTitle>Composed Card</CardTitle>
                    <Text variant="muted">Built on top of the Elevated Surface primitive.</Text>
                  </CardHeader>
                  <CardContent>
                    <Text>This is the content area of the card. It inherits padding and typography rules.</Text>
                  </CardContent>
                  <CardFooter className="justify-end gap-2">
                    <Button variant="ghost">Cancel</Button>
                    <Button>Save changes</Button>
                  </CardFooter>
                </Card>
              </div>
            </Section>

            {/* OVERLAYS */}
            <Section title="Overlays & Feedback">
              <ShowcaseGroup title="Tooltips">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline">Hover me</Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>I am a tooltip!</p>
                  </TooltipContent>
                </Tooltip>
              </ShowcaseGroup>

              <ShowcaseGroup title="Modals & Drawers">
                <Modal>
                  <ModalTrigger asChild>
                    <Button variant="outline">Open Modal</Button>
                  </ModalTrigger>
                  <ModalContent>
                    <ModalHeader>
                      <ModalTitle>Edit Profile</ModalTitle>
                      <ModalDescription>Make changes to your profile here.</ModalDescription>
                    </ModalHeader>
                    <div className="py-4">
                      <Input placeholder="Name" />
                    </div>
                    <ModalFooter>
                      <Button>Save changes</Button>
                    </ModalFooter>
                  </ModalContent>
                </Modal>

                <Drawer>
                  <DrawerTrigger asChild>
                    <Button variant="outline">Open Drawer</Button>
                  </DrawerTrigger>
                  <DrawerContent side="right">
                    <DrawerHeader>
                      <DrawerTitle>Settings Drawer</DrawerTitle>
                      <DrawerDescription>Configure your app preferences.</DrawerDescription>
                    </DrawerHeader>
                    <div className="flex-1 p-6">
                      <Text>Drawer content goes here...</Text>
                    </div>
                    <DrawerFooter>
                      <Button className="w-full">Save settings</Button>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>

                <Button variant="outline" onClick={() => toast.success('Event created', { description: 'Sunday, December 03, 2023 at 9:00 AM' })}>
                  Show Toast
                </Button>
              </ShowcaseGroup>
            </Section>

            {/* STATES */}
            <Section title="States & Progress">
              <ShowcaseGroup title="Spinners & Progress">
                <Spinner size="sm" />
                <Spinner size="md" />
                <Spinner size="lg" />
                <div className="w-64 ml-4">
                  <Progress value={progress} />
                  <Button variant="ghost" size="xs" onClick={() => setProgress(p => (p + 10) % 100)} className="mt-2">Update</Button>
                </div>
              </ShowcaseGroup>

              <ShowcaseGroup title="Skeletons">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              </ShowcaseGroup>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <EmptyState 
                  icon={Icons.search}
                  title="No results found"
                  description="Try adjusting your search filters."
                  action={<Button variant="outline">Clear Filters</Button>}
                />
                <ErrorState />
              </div>
            </Section>
            
          </div>
          <Toaster />
        </div>
      </TooltipProvider>
    </ThemeProvider>
  )
}
