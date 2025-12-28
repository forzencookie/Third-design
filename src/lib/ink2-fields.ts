/**
 * Complete INK2 Field Definitions
 * Based on official Skatteverket specification: SKV2002-33-01-24-04
 * 
 * This file contains all field codes for:
 * - INK2 (Main form)
 * - INK2R (Räkenskapsschema - Balance sheet & Income statement)
 * - INK2S (Skattemässiga justeringar)
 */

// =============================================================================
// Field Metadata Type
// =============================================================================

export interface FieldDefinition {
    code: number | string
    label: string
    section: string
    dataType: 'date' | 'amount' | 'text' | 'integer'
    sign?: '+' | '-' | '*'  // + income, - expense, * neutral
    basAccounts?: number[]  // BAS account mapping
}

// =============================================================================
// INK2 Main Form Fields
// =============================================================================

export const INK2_MAIN_FIELDS: FieldDefinition[] = [
    // Räkenskapsår
    { code: 7011, label: 'Räkenskapsårets början', section: 'Räkenskapsår', dataType: 'date' },
    { code: 7012, label: 'Räkenskapsårets slut', section: 'Räkenskapsår', dataType: 'date' },

    // Resultat
    { code: 7104, label: 'Överskott av näringsverksamhet', section: 'Resultat', dataType: 'amount', sign: '*' },
    { code: 7114, label: 'Underskott av näringsverksamhet', section: 'Resultat', dataType: 'amount', sign: '*' },

    // Underlag för särskild löneskatt
    { code: 7131, label: 'Kreditinstituts underlag för riskskatt', section: 'Skattebaser', dataType: 'amount', sign: '*' },
    { code: 7132, label: 'Underlag för särskild löneskatt på pensionskostnader', section: 'Skattebaser', dataType: 'amount', sign: '*' },
    { code: 7133, label: 'Negativt underlag för särskild löneskatt på pensionskostnader', section: 'Skattebaser', dataType: 'amount', sign: '*' },

    // Avkastningsskatt
    { code: 7153, label: 'Försäkringsföretag m.fl. samt avsatt till pensioner 15%', section: 'Avkastningsskatt', dataType: 'amount', sign: '*' },
    { code: 7154, label: 'Utländska pensionsförsäkringar 15%', section: 'Avkastningsskatt', dataType: 'amount', sign: '*' },
    { code: 7155, label: 'Försäkringsföretag m.fl 30%', section: 'Avkastningsskatt', dataType: 'amount', sign: '*' },
    { code: 7156, label: 'Utländska kapitalförsäkringar 30%', section: 'Avkastningsskatt', dataType: 'amount', sign: '*' },

    // Fastighetsavgift/fastighetsskatt
    { code: 80, label: 'Småhus/ägarlägenhet', section: 'Fastighet', dataType: 'amount', sign: '*' },
    { code: 84, label: 'Småhus/ägarlägenhet: tomtmark, byggnad under uppförande', section: 'Fastighet', dataType: 'amount', sign: '*' },
    { code: 86, label: 'Hyreshus: tomtmark, bostäder under uppförande', section: 'Fastighet', dataType: 'amount', sign: '*' },
    { code: 93, label: 'Hyreshus: bostäder', section: 'Fastighet', dataType: 'amount', sign: '*' },
    { code: 95, label: 'Hyreshus: lokaler', section: 'Fastighet', dataType: 'amount', sign: '*' },
    { code: 96, label: 'Industrienhet och elproduktionsenhet: värmekraftverk', section: 'Fastighet', dataType: 'amount', sign: '*' },
    { code: 97, label: 'Elproduktionsenhet, vattenkraftverk', section: 'Fastighet', dataType: 'amount', sign: '*' },
    { code: 98, label: 'Elproduktionsenhet, vindkraftverk', section: 'Fastighet', dataType: 'amount', sign: '*' },

    // Övrigt
    { code: 90, label: 'Övriga upplysningar på bilaga', section: 'Övrigt', dataType: 'text' },
    { code: 1582, label: 'Förnybar el (kilowattimmar)', section: 'Övrigt', dataType: 'integer', sign: '*' },
]

