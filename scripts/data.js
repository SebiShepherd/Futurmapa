const ORG_OPTIONS = ["Group", "CVS", "RVS", "CVS vs RVS"];

// SVG icon paths (open-source icon designs)
const SVG_ICONS = {
  Finance: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.72-2.77-.01-2.2-1.9-2.96-3.65-3.42z",
  HR: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
  Sales: "M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z",
  Operations: "M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"
};

const DATA_CONFIG = {
  categories: {
    Finance: {
      label: "Finance",
      icon: "Finance",
      color: "#f6bd60",
      description: "Ertragslage, Profitabilität und Investitionen."
    },
    HR: {
      label: "Human Resources",
      icon: "HR",
      color: "#84a59d",
      description: "Mitarbeiterzahlen, Bindung und Lernprogramme."
    },
    Sales: {
      label: "Sales",
      icon: "Sales",
      color: "#f28482",
      description: "Pipeline, Auftragseingang und regionale Performance."
    },
    Operations: {
      label: "Operations",
      icon: "Operations",
      color: "#9d5df0",
      description: "Lieferfähigkeit, Servicequalität und Digitalisierung."
    }
  },
  continents: {
    "Nordamerika": {
      countries: ["CAN", "USA", "MEX"],
      description:
        "In Nordamerika befinden sich die zentralen Hubs für Strategie und Innovation. Der Markt zeichnet sich durch hohe Dynamik und komplexe Lieferketten aus."
    },
    "Südamerika": {
      countries: ["BRA", "ARG", "CHL"],
      description:
        "Wachstumsmärkte mit Fokus auf Ausbau der Vertriebspräsenz und nachhaltigen Lieferketten."
    },
    "Europa": {
      countries: ["DEU", "FRA", "ESP", "GBR", "NLD"],
      description:
        "Der europäische Verbund bündelt Produktion, F&E sowie zentrale Shared Services."
    },
    "Afrika & Mittlerer Osten": {
      countries: ["ZAF", "EGY", "ARE"],
      description:
        "Region mit Fokus auf Partnerschaften, skalierbare Service-Modelle und Talentaufbau."
    },
    "Asien-Pazifik": {
      countries: ["CHN", "IND", "JPN", "AUS"],
      description:
        "APAC vereint starke Fertigungskapazitäten mit digital geprägten Vertriebsmodellen."
    }
  },
  countries: {
    USA: {
      name: "Vereinigte Staaten",
      continent: "Nordamerika",
      active: true,
      overview:
        "Zentraler Markt mit Headquarter-Funktionen in Finance, HR-Strategie und globalem Vertrieb.",
      points: [
        {
          id: "usa-finance",
          title: "Finance Hub",
          category: "Finance",
          coordinates: [-77.0369, 38.9072],
          description: "Kapitalmarkt- und Treasury-Steuerung aus Washington D.C.",
          data: {
            Group: {
              summary:
                "Die Gruppe konsolidiert in den USA 42 % des globalen Umsatzes. Der Fokus liegt auf margenstarken Servicepaketen und einer vorsichtigen Kostenbasis.",
              metrics: [
                { label: "Umsatz Q2", value: "$12,4 Mrd.", trend: "+6,8 %" },
                { label: "EBIT-Marge", value: "18,1 %", trend: "+0,7 PP" },
                { label: "Investitionen", value: "$420 Mio.", trend: "−8 %" }
              ],
              progress: [
                { label: "Integrationsprogramm Fusion", value: 72 },
                { label: "Digitalisierungsbudget genutzt", value: 64 }
              ]
            },
            CVS: {
              summary:
                "CVS adressiert den Enterprise-Sektor mit Fokus auf Managed Services und Cloud-Plattformen.",
              metrics: [
                { label: "ARR", value: "$7,1 Mrd.", trend: "+11 %" },
                { label: "Free Cashflow", value: "$610 Mio.", trend: "+4 %" }
              ],
              progress: [
                { label: "Abschluss SAP S/4 Migration", value: 88 },
                { label: "Green-Bond-Mittel gebunden", value: 54 }
              ]
            },
            RVS: {
              summary:
                "RVS skaliert Serviceleistungen im öffentlichen Sektor und Gesundheitswesen.",
              metrics: [
                { label: "Projekt-Pipeline", value: "$5,3 Mrd.", trend: "+9 %" },
                { label: "Deckungsbeitrag", value: "21 %", trend: "+1,4 PP" }
              ],
              progress: [
                { label: "Standorte mit Nearshore-Abdeckung", value: 61 }
              ]
            },
            compare: {
              leftLabel: "CVS",
              rightLabel: "RVS",
              summary: "Direkter Vergleich der beiden Sparten in den USA.",
              metrics: [
                { label: "Umsatz", left: "$7,1 Mrd.", right: "$5,3 Mrd." },
                { label: "EBIT", left: "$1,26 Mrd.", right: "$0,82 Mrd." },
                { label: "Auftragseingang YTD", left: "$9,4 Mrd.", right: "$6,8 Mrd." }
              ]
            }
          }
        },
        {
          id: "usa-hr",
          title: "People Excellence",
          category: "HR",
          coordinates: [-118.2437, 34.0522],
          description: "Talentprogramme und Learning Campus in Los Angeles.",
          data: {
            Group: {
              summary:
                "Der globale People Excellence Campus adressiert Upskilling in Datenkompetenzen und Leadership.",
              metrics: [
                { label: "FTE gesamt", value: "38.400", trend: "+4,1 %" },
                { label: "Retention Rate", value: "92 %", trend: "+2,5 PP" }
              ],
              progress: [
                { label: "Diversity & Inclusion Score", value: 78 },
                { label: "Absolventen Future Leaders Program", value: 64 }
              ]
            },
            CVS: null,
            RVS: {
              summary:
                "RVS erweitert das klinische Expertennetzwerk mit Fokus auf TeleHealth.",
              metrics: [
                { label: "Fachkräfte-Aufbau", value: "+1.240 Köpfe", trend: "+12 %" },
                { label: "Weiterbildungsstunden", value: "86.000", trend: "+18 %" }
              ]
            },
            compare: null
          }
        }
      ]
    },
    CAN: {
      name: "Kanada",
      continent: "Nordamerika",
      active: true,
      overview: "Nearshore-Zentrum für KI-Entwicklung und Nachhaltigkeitsprojekte.",
      points: [
        {
          id: "can-operations",
          title: "Sustainable Delivery",
          category: "Operations",
          coordinates: [-73.5673, 45.5017],
          description: "Montreal ist unser Hub für nachhaltige Liefermodelle.",
          data: {
            Group: {
              summary:
                "Das kanadische Delivery Center unterstützt globale Programme in den Bereichen Klimabilanz und KI-Automatisierung.",
              metrics: [
                { label: "CO₂-Einsparung", value: "−32 %", trend: "+5 PP" },
                { label: "Automatisierungsgrad", value: "58 %", trend: "+7 PP" }
              ],
              progress: [
                { label: "Scope-3 Abdeckung", value: 66 },
                { label: "Lieferanten mit ESG-Audit", value: 74 }
              ]
            },
            CVS: {
              summary: "Roll-out eines KI-basierten Service-Katalogs für Industriekunden.",
              metrics: [
                { label: "Durchlaufzeit Reduktion", value: "−18 %", trend: "+3 PP" }
              ]
            },
            RVS: null,
            compare: {
              leftLabel: "CVS",
              rightLabel: "RVS",
              summary: "Vergleich der Nachhaltigkeitsinitiativen.",
              metrics: [
                { label: "Lieferketten-Audits", left: "82 %", right: "54 %" },
                { label: "Automatisierte Workflows", left: "61 %", right: "37 %" }
              ]
            }
          }
        }
      ]
    },
    MEX: {
      name: "Mexiko",
      continent: "Nordamerika",
      active: false,
      overview: "Pilotmarkt – Aktivierung für 2025 geplant.",
      points: []
    },
    BRA: {
      name: "Brasilien",
      continent: "Südamerika",
      active: true,
      overview: "Shared Service Center und stark wachsender Vertriebsmarkt.",
      points: [
        {
          id: "bra-sales",
          title: "Regional Sales Hub",
          category: "Sales",
          coordinates: [-46.6333, -23.5505],
          description: "São Paulo bündelt Vertrieb und Customer Success für LATAM.",
          data: {
            Group: {
              summary:
                "Die Gruppe investiert in lokale Partnerschaften und digitale Marktplätze.",
              metrics: [
                { label: "Neukunden 2024", value: "+38 %", trend: "+8 PP" },
                { label: "Net Revenue Retention", value: "119 %", trend: "+5 PP" }
              ]
            },
            CVS: {
              summary: "CVS implementiert branchenspezifische SaaS-Bundles.",
              metrics: [
                { label: "Auftragseingang", value: "$1,8 Mrd.", trend: "+21 %" },
                { label: "Service-NPS", value: "63", trend: "+6" }
              ]
            },
            RVS: {
              summary: "RVS erweitert das Gesundheitsnetzwerk in Brasilien.",
              metrics: [
                { label: "Hospital-Cluster", value: "38", trend: "+5" },
                { label: "TeleHealth-Adoption", value: "72 %", trend: "+12 PP" }
              ]
            },
            compare: {
              leftLabel: "CVS",
              rightLabel: "RVS",
              summary: "Marktdurchdringung im Vergleich.",
              metrics: [
                { label: "Vertriebsstandorte", left: "12", right: "9" },
                { label: "Wachstumsrate", left: "+21 %", right: "+17 %" }
              ]
            }
          }
        }
      ]
    },
    ARG: {
      name: "Argentinien",
      continent: "Südamerika",
      active: false,
      overview: "Lokale Präsenz im Aufbau.",
      points: []
    },
    CHL: {
      name: "Chile",
      continent: "Südamerika",
      active: true,
      overview: "Spezialisiert auf Energie- und Bergbauprojekte.",
      points: [
        {
          id: "chl-operations",
          title: "Andes Delivery Node",
          category: "Operations",
          coordinates: [-70.6693, -33.4489],
          description: "Santiago unterstützt regionale Roll-outs.",
          comingSoon: true
        }
      ]
    },
    DEU: {
      name: "Deutschland",
      continent: "Europa",
      active: true,
      overview: "Headquarter der europäischen AG sowie F&E-Leitstand.",
      points: [
        {
          id: "deu-finance",
          title: "European Finance Control",
          category: "Finance",
          coordinates: [13.405, 52.52],
          description: "Berlin bündelt Controlling und Corporate Governance.",
          data: {
            Group: {
              summary:
                "Deutschland ist Sitz der Konzern-AG mit Fokus auf Profitabilität und Transformation.",
              metrics: [
                { label: "Corporate Services", value: "$3,1 Mrd.", trend: "+5 %" },
                { label: "Cash Conversion", value: "93 %", trend: "+2 PP" }
              ]
            },
            CVS: null,
            RVS: {
              summary: "RVS koordiniert EU-weite Public Services.",
              metrics: [
                { label: "Projektbestand", value: "$2,4 Mrd.", trend: "+6 %" }
              ]
            },
            compare: null
          }
        },
        {
          id: "deu-hr",
          title: "Future Talent Lab",
          category: "HR",
          coordinates: [11.582, 48.1351],
          description: "München beherbergt das Innovation & Talent Lab.",
          data: {
            Group: {
              summary:
                "Fokus auf Tech-Akademien und Dual-Studiengänge.",
              metrics: [
                { label: "Tech Trainees", value: "680", trend: "+18 %" },
                { label: "Interne Mobilität", value: "26 %", trend: "+4 PP" }
              ]
            },
            CVS: {
              summary: "CVS bündelt Data-Science-Kompetenzen.",
              metrics: [
                { label: "Data Scientists", value: "1.250", trend: "+14 %" },
                { label: "Patente", value: "42", trend: "+9" }
              ]
            },
            RVS: null,
            compare: {
              leftLabel: "CVS",
              rightLabel: "RVS",
              summary: "Vergleich Talentprogramme",
              metrics: [
                { label: "Teilnehmer Leadership", left: "420", right: "190" },
                { label: "Zertifizierte Experten", left: "860", right: "540" }
              ]
            }
          }
        }
      ]
    },
    FRA: {
      name: "Frankreich",
      continent: "Europa",
      active: true,
      overview: "Customer Experience Center in Paris.",
      points: [
        {
          id: "fra-sales",
          title: "Experience Studio",
          category: "Sales",
          coordinates: [2.3522, 48.8566],
          description: "Customer Journeys & Design Thinking.",
          data: {
            Group: {
              summary: "Pilotiert neue Kundenportale.",
              metrics: [{ label: "CX Score", value: "4,6/5", trend: "+0,3" }]
            },
            CVS: {
              summary: "Joint Ventures im Luxus- und Mobility-Sektor.",
              metrics: [{ label: "Umsatzbeitrag", value: "$980 Mio.", trend: "+9 %" }]
            },
            RVS: null,
            compare: null
          }
        }
      ]
    },
    ESP: {
      name: "Spanien",
      continent: "Europa",
      active: false,
      overview: "Shared Services Aufbau.",
      points: []
    },
    GBR: {
      name: "Vereinigtes Königreich",
      continent: "Europa",
      active: true,
      overview: "Cybersecurity Leitstelle in London.",
      points: [
        {
          id: "gbr-operations",
          title: "Cyber Defense Center",
          category: "Operations",
          coordinates: [-0.1276, 51.5072],
          description: "24/7 Monitoring für die Konzerninfrastruktur.",
          data: {
            Group: {
              summary: "Erhöht Resilienz gegen Bedrohungen.",
              metrics: [
                { label: "Incidents resolved", value: "1.240", trend: "+12 %" },
                { label: "MTTR", value: "2,1h", trend: "−18 %" }
              ]
            },
            CVS: {
              summary: "Managed Security Services für Industriekunden.",
              metrics: [{ label: "Vertragsvolumen", value: "$640 Mio.", trend: "+15 %" }]
            },
            RVS: {
              summary: "Absicherung kritischer Infrastruktur.",
              metrics: [{ label: "Abgedeckte Behörden", value: "28", trend: "+5" }]
            },
            compare: {
              leftLabel: "CVS",
              rightLabel: "RVS",
              summary: "Security KPIs im Überblick.",
              metrics: [
                { label: "Abwehrquote", left: "98,4 %", right: "97,1 %" },
                { label: "Service SLAs", left: "99,7 %", right: "99,1 %" }
              ]
            }
          }
        }
      ]
    },
    NLD: {
      name: "Niederlande",
      continent: "Europa",
      active: false,
      overview: "Innovation Lab geplant.",
      points: []
    },
    ZAF: {
      name: "Südafrika",
      continent: "Afrika & Mittlerer Osten",
      active: true,
      overview: "Digital Campus für das südliche Afrika.",
      points: [
        {
          id: "zaf-hr",
          title: "Digital Campus",
          category: "HR",
          coordinates: [28.0473, -26.2041],
          description: "Johannesburg treibt Skills-Programme voran.",
          data: {
            Group: {
              summary: "Der Campus unterstützt globale Academy-Programme.",
              metrics: [
                { label: "Teilnehmer", value: "12.400", trend: "+19 %" }
              ]
            },
            CVS: null,
            RVS: {
              summary: "RVS qualifiziert Spezialisten für HealthTech.",
              metrics: [{ label: "zertifizierte Experten", value: "2.100", trend: "+24 %" }]
            },
            compare: null
          }
        }
      ]
    },
    EGY: {
      name: "Ägypten",
      continent: "Afrika & Mittlerer Osten",
      active: false,
      overview: "Shared Service Center in Planung.",
      points: []
    },
    ARE: {
      name: "Vereinigte Arabische Emirate",
      continent: "Afrika & Mittlerer Osten",
      active: true,
      overview: "Innovation & Ventures in Dubai.",
      points: [
        {
          id: "are-sales",
          title: "Ventures Lab",
          category: "Sales",
          coordinates: [55.2708, 25.2048],
          description: "Co-Creation mit Energie- und Mobilitätskunden.",
          data: {
            Group: {
              summary: "Pilotiert neue Serviceangebote.",
              metrics: [{ label: "Pipeline", value: "$1,1 Mrd.", trend: "+14 %" }]
            },
            CVS: {
              summary: "Scale-up Programme.",
              metrics: [{ label: "Start-up Partners", value: "34", trend: "+9" }]
            },
            RVS: null,
            compare: null
          }
        }
      ]
    },
    CHN: {
      name: "China",
      continent: "Asien-Pazifik",
      active: true,
      overview: "Smart Manufacturing und Liefernetzwerke.",
      points: [
        {
          id: "chn-operations",
          title: "Smart Manufacturing",
          category: "Operations",
          coordinates: [121.4737, 31.2304],
          description: "Shanghai betreibt das IoT-Kontrollzentrum.",
          data: {
            Group: {
              summary: "Globale Produktionssteuerung mit Echtzeit-Daten.",
              metrics: [
                { label: "OEE", value: "89 %", trend: "+3 PP" },
                { label: "Liefertermintreue", value: "96 %", trend: "+4 PP" }
              ]
            },
            CVS: {
              summary: "Robotik für High-Tech-Kunden.",
              metrics: [{ label: "Automatisierungsquote", value: "74 %", trend: "+6 PP" }]
            },
            RVS: null,
            compare: {
              leftLabel: "CVS",
              rightLabel: "RVS",
              summary: "Digital Reifegrad",
              metrics: [
                { label: "IoT-Abdeckung", left: "88 %", right: "42 %" },
                { label: "Qualitäts-Dashboards", left: "95 %", right: "61 %" }
              ]
            }
          }
        }
      ]
    },
    IND: {
      name: "Indien",
      continent: "Asien-Pazifik",
      active: true,
      overview: "Global Delivery Center für Data & AI.",
      points: [
        {
          id: "ind-hr",
          title: "Innovation Campus",
          category: "HR",
          coordinates: [77.5946, 12.9716],
          description: "Bengaluru ist das Herzstück des Data & AI Campus.",
          data: {
            Group: {
              summary: "Trainiert jährlich über 15.000 Mitarbeitende.",
              metrics: [
                { label: "Zertifizierungen", value: "15.200", trend: "+26 %" },
                { label: "Women in Tech", value: "38 %", trend: "+3 PP" }
              ]
            },
            CVS: {
              summary: "Build-Operate-Transfer Modelle für KI-Plattformen.",
              metrics: [{ label: "KI-Use Cases live", value: "240", trend: "+18 %" }]
            },
            RVS: {
              summary: "Entwickelt GovTech-Lösungen.",
              metrics: [{ label: "Citizen Apps", value: "34", trend: "+11" }]
            },
            compare: {
              leftLabel: "CVS",
              rightLabel: "RVS",
              summary: "Ausbildungsfokus",
              metrics: [
                { label: "AI Fellows", left: "640", right: "320" },
                { label: "Cloud Architects", left: "520", right: "280" }
              ]
            }
          }
        }
      ]
    },
    JPN: {
      name: "Japan",
      continent: "Asien-Pazifik",
      active: false,
      overview: "Partnerschaften in Vorbereitung.",
      points: []
    },
    AUS: {
      name: "Australien",
      continent: "Asien-Pazifik",
      active: true,
      overview: "Service Hub für den Pazifikraum.",
      points: [
        {
          id: "aus-sales",
          title: "Hybrid Cloud Center",
          category: "Sales",
          coordinates: [151.2093, -33.8688],
          description: "Sydney orchestriert hybride Cloud-Services.",
          data: {
            Group: {
              summary: "Pilotiert Pay-as-you-go Modelle.",
              metrics: [{ label: "ARR", value: "$620 Mio.", trend: "+13 %" }]
            },
            CVS: {
              summary: "CVS liefert branchenspezifische Cloud Patterns.",
              metrics: [{ label: "Kunden live", value: "420", trend: "+11 %" }]
            },
            RVS: null,
            compare: null
          }
        }
      ]
    }
  }
};

const COUNTRY_BY_ISO = new Map(Object.entries(DATA_CONFIG.countries));
const CONTINENT_LIST = Object.keys(DATA_CONFIG.continents);
