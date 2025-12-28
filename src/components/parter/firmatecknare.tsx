'use client';

import { useMemo } from 'react';
import {
    PenTool,
    Plus,
    Calendar,
    Check,
    X,
    MoreHorizontal,
    User,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCompany } from '@/providers/company-provider';
import { mockShareholders, mockPartners, mockOwnerInfo, mockBoardMeetings } from '@/data/ownership';

// Signatory derived from real data
interface Signatory {
    id: string;
    name: string;
    role: string;
    signatureType: 'ensam' | 'gemensam';
    validFrom: string;
    validTo?: string;
    isActive: boolean;
    source: 'shareholder' | 'partner' | 'board' | 'manual';
}

export function Firmatecknare() {
    const { companyType, company } = useCompany();

    // Derive signatories from real ownership data based on company type
    const signatories = useMemo<Signatory[]>(() => {
        const result: Signatory[] = [];

        if (companyType === 'ab') {
            // For AB: Major shareholders (>50%) and board members can sign
            const majorShareholders = mockShareholders.filter(s => s.ownershipPercentage >= 50);

            majorShareholders.forEach(s => {
                result.push({
                    id: s.id,
                    name: s.name,
                    role: `Aktieägare (${s.ownershipPercentage}%)`,
                    signatureType: 'ensam',
                    validFrom: s.acquisitionDate,
                    isActive: true,
                    source: 'shareholder',
                });
            });

            // Add VD/CEO and board members from latest board meeting
            const latestMeeting = mockBoardMeetings.find(m => m.status === 'protokoll signerat');
            if (latestMeeting) {
                // Chairperson can sign alone
                result.push({
                    id: `board-${latestMeeting.chairperson}`,
                    name: latestMeeting.chairperson,
                    role: 'Styrelsens ordförande',
                    signatureType: 'ensam',
                    validFrom: latestMeeting.date,
                    isActive: true,
                    source: 'board',
                });

                // Other board members sign together
                latestMeeting.attendees
                    .filter(a => a !== latestMeeting.chairperson)
                    .forEach(attendee => {
                        result.push({
                            id: `board-${attendee}`,
                            name: attendee,
                            role: 'Styrelseledamot',
                            signatureType: 'gemensam',
                            validFrom: latestMeeting.date,
                            isActive: true,
                            source: 'board',
                        });
                    });
            }
        } else if (companyType === 'hb' || companyType === 'kb') {
            // For HB/KB: Komplementärer can sign
            const partners = companyType === 'kb'
                ? mockOwnerInfo.kb.partners || []
                : mockPartners;

            partners.forEach(p => {
                const canSignAlone = p.type === 'komplementär' && p.ownershipPercentage >= 50;
                result.push({
                    id: p.id,
                    name: p.name,
                    role: p.type === 'komplementär' ? 'Komplementär' : 'Kommanditdelägare',
                    signatureType: canSignAlone ? 'ensam' : 'gemensam',
                    validFrom: p.joinDate,
                    isActive: !p.isLimitedLiability, // Kommanditdelägare can't sign
                    source: 'partner',
                });
            });
        } else if (companyType === 'forening') {
            // For Förening: Board members from mockOwnerInfo
            const ownerInfo = mockOwnerInfo.forening;
            ownerInfo.boardMembers?.forEach((member, idx) => {
                result.push({
                    id: `member-${idx}`,
                    name: member.name,
                    role: member.role,
                    signatureType: member.role === 'Ordförande' ? 'ensam' : 'gemensam',
                    validFrom: member.since,
                    isActive: true,
                    source: 'board',
                });
            });
        } else if (companyType === 'ef') {
            // For EF: Only the owner can sign
            const owner = mockOwnerInfo.ef.owner;
            if (owner) {
                result.push({
                    id: 'owner',
                    name: owner.name,
                    role: 'Innehavare',
                    signatureType: 'ensam',
                    validFrom: '2020-01-01', // Could be from registration
                    isActive: true,
                    source: 'manual',
                });
            }
        }

        // Remove duplicates by name
        const uniqueByName = result.filter((s, idx, arr) =>
            arr.findIndex(x => x.name === s.name) === idx
        );

        return uniqueByName;
    }, [companyType]);

    const activeSignatories = signatories.filter(s => s.isActive);
    const ensamSignatories = activeSignatories.filter(s => s.signatureType === 'ensam');
    const gemensamSignatories = activeSignatories.filter(s => s.signatureType === 'gemensam');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">
                        Firmatecknare baserat på {company?.name || 'företagets'} ägarstruktur och styrelse.
                    </p>
                </div>
                <Button size="sm" className="gap-1.5">
                    <Plus className="h-4 w-4" />
                    Lägg till
                </Button>
            </div>

            {/* Ensam firmateckning */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <PenTool className="h-4 w-4 text-emerald-500" />
                        Ensam firmateckning
                    </CardTitle>
                    <CardDescription>
                        Dessa personer kan teckna firman var för sig.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {ensamSignatories.length > 0 ? (
                        <div className="divide-y">
                            {ensamSignatories.map((signatory) => (
                                <SignatoryRow key={signatory.id} signatory={signatory} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                            Inga registrerade med ensam firmateckningsrätt.
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Gemensam firmateckning */}
            {gemensamSignatories.length > 0 && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <PenTool className="h-4 w-4 text-blue-500" />
                            Gemensam firmateckning
                        </CardTitle>
                        <CardDescription>
                            Dessa personer måste teckna firman tillsammans (två i förening).
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="divide-y">
                            {gemensamSignatories.map((signatory) => (
                                <SignatoryRow key={signatory.id} signatory={signatory} />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Info card */}
            <Card className="bg-muted/30 border-dashed">
                <CardContent className="py-4">
                    <p className="text-sm text-muted-foreground">
                        💡 Ändringar av firmatecknare måste registreras hos Bolagsverket.
                        Använd "Ny åtgärd" under Händelser för att starta processen.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

function SignatoryRow({ signatory }: { signatory: Signatory }) {
    return (
        <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                    <p className="text-sm font-medium">{signatory.name}</p>
                    <p className="text-xs text-muted-foreground">{signatory.role}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="text-right">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Från {signatory.validFrom}
                    </div>
                </div>
                <div className={cn(
                    "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full",
                    signatory.isActive
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                )}>
                    {signatory.isActive ? (
                        <>
                            <Check className="h-3 w-3" />
                            Aktiv
                        </>
                    ) : (
                        <>
                            <X className="h-3 w-3" />
                            Inaktiv
                        </>
                    )}
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>Redigera</DropdownMenuItem>
                        <DropdownMenuItem>Visa historik</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Avregistrera</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