// =============================================================================
// INK2R Räkenskapsschema - Balance Sheet (Balansräkning)
// =============================================================================

export const INK2R_BALANCE_SHEET_FIELDS: FieldDefinition[] = [
    // Immateriella anläggningstillgångar
    { code: 7201, label: 'Koncessioner, patent, licenser, varumärken, hyresrätter, goodwill', section: 'Immateriella anläggningstillgångar', dataType: 'amount', sign: '*', basAccounts: [1000, 1010, 1020, 1030, 1040, 1050, 1060, 1070, 1080] },
    { code: 7202, label: 'Förskott avseende immateriella anläggningstillgångar', section: 'Immateriella anläggningstillgångar', dataType: 'amount', sign: '*', basAccounts: [1090] },

    // Materiella anläggningstillgångar
    { code: 7214, label: 'Byggnader och mark', section: 'Materiella anläggningstillgångar', dataType: 'amount', sign: '*', basAccounts: [1100, 1110, 1120, 1130, 1140, 1150, 1180] },
    { code: 7215, label: 'Maskiner, inventarier och övriga materiella anläggningstillgångar', section: 'Materiella anläggningstillgångar', dataType: 'amount', sign: '*', basAccounts: [1200, 1210, 1220, 1230, 1240, 1250, 1260] },
    { code: 7216, label: 'Förbättringsutgifter på annans fastighet', section: 'Materiella anläggningstillgångar', dataType: 'amount', sign: '*', basAccounts: [1160] },
    { code: 7217, label: 'Pågående nyanläggningar och förskott', section: 'Materiella anläggningstillgångar', dataType: 'amount', sign: '*', basAccounts: [1280, 1290] },

    // Finansiella anläggningstillgångar
    { code: 7230, label: 'Andelar i koncernföretag', section: 'Finansiella anläggningstillgångar', dataType: 'amount', sign: '*', basAccounts: [1310, 1311, 1312] },
    { code: 7231, label: 'Andelar i intresseföretag och gemensamt styrda företag', section: 'Finansiella anläggningstillgångar', dataType: 'amount', sign: '*', basAccounts: [1320, 1330] },
    { code: 7232, label: 'Fordringar hos koncern-, intresse- och gemensamt styrda företag', section: 'Finansiella anläggningstillgångar', dataType: 'amount', sign: '*', basAccounts: [1350, 1360] },
    { code: 7233, label: 'Ägarintressen i övriga företag', section: 'Finansiella anläggningstillgångar', dataType: 'amount', sign: '*', basAccounts: [1340] },
    { code: 7234, label: 'Lån till delägare eller närstående', section: 'Finansiella anläggningstillgångar', dataType: 'amount', sign: '*', basAccounts: [1380] },
    { code: 7235, label: 'Andra långfristiga fordringar', section: 'Finansiella anläggningstillgångar', dataType: 'amount', sign: '*', basAccounts: [1370, 1390] },

    // Varulager
    { code: 7241, label: 'Råvaror och förnödenheter', section: 'Varulager', dataType: 'amount', sign: '*', basAccounts: [1410] },
    { code: 7242, label: 'Varor under tillverkning', section: 'Varulager', dataType: 'amount', sign: '*', basAccounts: [1440] },
    { code: 7243, label: 'Färdiga varor och handelsvaror', section: 'Varulager', dataType: 'amount', sign: '*', basAccounts: [1450, 1460] },
    { code: 7244, label: 'Övriga lagertillgångar', section: 'Varulager', dataType: 'amount', sign: '*', basAccounts: [1470, 1490] },
    { code: 7245, label: 'Pågående arbeten för annans räkning', section: 'Varulager', dataType: 'amount', sign: '*', basAccounts: [1480] },
    { code: 7246, label: 'Förskott till leverantörer', section: 'Varulager', dataType: 'amount', sign: '*', basAccounts: [1510] },

    // Kortfristiga fordringar
    { code: 7251, label: 'Kundfordringar', section: 'Kortfristiga fordringar', dataType: 'amount', sign: '*', basAccounts: [1510, 1511, 1512, 1513, 1519] },
    { code: 7252, label: 'Fordringar hos koncern-, intresse- och gemensamt styrda företag', section: 'Kortfristiga fordringar', dataType: 'amount', sign: '*', basAccounts: [1550, 1560, 1570] },
    { code: 7261, label: 'Övriga fordringar', section: 'Kortfristiga fordringar', dataType: 'amount', sign: '*', basAccounts: [1600, 1610, 1620, 1630, 1640, 1650, 1680, 1690] },
    { code: 7262, label: 'Upparbetad men ej fakturerad intäkt', section: 'Kortfristiga fordringar', dataType: 'amount', sign: '*', basAccounts: [1620] },
    { code: 7263, label: 'Förutbetalda kostnader och upplupna intäkter', section: 'Kortfristiga fordringar', dataType: 'amount', sign: '*', basAccounts: [1700, 1710, 1720, 1730, 1740, 1750, 1790] },

    // Kortfristiga placeringar
    { code: 7270, label: 'Andelar i koncernföretag (kortfristig)', section: 'Kortfristiga placeringar', dataType: 'amount', sign: '*', basAccounts: [1810] },
    { code: 7271, label: 'Övriga kortfristiga placeringar', section: 'Kortfristiga placeringar', dataType: 'amount', sign: '*', basAccounts: [1820, 1830, 1880, 1890] },

    // Kassa och bank
    { code: 7281, label: 'Kassa, bank och redovisningsmedel', section: 'Kassa och bank', dataType: 'amount', sign: '*', basAccounts: [1910, 1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990] },

    // Eget kapital
    { code: 7301, label: 'Bundet eget kapital', section: 'Eget kapital', dataType: 'amount', sign: '*', basAccounts: [2081, 2082, 2083, 2084, 2085, 2086, 2087] },
    { code: 7302, label: 'Fritt eget kapital', section: 'Eget kapital', dataType: 'amount', sign: '*', basAccounts: [2090, 2091, 2092, 2093, 2094, 2095, 2096, 2097, 2098, 2099] },

    // Obeskattade reserver
    { code: 7321, label: 'Periodiseringsfonder', section: 'Obeskattade reserver', dataType: 'amount', sign: '*', basAccounts: [2110, 2111, 2112, 2113, 2114, 2115, 2116, 2117, 2118, 2119] },
    { code: 7322, label: 'Ackumulerade överavskrivningar', section: 'Obeskattade reserver', dataType: 'amount', sign: '*', basAccounts: [2150, 2151, 2152, 2153] },
    { code: 7323, label: 'Övriga obeskattade reserver', section: 'Obeskattade reserver', dataType: 'amount', sign: '*', basAccounts: [2190, 2191, 2192, 2193, 2194] },

    // Avsättningar
    { code: 7331, label: 'Avsättningar för pensioner enligt lag (1967:531)', section: 'Avsättningar', dataType: 'amount', sign: '*', basAccounts: [2210, 2211] },
    { code: 7332, label: 'Övriga avsättningar för pensioner', section: 'Avsättningar', dataType: 'amount', sign: '*', basAccounts: [2220, 2230] },
    { code: 7333, label: 'Övriga avsättningar', section: 'Avsättningar', dataType: 'amount', sign: '*', basAccounts: [2250, 2252, 2253, 2290] },

    // Långfristiga skulder
    { code: 7350, label: 'Obligationslån', section: 'Långfristiga skulder', dataType: 'amount', sign: '*', basAccounts: [2310] },
    { code: 7351, label: 'Checkräkningskredit (långfristig)', section: 'Långfristiga skulder', dataType: 'amount', sign: '*', basAccounts: [2330] },
    { code: 7352, label: 'Övriga skulder till kreditinstitut (långfristiga)', section: 'Långfristiga skulder', dataType: 'amount', sign: '*', basAccounts: [2350, 2355] },
    { code: 7353, label: 'Skulder till koncern-, intresse- och gemensamt styrda företag', section: 'Långfristiga skulder', dataType: 'amount', sign: '*', basAccounts: [2360, 2370] },
    { code: 7354, label: 'Övriga långfristiga skulder', section: 'Långfristiga skulder', dataType: 'amount', sign: '*', basAccounts: [2390, 2391, 2392, 2393] },

    // Kortfristiga skulder
    { code: 7360, label: 'Checkräkningskredit (kortfristig)', section: 'Kortfristiga skulder', dataType: 'amount', sign: '*', basAccounts: [2410] },
    { code: 7361, label: 'Övriga skulder till kreditinstitut (kortfristiga)', section: 'Kortfristiga skulder', dataType: 'amount', sign: '*', basAccounts: [2420, 2430] },
    { code: 7362, label: 'Förskott från kunder', section: 'Kortfristiga skulder', dataType: 'amount', sign: '*', basAccounts: [2450] },
    { code: 7363, label: 'Pågående arbeten för annans räkning (skuld)', section: 'Kortfristiga skulder', dataType: 'amount', sign: '*', basAccounts: [2460] },
    { code: 7364, label: 'Fakturerad men ej upparbetad intäkt', section: 'Kortfristiga skulder', dataType: 'amount', sign: '*', basAccounts: [2470] },
    { code: 7365, label: 'Leverantörsskulder', section: 'Kortfristiga skulder', dataType: 'amount', sign: '*', basAccounts: [2440, 2441, 2442, 2443] },
    { code: 7366, label: 'Växelskulder', section: 'Kortfristiga skulder', dataType: 'amount', sign: '*', basAccounts: [2490] },
    { code: 7367, label: 'Skulder till koncern-, intresse- och gemensamt styrda företag (kortfristiga)', section: 'Kortfristiga skulder', dataType: 'amount', sign: '*', basAccounts: [2860, 2870] },
    { code: 7368, label: 'Skatteskulder', section: 'Kortfristiga skulder', dataType: 'amount', sign: '*', basAccounts: [2510, 2512, 2513, 2514, 2515, 2516, 2517, 2518] },
    { code: 7369, label: 'Övriga kortfristiga skulder', section: 'Kortfristiga skulder', dataType: 'amount', sign: '*', basAccounts: [2890, 2891, 2892, 2893, 2899] },
    { code: 7370, label: 'Upplupna kostnader och förutbetalda intäkter', section: 'Kortfristiga skulder', dataType: 'amount', sign: '*', basAccounts: [2900, 2910, 2920, 2930, 2940, 2950, 2960, 2970, 2980, 2990] },
]

