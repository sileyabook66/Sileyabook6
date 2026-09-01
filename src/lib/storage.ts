import { 
  Ebook, 
  GenerationLog, 
  UserProfile, 
  CreditTransaction, 
  CreditTransactionType,
  CreditPackSchema,
  CreditPurchaseOrderSchema 
} from '../types';

const STORAGE_KEYS = {
  USER_PROFILE: 'studio_manuscrit_user_profile',
  EBOOKS: 'studio_manuscrit_ebooks',
  GENERATION_LOGS: 'studio_manuscrit_generation_logs',
  CREDIT_TRANSACTIONS: 'studio_manuscrit_credit_transactions',
};

const DEFAULT_PROFILE: UserProfile = {
  id: 'usr-author-01',
  name: 'Auteur Studio',
  email: 'auteur@manuscrit.studio',
  credits_pages: 500,
  total_credits_utilises: 0,
  plan_tier: 'Auteur Pro',
};

const SAMPLE_INITIAL_TRANSACTIONS: CreditTransaction[] = [
  {
    id: 'ctx-init-01',
    profile_id: 'usr-author-01',
    montant: 500,
    type: 'bonus',
    description: 'Dotation initiale de bienvenue — Atelier Studio',
    balance_after: 500,
    created_at: new Date().toISOString(),
  },
];

export const CATALOGUE_CREDIT_PACKS: CreditPackSchema[] = [
  {
    id: 'pack-starter',
    sku: 'pack_pages_100',
    nom: 'Pack Auteur Vélin',
    pages: 100,
    prix_eur: 19,
    devise: 'EUR',
    description: 'Idéal pour composer 3 à 5 livres structurés avec mise en page soignée.',
    badge: 'Essentiel',
    statut: 'catalogue_pret',
    fonctionnalites: [
      '100 pages de crédits de génération',
      'Accès prioritaire Gemini 3.7 Flash Studio',
      'Exports PDF Haute Définition & Couvertures PNG',
      'Historique des logs et transactions complet',
    ],
  },
  {
    id: 'pack-editor',
    sku: 'pack_pages_500',
    nom: 'Pack Studio Éditeur',
    pages: 500,
    prix_eur: 49,
    devise: 'EUR',
    description: 'Conçu pour les créateurs prolifiques, formateurs et maisons d\'auto-édition.',
    badge: 'Recommandé',
    statut: 'catalogue_pret',
    fonctionnalites: [
      '500 pages de crédits de génération',
      'Vitesse de composition maximale',
      'Découpage automatique multi-chapitres enrichi',
      'Upload Cloudinary raw illimité',
      'Assistance éditoriale dédiée',
    ],
  },
  {
    id: 'pack-master',
    sku: 'pack_pages_1500',
    nom: 'Pack Grand Œuvre',
    pages: 1500,
    prix_eur: 99,
    devise: 'EUR',
    description: 'Volume massif pour collections complètes, manuels techniques et séries.',
    badge: 'Volume Pro',
    statut: 'catalogue_pret',
    fonctionnalites: [
      '1500 pages de vélin garanties',
      'Support multi-auteurs & export batch',
      'Conservation pérenne de tous les états brouillons',
      'API webhook prête pour automatisation',
    ],
  },
];

