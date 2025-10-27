import { Checkbox } from '@/components/ui/checkbox';
import { CollapsibleTrigger } from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent } from '@radix-ui/react-collapsible';
import { ChevronRight } from 'lucide-react';

interface Filter {
    name: string;
    id?: string;
    quantityBooks?: number;
}

interface Props {
    label: string;
    items: Filter[];
    onChange?: (name: string, checked: boolean) => void;
}

export const SidebarGroupFilterCheckbox = ({ label, items, onChange }: Props) => {
    return (
        <Collapsible
            key={label}
            title={label}
            defaultOpen={true}
            className="group/collapsible"
        >
            <SidebarGroup className="p-0">
                <SidebarGroupLabel
                    asChild
                    className="group/label text-black text-md p-0 mb-6"
                >
                    <CollapsibleTrigger>
                        {label}{' '}
                        <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                    </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-3 ms-2">
                            {items.map((item) => (
                                <div
                                    key={item.id || item.name}
                                    className="flex items-center gap-3"
                                >
                                    <Checkbox
                                        id={item.id || item.name}
                                        onCheckedChange={(checked) => {
                                            if (onChange) {
                                                // Pasar el ID si existe, sino el nombre
                                                onChange(item.id || item.name, checked === true);
                                            }
                                        }}
                                    />
                                    <Label
                                        htmlFor={item.id || item.name}
                                        className="font-normal cursor-pointer"
                                    >
                                        <span className="text-wrap leading-relaxed">
                                            {item.name}{' '}
                                        </span>
                                        <span className="text-gray-400">
                                            ({item.quantityBooks})
                                        </span>
                                    </Label>
                                </div>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </CollapsibleContent>
            </SidebarGroup>
        </Collapsible>
    );
};