// =============================================================================
// INK2R Räkenskapsschema - Income Statement (Resultaträkning)
// =============================================================================

export const INK2R_INCOME_STATEMENT_FIELDS: FieldDefinition[] = [
    // Rörelseintäkter
    { code: 7410, label: 'Nettoomsättning', section: 'Rörelseintäkter', dataType: 'amount', sign: '+', basAccounts: [3000, 3010, 3020, 3030, 3040, 3050, 3060, 3070, 3080, 3090, 3100, 3200, 3300, 3400, 3500, 3600, 3700] },
    { code: 7411, label: 'Förändring av lager (+)', section: 'Rörelseintäkter', dataType: 'amount', sign: '+', basAccounts: [4900] },
    { code: 7510, label: 'Förändring av lager (-)', section: 'Rörelseintäkter', dataType: 'amount', sign: '-', basAccounts: [4900] },
    { code: 7412, label: 'Aktiverat arbete för egen räkning', section: 'Rörelseintäkter', dataType: 'amount', sign: '+', basAccounts: [3800, 3810, 3820] },
    { code: 7413, label: 'Övriga rörelseintäkter', section: 'Rörelseintäkter', dataType: 'amount', sign: '+', basAccounts: [3900, 3910, 3920, 3930, 3940, 3950, 3960, 3970, 3980, 3990] },

    // Rörelsekostnader
    { code: 7511, label: 'Råvaror och förnödenheter', section: 'Rörelsekostnader', dataType: 'amount', sign: '-', basAccounts: [4000, 4010, 4020, 4030, 4040, 4050, 4060, 4070, 4080, 4090] },
    { code: 7512, label: 'Handelsvaror', section: 'Rörelsekostnader', dataType: 'amount', sign: '-', basAccounts: [4100, 4200, 4300, 4400, 4500, 4600, 4700, 4800] },
    { code: 7513, label: 'Övriga externa kostnader', section: 'Rörelsekostnader', dataType: 'amount', sign: '-', basAccounts: [5000, 5010, 5020, 5030, 5040, 5050, 5060, 5070, 5080, 5090, 5100, 5200, 5300, 5400, 5500, 5600, 5700, 5800, 5900, 6000, 6100, 6200, 6300, 6400, 6500, 6600, 6700, 6800, 6900] },
    { code: 7514, label: 'Personalkostnader', section: 'Rörelsekostnader', dataType: 'amount', sign: '-', basAccounts: [7000, 7010, 7020, 7030, 7040, 7050, 7060, 7070, 7080, 7090, 7200, 7300, 7400, 7500, 7600] },
    { code: 7515, label: 'Av- och nedskrivningar av materiella och immateriella anläggningstillgångar', section: 'Rörelsekostnader', dataType: 'amount', sign: '-', basAccounts: [7800, 7810, 7820, 7830, 7840] },
    { code: 7516, label: 'Nedskrivningar av omsättningstillgångar', section: 'Rörelsekostnader', dataType: 'amount', sign: '-', basAccounts: [7720, 7730] },
    { code: 7517, label: 'Övriga rörelsekostnader', section: 'Rörelsekostnader', dataType: 'amount', sign: '-', basAccounts: [7900, 7910, 7920, 7930, 7940, 7950, 7960, 7970, 7980, 7990] },

    // Finansiella poster
    { code: 7414, label: 'Resultat från andelar i koncernföretag (+)', section: 'Finansiella poster', dataType: 'amount', sign: '+', basAccounts: [8010, 8020] },
    { code: 7518, label: 'Resultat från andelar i koncernföretag (-)', section: 'Finansiella poster', dataType: 'amount', sign: '-', basAccounts: [8010, 8020] },
    { code: 7415, label: 'Resultat från andelar i intresseföretag (+)', section: 'Finansiella poster', dataType: 'amount', sign: '+', basAccounts: [8030] },
    { code: 7519, label: 'Resultat från andelar i intresseföretag (-)', section: 'Finansiella poster', dataType: 'amount', sign: '-', basAccounts: [8030] },
    { code: 7423, label: 'Resultat från övriga företag (+)', section: 'Finansiella poster', dataType: 'amount', sign: '+', basAccounts: [8040] },
    { code: 7530, label: 'Resultat från övriga företag (-)', section: 'Finansiella poster', dataType: 'amount', sign: '-', basAccounts: [8040] },
    { code: 7416, label: 'Resultat från övriga finansiella anläggningstillgångar (+)', section: 'Finansiella poster', dataType: 'amount', sign: '+', basAccounts: [8200, 8210, 8220] },
    { code: 7520, label: 'Resultat från övriga finansiella anläggningstillgångar (-)', section: 'Finansiella poster', dataType: 'amount', sign: '-', basAccounts: [8200, 8210, 8220] },
    { code: 7417, label: 'Övriga ränteintäkter och liknande resultatposter', section: 'Finansiella poster', dataType: 'amount', sign: '+', basAccounts: [8300, 8310, 8320, 8330, 8340, 8350, 8360, 8370, 8380, 8390] },
    { code: 7521, label: 'Nedskrivning av finansiella anläggningstillgångar', section: 'Finansiella poster', dataType: 'amount', sign: '-', basAccounts: [8270, 8280] },
    { code: 7522, label: 'Räntekostnader och liknande resultatposter', section: 'Finansiella poster', dataType: 'amount', sign: '-', basAccounts: [8400, 8410, 8420, 8430, 8440, 8450, 8460, 8470, 8480, 8490] },

    // Koncernbidrag
    { code: 7524, label: 'Lämnade koncernbidrag', section: 'Bokslutsdispositioner', dataType: 'amount', sign: '-', basAccounts: [8820] },
    { code: 7419, label: 'Mottagna koncernbidrag', section: 'Bokslutsdispositioner', dataType: 'amount', sign: '+', basAccounts: [8810] },

    // Periodiseringsfonder
    { code: 7420, label: 'Återföring av periodiseringsfond', section: 'Bokslutsdispositioner', dataType: 'amount', sign: '+', basAccounts: [8810, 8811, 8812, 8813, 8814, 8815, 8816, 8817, 8818, 8819] },
    { code: 7525, label: 'Avsättning till periodiseringsfond', section: 'Bokslutsdispositioner', dataType: 'amount', sign: '-', basAccounts: [8810, 8811, 8812, 8813, 8814, 8815, 8816, 8817, 8818, 8819] },

    // Överavskrivningar
    { code: 7421, label: 'Förändring av överavskrivningar (+)', section: 'Bokslutsdispositioner', dataType: 'amount', sign: '+', basAccounts: [8850, 8851, 8852, 8853, 8854] },
    { code: 7526, label: 'Förändring av överavskrivningar (-)', section: 'Bokslutsdispositioner', dataType: 'amount', sign: '-', basAccounts: [8850, 8851, 8852, 8853, 8854] },

    // Övriga bokslutsdispositioner
    { code: 7422, label: 'Övriga bokslutsdispositioner (+)', section: 'Bokslutsdispositioner', dataType: 'amount', sign: '+', basAccounts: [8890, 8891, 8892, 8893, 8894, 8895, 8896, 8897, 8898, 8899] },
    { code: 7527, label: 'Övriga bokslutsdispositioner (-)', section: 'Bokslutsdispositioner', dataType: 'amount', sign: '-', basAccounts: [8890, 8891, 8892, 8893, 8894, 8895, 8896, 8897, 8898, 8899] },

    // Skatt och resultat
    { code: 7528, label: 'Skatt på årets resultat', section: 'Skatt och resultat', dataType: 'amount', sign: '-', basAccounts: [8910, 8920, 8930, 8940, 8950, 8960, 8970, 8980, 8990] },
    { code: 7450, label: 'Årets resultat, vinst', section: 'Skatt och resultat', dataType: 'amount', sign: '+', basAccounts: [8999] },
    { code: 7550, label: 'Årets resultat, förlust', section: 'Skatt och resultat', dataType: 'amount', sign: '-', basAccounts: [8999] },
]

