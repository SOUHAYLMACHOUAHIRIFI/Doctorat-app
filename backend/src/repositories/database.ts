import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  UserEntity,
  CandidateEntity,
  DoctoralStudentEntity,
  SupervisorEntity,
  ResearchStructureEntity,
  DoctoralCenterEntity,
  ResearchTopicEntity,
  ApplicationEntity,
  ApplicationDocumentEntity,
  DocumentReviewEntity,
  AcademicYearEntity,
  EnrollmentEntity,
  ReEnrollmentEntity,
  NotificationEntity,
  AuditLogEntity,
} from '../types';
import { ROLES, DOCUMENT_TYPES, DOCUMENT_STATUS } from '../config/constants';

export interface DatabaseSchema {
  users: UserEntity[];
  candidates: CandidateEntity[];
  doctoralStudents: DoctoralStudentEntity[];
  supervisors: SupervisorEntity[];
  structures: ResearchStructureEntity[];
  cedCenters: DoctoralCenterEntity[];
  topics: ResearchTopicEntity[];
  applications: ApplicationEntity[];
  documents: ApplicationDocumentEntity[];
  documentReviews: DocumentReviewEntity[];
  academicYears: AcademicYearEntity[];
  enrollments: EnrollmentEntity[];
  reEnrollments: ReEnrollmentEntity[];
  notifications: NotificationEntity[];
  auditLogs: AuditLogEntity[];
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'gcd_database.json');

class DatabaseService {
  private data: DatabaseSchema;
  private isWriting = false;

  constructor() {
    this.data = this.initializeDatabase();
  }