const SAMPLE_INITIAL_EBOOKS: Ebook[] = [
  {
    id: 'ebk-sample-01',
    titre: 'L\'Art du Style & l\'Écriture Augmentée',
    sous_titre: 'Traité pratique pour concevoir des ouvrages pérennes et captivants',
    description: 'Une exploration approfondie des techniques de composition éditoriale moderne, combinant rigueur typographique et créativité narrative.',
    statut: 'published',
    source_type: 'prompt',
    source_detail: 'Manuel éditorial & méthodologie de structuration',
    cover_theme: 'velin',
    fichier_pdf_url: 'https://res.cloudinary.com/demo/raw/upload/v1/studio_manuscrit/l_art_du_prompt.pdf',
    credits_consommes: 20,
    created_at: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
    updated_at: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    plan: [
      { numero: 1, titre: 'Les Fondations du Style Augmenté', description: 'Comprendre l\'interaction entre intention humaine et clarté lexicale.' },
      { numero: 2, titre: 'L\'Architecture du Manuscrit', description: 'Structuration méthodique en chapitres, sections et callouts de synthèse.' },
      { numero: 3, titre: 'La Finition Éditoriale & Typographique', description: 'Harmonie des proportions, vélin d\'or et mise en page pour l\'impression.' },
    ],
    contenu: {
      preface: 'À tous les auteurs qui cherchent à donner à leurs idées un écrin éditorial d\'excellence.',
      introduction: 'L\'acte d\'écrire a toujours été une technologie de l\'esprit. Ce guide propose une approche concrète pour articuler vos idées avec une précision sans précédent.',
      chapitres: [
        {
          id: 'chap-1',
          numero: 1,
          titre: 'Les Fondations du Style Augmenté',
          resume: '',
          objectifs: ['Clarifier la voix de l\'auteur', 'Maîtriser les contraintes de contexte'],
          points_cles: ['La précision prime sur la quantité', 'L\'itération affine la pensée'],
          sections: [
            {
              titre: '1.1 L\'Intention Première',
              paragraphes: [
                'Tout ouvrage marquant commence par une intention inébranlable[^1]. Avant de tracer les premiers paragraphes, le créateur doit définir avec rigueur la promesse faite au lecteur.',
                'La structure méthodologique n\'invente pas la direction ; elle en amplifie la texture et le rythme lexical[^2].'
              ],
              notes_de_bas_de_page: [
                {
                  id: 'fn-1-1',
                  reference_number: 1,
                  terme_cible: 'intention inébranlable',
                  contenu: 'Notion empruntée à la rhétorique classique : la « dispositio » comme axe directeur avant toute formulation stylistique.'
                },
                {
                  id: 'fn-1-2',
                  reference_number: 2,
                  terme_cible: 'rythme lexical',
                  contenu: 'Désigne ici la cadence syllabique et la distribution harmonique des temps forts dans la prose.'
                }
              ]
            }
          ]
        },
        {
          id: 'chap-2',
          numero: 2,
          titre: 'L\'Architecture du Manuscrit',
          resume: '',
          objectifs: ['Établir un séquençage captivant', 'Éviter les redondances conceptuelles'],
          points_cles: ['L\'arc pédagogique', 'La respiration entre théorie et mise en pratique'],
          sections: [
            {
              titre: '2.1 Le Découpage en Mosaïque',
              paragraphes: [
                'Chaque chapitre fonctionne comme une station de pensée. L\'agencement des titres de niveau supérieur et des paragraphes doit guider le regard sans jamais lasser.',
                'Le développement fluide et continu des arguments offre des points d\'ancrage essentiels pour la compréhension.'
              ]
            }
          ]
        }
      ],
      conclusion: 'Ainsi s\'achève ce premier aperçu des règles de l\'art. Il ne tient qu\'à vous de faire naître les prochains chefs-d\'œuvre.',
      epilogue: 'Rédigé et composé au sein de l\'Atelier Studio Manuscrit.',
      metadata: {
        pages_estimees: 20,
        mots_total: 4500,
        temps_lecture_min: 25,
        genre: 'Guide Pratique & Essai',
        style: 'Élégant et didactique',
        langue: 'Français',
        tonalite: 'didactique'
      }
    }
  },
  {
    id: 'ebk-sample-02',
    titre: 'Stratégies du Créateur Moderne',
    sous_titre: 'Monétisation, diffusion et audience pour livres numériques',
    description: 'Brouillon de travail synthétisant les meilleures pratiques de publication directe et de stratégie de contenu.',
    statut: 'draft',
    source_type: 'youtube',
    source_detail: 'https://youtube.com/watch?v=creator_growth_masterclass',
    cover_theme: 'carmin',
    credits_consommes: 15,
    created_at: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    updated_at: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    plan: [
      { numero: 1, titre: 'L\'Écosystème de Distribution', description: 'Canaux directs vs plateformes centralisées.' },
      { numero: 2, titre: 'Le Tunnel de Conversion', description: 'Transformer un lecteur curieux en ambassadeur fidèle.' }
    ],
    contenu: {
      introduction: 'Pourquoi 90% des créateurs peinent à vendre leurs ouvrages numériques et comment inverser cette tendance.',
      chapitres: [
        {
          id: 'chap-1',
          numero: 1,
          titre: 'L\'Écosystème de Distribution',
          resume: '',
          objectifs: ['Identifier les canaux à forte marge', 'Automatiser la livraison du PDF'],
          points_cles: ['La propriété de l\'audience', 'La tarification psychologique'],
          sections: [
            {
              titre: '1.1 Vendre en direct',
              paragraphes: [
                'Héberger ses manuscrits avec un rendu impeccable donne immédiatement une valeur perçue supérieure.'
              ]
            }
          ]
        }
      ],
      conclusion: 'Le marché appartient aux créateurs qui soignent autant la forme que le fond.',
      metadata: {
        pages_estimees: 15,
        mots_total: 3200,
        temps_lecture_min: 18,
        genre: 'Business & Création',
        style: 'Direct et opérationnel',
        langue: 'Français',
        tonalite: 'guide_pratique'
      }
    }
  }
];