// =============================================================================
// INK2S Skattemässiga justeringar
// =============================================================================

export const INK2S_FIELDS: FieldDefinition[] = [
    // Årets resultat
    { code: 7650, label: 'Årets resultat, vinst', section: 'Skattemässigt resultat', dataType: 'amount', sign: '+' },
    { code: 7750, label: 'Årets resultat, förlust', section: 'Skattemässigt resultat', dataType: 'amount', sign: '-' },

    // Bokförda kostnader som inte ska dras av
    { code: 7651, label: 'Skatt på årets resultat (ej avdragsgill)', section: 'Ej avdragsgilla kostnader', dataType: 'amount', sign: '+' },
    { code: 7652, label: 'Nedskrivning av finansiella tillgångar (ej avdragsgill)', section: 'Ej avdragsgilla kostnader', dataType: 'amount', sign: '+' },
    { code: 7653, label: 'Andra bokförda kostnader (ej avdragsgilla)', section: 'Ej avdragsgilla kostnader', dataType: 'amount', sign: '+' },

    // Kostnader som ska dras av men inte bokförda
    { code: 7751, label: 'Lämnade koncernbidrag (ej bokförda)', section: 'Ej bokförda kostnader', dataType: 'amount', sign: '-' },
    { code: 7764, label: 'Andra ej bokförda kostnader', section: 'Ej bokförda kostnader', dataType: 'amount', sign: '-' },

    // Bokförda intäkter som inte ska tas upp
    { code: 7752, label: 'Ackordsvinster', section: 'Ej skattepliktiga intäkter', dataType: 'amount', sign: '-' },
    { code: 7753, label: 'Utdelning (ej skattepliktig)', section: 'Ej skattepliktiga intäkter', dataType: 'amount', sign: '-' },
    { code: 7754, label: 'Andra bokförda intäkter (ej skattepliktiga)', section: 'Ej skattepliktiga intäkter', dataType: 'amount', sign: '-' },

    // Intäkter som ska tas upp men inte bokförda
    { code: 7654, label: 'Schablonintäkt på periodiseringsfonder', section: 'Ej bokförda intäkter', dataType: 'amount', sign: '+' },
    { code: 7668, label: 'Schablonintäkt på fondandelar', section: 'Ej bokförda intäkter', dataType: 'amount', sign: '+' },
    { code: 7655, label: 'Mottagna koncernbidrag (ej bokförda)', section: 'Ej bokförda intäkter', dataType: 'amount', sign: '+' },
    { code: 7673, label: 'Uppräknat belopp vid återföring av periodiseringsfond', section: 'Ej bokförda intäkter', dataType: 'amount', sign: '+' },
    { code: 7665, label: 'Andra ej bokförda intäkter', section: 'Ej bokförda intäkter', dataType: 'amount', sign: '+' },

    // Avyttring av delägarrätter
    { code: 7755, label: 'Bokförd vinst vid avyttring av delägarrätter', section: 'Delägarrätter', dataType: 'amount', sign: '-' },
    { code: 7656, label: 'Bokförd förlust vid avyttring av delägarrätter', section: 'Delägarrätter', dataType: 'amount', sign: '+' },
    { code: 7756, label: 'Uppskov med kapitalvinst', section: 'Delägarrätter', dataType: 'amount', sign: '-' },
    { code: 7657, label: 'Återfört uppskov med kapitalvinst', section: 'Delägarrätter', dataType: 'amount', sign: '+' },
    { code: 7658, label: 'Kapitalvinst för beskattningsåret', section: 'Delägarrätter', dataType: 'amount', sign: '+' },
    { code: 7757, label: 'Kapitalförlust som ska dras av', section: 'Delägarrätter', dataType: 'amount', sign: '-' },

    // Andel i handelsbolag
    { code: 7758, label: 'Andel i HB: Bokförd intäkt/vinst', section: 'Handelsbolag', dataType: 'amount', sign: '-' },
    { code: 7659, label: 'Andel i HB: Skattemässigt överskott', section: 'Handelsbolag', dataType: 'amount', sign: '+' },
    { code: 7660, label: 'Andel i HB: Bokförd kostnad/förlust', section: 'Handelsbolag', dataType: 'amount', sign: '+' },
    { code: 7759, label: 'Andel i HB: Skattemässigt underskott', section: 'Handelsbolag', dataType: 'amount', sign: '-' },

    // Skattemässiga justeringar avskrivningar
    { code: 7666, label: 'Skattemässig justering av avskrivningar (+)', section: 'Avskrivningar', dataType: 'amount', sign: '+' },
    { code: 7765, label: 'Skattemässig justering av avskrivningar (-)', section: 'Avskrivningar', dataType: 'amount', sign: '-' },

    // Avyttring av fastighet
    { code: 7661, label: 'Skattemässig justering vid avyttring av fastighet (+)', section: 'Fastighetsavyttring', dataType: 'amount', sign: '+' },
    { code: 7760, label: 'Skattemässig justering vid avyttring av fastighet (-)', section: 'Fastighetsavyttring', dataType: 'amount', sign: '-' },

    // Skogs- och substansminskningsavdrag
    { code: 7761, label: 'Skogs-/substansminskningsavdrag', section: 'Specialavdrag', dataType: 'amount', sign: '-' },
    { code: 7662, label: 'Återföringar vid avyttring av fastighet', section: 'Specialavdrag', dataType: 'amount', sign: '+' },

    // Andra skattemässiga justeringar
    { code: 7663, label: 'Andra skattemässiga justeringar (+)', section: 'Övriga justeringar', dataType: 'amount', sign: '+' },
    { code: 7762, label: 'Andra skattemässiga justeringar (-)', section: 'Övriga justeringar', dataType: 'amount', sign: '-' },

    // Underskott
    { code: 7763, label: 'Outnyttjat underskott från föregående år', section: 'Underskott', dataType: 'amount', sign: '-' },
    { code: 7671, label: 'Reduktion av underskott (beloppsspärr, ackord, konkurs)', section: 'Underskott', dataType: 'amount', sign: '+' },
    { code: 7672, label: 'Reduktion av underskott (koncernbidragsspärr, fusionsspärr)', section: 'Underskott', dataType: 'amount', sign: '+' },

    // Slutligt resultat
    { code: 7670, label: 'Överskott (till p. 1.1)', section: 'Slutligt resultat', dataType: 'amount', sign: '+' },
    { code: 7770, label: 'Underskott (till p. 1.2)', section: 'Slutligt resultat', dataType: 'amount', sign: '-' },

    // Tilläggsuppgifter
    { code: 8020, label: 'Värdeminskningsavdrag byggnader', section: 'Tilläggsuppgifter', dataType: 'amount', sign: '*' },
    { code: 8021, label: 'Värdeminskningsavdrag markanläggningar', section: 'Tilläggsuppgifter', dataType: 'amount', sign: '*' },
    { code: 8022, label: 'Pensionskostnader', section: 'Tilläggsuppgifter', dataType: 'amount', sign: '*' },
    { code: 8023, label: 'Vid restvärdesavskrivning: återförda belopp', section: 'Tilläggsuppgifter', dataType: 'amount', sign: '*' },
    { code: 8026, label: 'Lån från aktieägare (fysisk person)', section: 'Tilläggsuppgifter', dataType: 'amount', sign: '*' },
    { code: 8028, label: 'Koncernbidragsspärrat/fusionsspärrat underskott', section: 'Tilläggsuppgifter', dataType: 'amount', sign: '*' },

    // Revision/biträde
    { code: 8040, label: 'Uppdragstagare har biträtt: Ja', section: 'Revision', dataType: 'text' },
    { code: 8041, label: 'Uppdragstagare har biträtt: Nej', section: 'Revision', dataType: 'text' },
    { code: 8044, label: 'Årsredovisningen reviderad: Ja', section: 'Revision', dataType: 'text' },
    { code: 8045, label: 'Årsredovisningen reviderad: Nej', section: 'Revision', dataType: 'text' },
]

// =============================================================================
// Combined Field Lookup
// =============================================================================

export const ALL_INK2_FIELDS = [
    ...INK2_MAIN_FIELDS,
    ...INK2R_BALANCE_SHEET_FIELDS,
    ...INK2R_INCOME_STATEMENT_FIELDS,
    ...INK2S_FIELDS,
]

export function getFieldDefinition(code: number | string): FieldDefinition | undefined {
    return ALL_INK2_FIELDS.find(f => f.code === code || f.code === Number(code))
}

export function getFieldLabel(code: number | string): string {
    const field = getFieldDefinition(code)
    return field?.label || `Fält ${code}`
}

export function getFieldsBySection(section: string): FieldDefinition[] {
    return ALL_INK2_FIELDS.filter(f => f.section === section)
}

export function getAllSections(): string[] {
    return [...new Set(ALL_INK2_FIELDS.map(f => f.section))]
}
