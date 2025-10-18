import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
} from '@/components/ui/sidebar';
import { ChevronRight } from 'lucide-react';

interface Filter {
    name: string;
}

interface Props {
    label: string;
    items: Filter[];
}

export const SidebarGroupFilterRadioGroup = ({ label, items }: Props) => {
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
                            <RadioGroup defaultValue="0">
                                {items.map((item, index) => (
                                    <div key={item.name} className="flex items-center gap-3">
                                        <RadioGroupItem
                                            value={index.toString()}
                                            id={`${item.name}${index}`}
                                        />
                                        <Label htmlFor={`${item.name}${index}`}>
                                            {item.name}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </CollapsibleContent>
            </SidebarGroup>
        </Collapsible>
    );
};