export const storage = {
  getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return data ? JSON.parse(data) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  },

  saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Erreur sauvegarde profil:', e);
    }
  },

  getTransactions(): CreditTransaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CREDIT_TRANSACTIONS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.CREDIT_TRANSACTIONS, JSON.stringify(SAMPLE_INITIAL_TRANSACTIONS));
        return SAMPLE_INITIAL_TRANSACTIONS;
      }
      return JSON.parse(data);
    } catch {
      return SAMPLE_INITIAL_TRANSACTIONS;
    }
  },

  addTransaction(tx: Omit<CreditTransaction, 'id' | 'created_at'>): CreditTransaction {
    const transactions = this.getTransactions();
    const newTx: CreditTransaction = {
      ...tx,
      id: `ctx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      created_at: new Date().toISOString(),
    };
    transactions.unshift(newTx);
    try {
      localStorage.setItem(STORAGE_KEYS.CREDIT_TRANSACTIONS, JSON.stringify(transactions.slice(0, 200)));
    } catch (e) {
      console.error('Erreur enregistrement transaction:', e);
    }
    return newTx;
  },

  deductCredits(
    pages: number,
    options?: { ebookId?: string; description?: string }
  ): { success: boolean; remaining: number; transaction?: CreditTransaction; error?: string } {
    const profile = this.getProfile();
    if (profile.credits_pages < pages) {
      return {
        success: false,
        remaining: profile.credits_pages,
        error: `Crédits insuffisants : vous disposez de ${profile.credits_pages} pages, mais cette génération en requiert ${pages}.`,
      };
    }

    profile.credits_pages -= pages;
    profile.total_credits_utilises += pages;
    this.saveProfile(profile);

    // Record credit transaction
    const transaction = this.addTransaction({
      profile_id: profile.id,
      montant: -pages,
      type: 'generation',
      description: options?.description || `Génération de manuscrit (${pages} pages)`,
      ebook_id: options?.ebookId,
      balance_after: profile.credits_pages,
    });

    return { success: true, remaining: profile.credits_pages, transaction };
  },

  addCredits(
    pages: number,
    typeOrOptions: CreditTransactionType | { type?: CreditTransactionType; description?: string } = 'bonus',
    descriptionParam?: string
  ): UserProfile {
    const profile = this.getProfile();
    profile.credits_pages += pages;
    this.saveProfile(profile);

    const type: CreditTransactionType = typeof typeOrOptions === 'string' ? typeOrOptions : (typeOrOptions?.type || 'bonus');
    const description: string | undefined = typeof typeOrOptions === 'object' ? typeOrOptions?.description : descriptionParam;

    this.addTransaction({
      profile_id: profile.id,
      montant: pages,
      type,
      description: description || (type === 'achat' ? `Achat de ${pages} pages de crédits` : `Crédit bonus de ${pages} pages`),
      balance_after: profile.credits_pages,
    });

    return profile;
  },

  getCreditPacks(): CreditPackSchema[] {
    return CATALOGUE_CREDIT_PACKS;
  },

  preparePurchaseOrder(packSku: string, profileId?: string): CreditPurchaseOrderSchema {
    const profile = this.getProfile();
    const pack = CATALOGUE_CREDIT_PACKS.find((p) => p.sku === packSku) || CATALOGUE_CREDIT_PACKS[0];
    const order: CreditPurchaseOrderSchema = {
      id: `ord-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      profile_id: profileId || profile.id,
      pack_sku: pack.sku,
      montant_eur: pack.prix_eur,
      pages_allouees: pack.pages,
      statut: 'draft_prepared',
      provider: 'stripe_ready',
      created_at: new Date().toISOString(),
      metadata: {
        pack_name: pack.nom,
        devise: pack.devise,
        future_checkout_url_placeholder: `/api/studio/purchases/checkout-session?sku=${pack.sku}`,
      },
    };
    return order;
  },

  getEbooks(): Ebook[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EBOOKS);
      if (!data) {
        // Initialize with default sample data
        localStorage.setItem(STORAGE_KEYS.EBOOKS, JSON.stringify(SAMPLE_INITIAL_EBOOKS));
        return SAMPLE_INITIAL_EBOOKS;
      }
      let parsed: Ebook[] = JSON.parse(data);
      // Nettoyer l'ancien livre généré s'il subsiste dans le stockage local
      if (parsed.some((b) => b.id === 'ebk-argent-en-ligne-2026')) {
        parsed = parsed.filter((b) => b.id !== 'ebk-argent-en-ligne-2026');
        localStorage.setItem(STORAGE_KEYS.EBOOKS, JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return SAMPLE_INITIAL_EBOOKS;
    }
  },

  saveEbook(ebook: Ebook): void {
    try {
      const ebooks = this.getEbooks();
      const index = ebooks.findIndex((b) => b.id === ebook.id);
      if (index >= 0) {
        ebooks[index] = ebook;
      } else {
        ebooks.unshift(ebook);
      }
      localStorage.setItem(STORAGE_KEYS.EBOOKS, JSON.stringify(ebooks));
    } catch (e) {
      console.error('Erreur sauvegarde ebook:', e);
    }
  },

  deleteEbook(id: string): boolean {
    try {
      const ebooks = this.getEbooks();
      const filtered = ebooks.filter((b) => b.id !== id);
      localStorage.setItem(STORAGE_KEYS.EBOOKS, JSON.stringify(filtered));
      return true;
    } catch (e) {
      console.error('Erreur suppression ebook:', e);
      return false;
    }
  },

  duplicateEbook(id: string): Ebook | null {
    try {
      const ebooks = this.getEbooks();
      const original = ebooks.find((b) => b.id === id);
      if (!original) return null;

      const nowIso = new Date().toISOString();
      const duplicated: Ebook = {
        ...original,
        id: `ebk-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        titre: `${original.titre} (Copie)`,
        statut: 'draft',
        created_at: nowIso,
        updated_at: nowIso,
      };

      ebooks.unshift(duplicated);
      localStorage.setItem(STORAGE_KEYS.EBOOKS, JSON.stringify(ebooks));
      return duplicated;
    } catch (e) {
      console.error('Erreur duplication ebook:', e);
      return null;
    }
  },

  getGenerationLogs(): GenerationLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GENERATION_LOGS);
      if (data) {
        return JSON.parse(data);
      }
      return [];
    } catch {
      return [];
    }
  },

  addGenerationLog(log: GenerationLog): void {
    try {
      const logs = this.getGenerationLogs();
      logs.unshift(log);
      localStorage.setItem(STORAGE_KEYS.GENERATION_LOGS, JSON.stringify(logs.slice(0, 100)));
    } catch (e) {
      console.error('Erreur ajout generation_log:', e);
    }
  },
};
