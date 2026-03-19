// Svalbard protected areas and zones based on Svalbardmiljøvernloven

export interface ProtectedZone {
  name: string;
  type: 'naturreservat' | 'nasjonalpark' | 'fuglereservat' | 'plantevernområde' | 'generell';
  coordinates: [number, number][][]; // Polygon coordinates
  regulation: string;
  description: string;
  restrictions: string[];
  color: string;
}

export const svalbardZones: ProtectedZone[] = [
  {
    name: 'Nordaust-Svalbard Naturreservat',
    type: 'naturreservat',
    coordinates: [
      [
        [80.5, 22.0],
        [80.5, 28.0],
        [79.5, 28.0],
        [79.5, 22.0],
        [80.5, 22.0]
      ]
    ],
    regulation: 'Svalbardmiljøvernloven § 30 - Naturreservat',
    description: 'Norges største naturreservat. Strengt beskyttet område med totalt ferdselsforbud uten spesialtillatelse.',
    restrictions: [
      'Ferdselsforbud uten tillatelse fra Sysselmannen',
      'Forbud mot landing og ankring',
      'Ingen forstyrrelser av dyreliv',
      'Absolutt forbud mot avfall og utslipp'
    ],
    color: '#ef4444'
  },
  {
    name: 'Sør-Spitsbergen Nasjonalpark',
    type: 'nasjonalpark',
    coordinates: [
      [
        [77.0, 15.0],
        [77.0, 17.5],
        [76.5, 17.5],
        [76.5, 15.0],
        [77.0, 15.0]
      ]
    ],
    regulation: 'Svalbardmiljøvernloven § 29 - Nasjonalpark',
    description: 'Nasjonalpark med verdifullt naturmangfold. Ferdsel tillatt, men med strenge regler.',
    restrictions: [
      'Ferdsel tillatt på egne vilkår',
      'Ikke forstyrr dyreliv',
      'Hold god avstand til fuglefjell',
      'Ta med all avfall'
    ],
    color: '#f59e0b'
  },
  {
    name: 'Nordvest-Spitsbergen Nasjonalpark',
    type: 'nasjonalpark',
    coordinates: [
      [
        [79.5, 10.0],
        [79.5, 13.5],
        [78.8, 13.5],
        [78.8, 10.0],
        [79.5, 10.0]
      ]
    ],
    regulation: 'Svalbardmiljøvernloven § 29 - Nasjonalpark',
    description: 'Omfattende nasjonalpark på Nordvest-Spitsbergen med unikt arktisk landskap.',
    restrictions: [
      'Ferdsel tillatt med forsiktighet',
      'Respekter dyrelivet',
      'Følg Sysselmannens retningslinjer',
      'Ingen motorferdsel på land'
    ],
    color: '#f59e0b'
  },
  {
    name: 'Kongsfjorden Fuglereservat',
    type: 'fuglereservat',
    coordinates: [
      [
        [79.0, 11.5],
        [79.0, 12.5],
        [78.85, 12.5],
        [78.85, 11.5],
        [79.0, 11.5]
      ]
    ],
    regulation: 'Svalbardmiljøvernloven § 31 - Fuglereservat',
    description: 'Beskyttet fuglereservat i hekkeperioden 15. mai - 15. august.',
    restrictions: [
      'Ferdselsforbud i hekkeperioden (15. mai - 15. aug)',
      'Hold god avstand til fuglefjell',
      'Ingen droner',
      'Ingen høye lyder'
    ],
    color: '#3b82f6'
  },
  {
    name: 'Longyearbyen Område',
    type: 'generell',
    coordinates: [
      [
        [78.3, 15.3],
        [78.3, 15.9],
        [78.15, 15.9],
        [78.15, 15.3],
        [78.3, 15.3]
      ]
    ],
    regulation: 'Svalbardmiljøvernloven - Generelle bestemmelser',
    description: 'Område rundt Longyearbyen. Generelle miljøregler gjelder.',
    restrictions: [
      'Følg lokale trafikkforskrifter',
      'Respekter privat eiendom',
      'Ta hensyn til dyreliv',
      'Generelle miljøkrav gjelder'
    ],
    color: '#10b981'
  },
  {
    name: 'Isfjorden Plantevernområde',
    type: 'plantevernområde',
    coordinates: [
      [
        [78.5, 14.0],
        [78.5, 16.0],
        [78.2, 16.0],
        [78.2, 14.0],
        [78.5, 14.0]
      ]
    ],
    regulation: 'Svalbardmiljøvernloven § 32 - Plantevernområde',
    description: 'Beskyttet plantevernområde. Plukking og ødeleggelse av vegetasjon forbudt.',
    restrictions: [
      'Forbud mot plukking av planter',
      'Gå kun på etablerte stier',
      'Ingen camping utenfor angitte områder',
      'Respekter den sårbare vegetasjonen'
    ],
    color: '#8b5cf6'
  },
  {
    name: 'Prins Karls Forland Nasjonalpark',
    type: 'nasjonalpark',
    coordinates: [
      [
        [78.7, 10.5],
        [78.7, 11.5],
        [78.3, 11.5],
        [78.3, 10.5],
        [78.7, 10.5]
      ]
    ],
    regulation: 'Svalbardmiljøvernloven § 29 - Nasjonalpark',
    description: 'Øy-nasjonalpark med viktige hvalrossbestander. Strenge ferdselsbegrensninger.',
    restrictions: [
      'Landing kun på angitte steder',
      'Hold god avstand til hvalross (minst 30m)',
      'Ferdselsforbud i hvalrossområder',
      'Ingen støy eller forstyrrelser'
    ],
    color: '#f59e0b'
  }
];

export function getZoneColor(type: ProtectedZone['type']): string {
  const colors = {
    naturreservat: '#ef4444',    // Red - Strictest
    nasjonalpark: '#f59e0b',     // Amber
    fuglereservat: '#3b82f6',    // Blue
    plantevernområde: '#8b5cf6', // Purple
    generell: '#10b981'          // Green
  };
  return colors[type];
}

export function getZoneOpacity(type: ProtectedZone['type']): number {
  const opacities = {
    naturreservat: 0.4,
    nasjonalpark: 0.3,
    fuglereservat: 0.3,
    plantevernområde: 0.3,
    generell: 0.2
  };
  return opacities[type];
}