  private initializeDatabase(): DatabaseSchema {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_PATH)) {
      try {
        const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(fileContent);
      } catch (err) {
        console.error('Failed to read database file, re-seeding:', err);
      }
    }

    const seeded = this.getSeedData();
    this.saveToDisk(seeded);
    return seeded;
  }

  private saveToDisk(data: DatabaseSchema) {
    if (this.isWriting) return;
    this.isWriting = true;
    try {
      const tempPath = `${DB_PATH}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_PATH);
    } catch (err) {
      console.error('Error saving database to disk:', err);
    } finally {
      this.isWriting = false;
    }
  }

  public get<K extends keyof DatabaseSchema>(table: K): DatabaseSchema[K] {
    return this.data[table];
  }

  public save() {
    this.saveToDisk(this.data);
  }

  private getSeedData(): DatabaseSchema {
    // Generate secure standard password hash for demo accounts: "usmba2026"
    const defaultPasswordHash = bcrypt.hashSync('usmba2026', 10);
    const today = new Date().toISOString().split('T')[0];

    const academicYearId = 'ay-2026-2027';
    const cedId = 'ced-usmba-main';
    const labLisacId = 'struct-lisac';
    const labLermaId = 'struct-lerma';

    const users: UserEntity[] = [
      // 1. CANDIDATE: Youssef El Amrani
      {
        id: 'usr-cand-youssef',
        email: 'youssef.elamrani@usmba.ac.ma',
        passwordHash: defaultPasswordHash,
        firstName: 'Youssef',
        lastName: 'El Amrani',
        cin: 'CD654321',
        phone: '+212 6 61 23 45 67',
        establishment: 'FST Fès',
        laboratory: 'Laboratoire LISAC',
        role: ROLES.CANDIDATE,
        isActive: true,
        isEmailVerified: true,
        createdAt: '2026-10-01',
        updatedAt: '2026-10-01',
      },
      // 2. CANDIDATE: Salma Berrada
      {
        id: 'usr-cand-salma',
        email: 'salma.berrada@usmba.ac.ma',
        passwordHash: defaultPasswordHash,
        firstName: 'Salma',
        lastName: 'Berrada',
        cin: 'C892145',
        phone: '+212 6 62 98 76 54',
        establishment: 'FS Dhar El Mahraz',
        laboratory: 'Lab. Chimie & Environnement',
        role: ROLES.CANDIDATE,
        isActive: true,
        isEmailVerified: true,
        createdAt: '2026-10-05',
        updatedAt: '2026-10-05',
      },
      // 3. DOCTORANT: Anass Tazi (already registered and enrolled in Year 2)
      {
        id: 'usr-doc-anass',
        email: 'anass.tazi@usmba.ac.ma',
        passwordHash: defaultPasswordHash,
        firstName: 'Anass',
        lastName: 'Tazi',
        cin: 'CD712345',
        phone: '+212 6 63 11 22 33',
        establishment: 'FST Fès',
        laboratory: 'Laboratoire LISAC',
        role: ROLES.DOCTORANT,
        isActive: true,
        isEmailVerified: true,
        createdAt: '2025-10-15',
        updatedAt: '2026-10-10',
      },
      // 4. SUPERVISOR: Pr. Karim Bennani
      {
        id: 'usr-prof-karim',
        email: 'karim.bennani@usmba.ac.ma',
        passwordHash: defaultPasswordHash,
        firstName: 'Karim',
        lastName: 'Bennani',
        cin: 'CD112233',
        phone: '+212 6 61 00 11 22',
        establishment: 'FST Fès',
        laboratory: 'Laboratoire LISAC',
        role: ROLES.SUPERVISOR,
        isActive: true,
        isEmailVerified: true,
        createdAt: '2025-01-01',
        updatedAt: '2026-09-01',
      },
      // 5. SUPERVISOR: Pr. Fatima Zahra Chami
      {
        id: 'usr-prof-fatima',
        email: 'fatima.chami@usmba.ac.ma',
        passwordHash: defaultPasswordHash,
        firstName: 'Fatima Zahra',
        lastName: 'Chami',
        cin: 'C445566',
        phone: '+212 6 62 33 44 55',
        establishment: 'FS Dhar El Mahraz',
        laboratory: 'Laboratoire LERMA',
        role: ROLES.SUPERVISOR,
        isActive: true,
        isEmailVerified: true,
        createdAt: '2025-01-01',
        updatedAt: '2026-09-01',
      },
      // 6. STRUCTURE DIRECTOR: Directeur du Laboratoire LISAC
      {
        id: 'usr-dir-lisac',
        email: 'direction.lisac@usmba.ac.ma',
        passwordHash: defaultPasswordHash,
        firstName: 'Directeur',
        lastName: 'Laboratoire LISAC',
        cin: 'CD998877',
        phone: '+212 5 35 60 80 14',
        establishment: 'FST Fès',
        laboratory: 'Laboratoire LISAC',
        role: ROLES.STRUCTURE_DIRECTOR,
        isActive: true,
        isEmailVerified: true,
        createdAt: '2025-01-01',
        updatedAt: '2026-09-01',
      },
      // 7. CED ADMIN: Responsable Centre d'Études Doctorales (CED)
      {
        id: 'usr-ced-admin',
        email: 'ced.admin@usmba.ac.ma',
        passwordHash: defaultPasswordHash,
        firstName: 'Directeur',
        lastName: 'CED USMBA',
        cin: 'CD001122',
        phone: '+212 5 35 60 96 60',
        establishment: 'Présidence & CED USMBA',
        laboratory: 'Centre d’Études Doctorales (CED)',
        role: ROLES.CED_ADMIN,
        isActive: true,
        isEmailVerified: true,
        createdAt: '2025-01-01',
        updatedAt: '2026-09-01',
      },
      // 8. SYSTEM ADMIN: Administrateur Plateforme
      {
        id: 'usr-sys-admin',
        email: 'admin.system@usmba.ac.ma',
        passwordHash: defaultPasswordHash,
        firstName: 'Administrateur',
        lastName: 'Système GCD',
        cin: 'CD999999',
        phone: '+212 5 35 60 00 00',
        establishment: 'Présidence USMBA',
        role: ROLES.SYSTEM_ADMIN,
        isActive: true,
        isEmailVerified: true,
        createdAt: '2025-01-01',
        updatedAt: '2026-09-01',
      },
    ];

    const candidates: CandidateEntity[] = [
      {
        id: 'cand-youssef',
        userId: 'usr-cand-youssef',
        etablissementOrigine: 'FST Fès',
        diplomeOrigine: 'Master Recherche en Informatique & IA',
        mentionDiplome: 'Bien',
        anneeObtention: 2026,
        createdAt: '2026-10-01',
        updatedAt: '2026-10-01',
      },
      {
        id: 'cand-salma',
        userId: 'usr-cand-salma',
        etablissementOrigine: 'FS Dhar El Mahraz',
        diplomeOrigine: 'Master en Biotechnologies Végétales',
        mentionDiplome: 'Très Bien',
        anneeObtention: 2026,
        createdAt: '2026-10-05',
        updatedAt: '2026-10-05',
      },
    ];

    const supervisors: SupervisorEntity[] = [
      {
        id: 'sup-karim',
        userId: 'usr-prof-karim',
        grade: 'Professeur de l’Enseignement Supérieur (PES)',
        specialty: 'Intelligence Artificielle & Systèmes Embarqués',
        structureId: labLisacId,
        createdAt: '2025-01-01',
        updatedAt: '2026-09-01',
      },
      {
        id: 'sup-fatima',
        userId: 'usr-prof-fatima',
        grade: 'Professeur Habilité (PH)',
        specialty: 'Énergies Renouvelables & Smart Grids',
        structureId: labLermaId,
        createdAt: '2025-01-01',
        updatedAt: '2026-09-01',
      },
    ];

    const structures: ResearchStructureEntity[] = [
      {
        id: labLisacId,
        name: 'Laboratoire d’Ingénierie, Systèmes et Applications Complexes (LISAC)',
        code: 'LISAC',
        establishment: 'FST Fès',
        cedId,
        directorId: 'usr-dir-lisac',
        createdAt: '2025-01-01',
        updatedAt: '2026-09-01',
      },
      {
        id: labLermaId,
        name: 'Laboratoire d’Énergies Renouvelables et Matériaux Avancés (LERMA)',
        code: 'LERMA',
        establishment: 'FS Dhar El Mahraz',
        cedId,
        createdAt: '2025-01-01',
        updatedAt: '2026-09-01',
      },
    ];

    const cedCenters: DoctoralCenterEntity[] = [
      {
        id: cedId,
        name: 'Centre d’Études Doctorales (CED) — Sciences et Technologies',
        description: 'Gestion du cycle doctoral à l’Université Sidi Mohamed Ben Abdellah de Fès',
        directorId: 'usr-ced-admin',
        createdAt: '2025-01-01',
        updatedAt: '2026-09-01',
      },
    ];

    const academicYears: AcademicYearEntity[] = [
      {
        id: academicYearId,
        code: '2026-2027',
        isCurrent: true,
        campaignOpen: true,
        campaignDeadline: '2026-11-30',
        createdAt: '2026-09-01',
      },
      {
        id: 'ay-2025-2026',
        code: '2025-2026',
        isCurrent: false,
        campaignOpen: false,
        createdAt: '2025-09-01',
      },
    ];

    const topics: ResearchTopicEntity[] = [
      {
        id: 'th-01',
        title: 'Optimisation des modèles d’apprentissage profond pour l’imagerie médicale embarquée',
        summary:
          'Ce projet doctoral vise la conception et le déploiement d’architectures neuronales ultra-compressées pour le diagnostic radiologique en temps réel sur micro-systèmes embarqués edge.',
        keywords: ['IA Médicale', 'Deep Learning', 'Edge AI', 'Optimisation'],
        establishment: 'FST Fès',
        laboratoryId: labLisacId,
        supervisorId: 'sup-karim',
        slotsTotal: 1,
        slotsTaken: 0,
        status: 'VALIDE',
        structureFeedback: 'Sujet innovant validé par le conseil de structure et la commission CED.',
        academicYearId,
        createdAt: '2026-09-15',
        updatedAt: '2026-09-15',
      },
      {
        id: 'th-02',
        title: 'Gestion intelligente des micro-réseaux électriques intégrant le stockage vert et l’hydrogène',
        summary:
          'Développement d’algorithmes prédictifs multi-objectifs pour la stabilité dynamique et la gestion optimale de la production hybride éolien/solaire/hydrogène dans le Saïss.',
        keywords: ['Smart Grids', 'Hydrogène Vert', 'Énergies Renouvelables'],
        establishment: 'FS Dhar El Mahraz',
        laboratoryId: labLermaId,
        supervisorId: 'sup-fatima',
        slotsTotal: 2,
        slotsTaken: 0,
        status: 'VALIDE',
        structureFeedback: 'Conforme aux axes stratégiques de la transition énergétique.',
        academicYearId,
        createdAt: '2026-09-20',
        updatedAt: '2026-09-20',
      },
      {
        id: 'th-03',
        title: 'Extraction et valorisation des biomolécules actives des plantes aromatiques de l’Atlas',
        summary:
          'Procédés éco-responsables par ultrasons et fluides supercritiques pour l’obtention d’antioxydants naturels à usage biopharmaceutique et cosmétique.',
        keywords: ['Phytochimie', 'Biomatériaux', 'Éco-extraction'],
        establishment: 'FST Fès',
        laboratoryId: labLisacId,
        supervisorId: 'sup-karim',
        slotsTotal: 1,
        slotsTaken: 0,
        status: 'VALIDE',
        academicYearId,
        createdAt: '2026-09-22',
        updatedAt: '2026-09-22',
      },
      {
        id: 'th-04',
        title: 'Analyse automatique des manuscrits anciens arabes par Transformers visuels auto-supervisés',
        summary:
          'Numérisation et transcription sémantique automatisée des corpus manuscrits de la bibliothèque Al Quaraouiyine à Fès.',
        keywords: ['NLP Arabe', 'Vision par Ordinateur', 'Patrimoine Manuscrit'],
        establishment: 'FS Dhar El Mahraz',
        laboratoryId: labLermaId,
        supervisorId: 'sup-fatima',
        slotsTotal: 2,
        slotsTaken: 0,
        status: 'VALIDE',
        academicYearId,
        createdAt: '2026-10-02',
        updatedAt: '2026-10-02',
      },
    ];

    const doctoralStudents: DoctoralStudentEntity[] = [
      {
        id: 'doc-stud-anass',
        userId: 'usr-doc-anass',
        cneNumber: 'N134567890',
        thesisTitle: 'Architectures neuromorphiques et vision par ordinateur basse consommation pour drones',
        topicId: 'th-01',
        supervisorId: 'sup-karim',
        structureId: labLisacId,
        enrollmentYear: 2,
        createdAt: '2025-10-25',
        updatedAt: '2026-10-10',
      },
    ];

    const reEnrollments: ReEnrollmentEntity[] = [
      {
        id: 're-anass-y2',
        studentId: 'doc-stud-anass',
        studentName: 'Anass Tazi',
        studentEmail: 'anass.tazi@usmba.ac.ma',
        supervisorId: 'sup-karim',
        supervisorName: 'Pr. Karim Bennani',
        academicYearId,
        academicYearCode: '2026-2027',
        yearNumber: 2,
        thesisTitle: 'Architectures neuromorphiques et vision par ordinateur basse consommation pour drones',
        establishment: 'FST Fès',
        summary:
          'Avancement conforme au calendrier prévisionnel. Publication de 2 articles en conférence internationale IEEE et soumission d’un journal Q1 en cours d’évaluation.',
        publicationsCount: 2,
        communicationsCount: 3,
        progressPercentage: 65,
        reportFileName: 'Rapport_Activite_Annuelle_Anass_Tazi_A2.pdf',
        status: 'AVIS_FAVORABLE_ENCADRANT',
        supervisorFeedback: 'Excellent travail de recherche. Résultats préliminaires très prometteurs.',
        submittedAt: '2026-10-15',
        updatedAt: '2026-10-20',
      },
    ];

    const notifications: NotificationEntity[] = [
      {
        id: 'notif-1',
        userId: 'usr-cand-youssef',
        title: 'Bienvenue sur GCD USMBA',
        message: 'Votre compte candidat a été initialisé. Veuillez téléverser vos 4 pièces obligatoires à l’Étape 1.',
        type: 'INFO',
        isRead: false,
        link: '/candidat',
        createdAt: today,
      },
      {
        id: 'notif-2',
        userId: 'usr-prof-karim',
        title: 'Campagne d’inscription 2026-2027 ouverte',
        message: 'Vous pouvez proposer de nouveaux sujets de thèse pour l’année universitaire en cours.',
        type: 'INFO',
        isRead: false,
        link: '/supervisor',
        createdAt: today,
      },
    ];

    const auditLogs: AuditLogEntity[] = [
      {
        id: 'audit-init-1',
        userEmail: 'system@usmba.ac.ma',
        userRole: 'SYSTEM_ADMIN',
        action: 'SYSTEM_INIT',
        entityType: 'Database',
        details: { message: 'Initialisation de la base de données relationnelle sécurisée GCD USMBA' },
        createdAt: today,
      },
    ];

    return {
      users,
      candidates,
      doctoralStudents,
      supervisors,
      structures,
      cedCenters,
      topics,
      applications: [],
      documents: [],
      documentReviews: [],
      academicYears,
      enrollments: [],
      reEnrollments,
      notifications,
      auditLogs,
    };
  }
}

export const db = new DatabaseService();
