import fs from 'fs';
import path from 'path';
import { db, pool } from '../../../src/db/index.ts';
import * as schema from '../../../src/db/schema.ts';

async function seed() {
  console.log('🌱 Seeding PostgreSQL from data/gcd_database.json...');

  const dbJsonPath = path.resolve(process.cwd(), 'data/gcd_database.json');
  if (!fs.existsSync(dbJsonPath)) {
    console.warn('⚠️ No gcd_database.json found to seed.');
    return;
  }

  const rawData = fs.readFileSync(dbJsonPath, 'utf-8');
  const data = JSON.parse(rawData);

  // 1. Roles
  const standardRoles = [
    { id: 'role-cand', code: 'CANDIDATE', label: 'Candidat au Doctorat', description: 'Accès au dépôt de candidature et suivi des pièces' },
    { id: 'role-doc', code: 'DOCTORANT', label: 'Doctorant Inscrit', description: 'Accès aux réinscriptions annuelles et rapports d’activité' },
    { id: 'role-sup', code: 'SUPERVISOR', label: 'Directeur de Thèse', description: 'Proposition de sujets et évaluation académique' },
    { id: 'role-struct', code: 'STRUCTURE_DIRECTOR', label: 'Directeur de Structure de Recherche', description: 'Validation des sujets et candidatures de la structure' },
    { id: 'role-ced', code: 'CED_ADMIN', label: 'Responsable Pôle CED', description: 'Supervision globale du cycle doctoral et décisions finales' },
    { id: 'role-admin', code: 'SYSTEM_ADMIN', label: 'Administrateur Système', description: 'Gestion de la sécurité, utilisateurs et audit trail' },
  ];

  for (const r of standardRoles) {
    await db.insert(schema.roles).values(r).onConflictDoNothing();
  }

  // 2. Document Types
  const docTypes = [
    { code: 'baccalaureat', label: 'Diplôme du Baccalauréat', isRequired: true, maxSizeBytes: 10485760, allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'] },
    { code: 'releve_notes', label: 'Relevés de Notes (Licence & Master)', isRequired: true, maxSizeBytes: 15728640, allowedMimeTypes: ['application/pdf'] },
    { code: 'diplomes', label: 'Diplômes universitaires certifiés', isRequired: true, maxSizeBytes: 10485760, allowedMimeTypes: ['application/pdf', 'image/jpeg'] },
    { code: 'cin', label: 'Carte d’Identité Nationale (CIN)', isRequired: true, maxSizeBytes: 5242880, allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'] },
  ];

  for (const dt of docTypes) {
    await db.insert(schema.documentTypes).values(dt).onConflictDoNothing();
  }

  // 3. Doctoral Centers
  if (data.cedCenters) {
    for (const c of data.cedCenters) {
      await db.insert(schema.doctoralCenters).values({
        id: c.id,
        name: c.name,
        description: c.description || null,
        directorId: c.directorId || null,
      }).onConflictDoNothing();
    }
  }

  // 4. Academic Years
  if (data.academicYears) {
    for (const ay of data.academicYears) {
      await db.insert(schema.academicYears).values({
        id: ay.id,
        code: ay.code,
        isCurrent: ay.isCurrent ?? true,
        campaignOpen: ay.campaignOpen ?? true,
        campaignDeadline: ay.campaignDeadline || null,
      }).onConflictDoNothing();
    }
  }

  // 5. Research Structures
  if (data.structures) {
    for (const s of data.structures) {
      await db.insert(schema.researchStructures).values({
        id: s.id,
        name: s.name,
        code: s.code,
        establishment: s.establishment,
        cedId: s.cedId,
        directorId: s.directorId || null,
      }).onConflictDoNothing();
    }
  }

  // 6. Users
  if (data.users) {
    for (const u of data.users) {
      await db.insert(schema.users).values({
        id: u.id,
        email: u.email,
        passwordHash: u.passwordHash,
        firstName: u.firstName,
        lastName: u.lastName,
        cin: u.cin,
        phone: u.phone || null,
        establishment: u.establishment || null,
        laboratory: u.laboratory || null,
        role: u.role,
        isActive: u.isActive ?? true,
        isEmailVerified: u.isEmailVerified ?? true,
        emailToken: u.emailToken || null,
        resetToken: u.resetToken || null,
        resetExpires: u.resetExpires || null,
        lastLoginAt: u.lastLoginAt || null,
      }).onConflictDoNothing();
    }
  }

  // 7. Candidates
  if (data.candidates) {
    for (const c of data.candidates) {
      await db.insert(schema.candidates).values({
        id: c.id,
        userId: c.userId,
        etablissementOrigine: c.etablissementOrigine,
        diplomeOrigine: c.diplomeOrigine,
        mentionDiplome: c.mentionDiplome || null,
        anneeObtention: c.anneeObtention || null,
      }).onConflictDoNothing();
    }
  }

  // 8. Supervisors
  if (data.supervisors) {
    for (const sup of data.supervisors) {
      await db.insert(schema.supervisors).values({
        id: sup.id,
        userId: sup.userId,
        grade: sup.grade,
        specialty: sup.specialty || null,
        structureId: sup.structureId || null,
      }).onConflictDoNothing();
    }
  }

  // 9. Doctoral Students
  if (data.doctoralStudents) {
    for (const ds of data.doctoralStudents) {
      await db.insert(schema.doctoralStudents).values({
        id: ds.id,
        userId: ds.userId,
        cneNumber: ds.cneNumber || null,
        thesisTitle: ds.thesisTitle,
        topicId: ds.topicId || null,
        supervisorId: ds.supervisorId,
        structureId: ds.structureId,
        enrollmentYear: ds.enrollmentYear,
      }).onConflictDoNothing();
    }
  }

  // 10. Research Topics
  if (data.topics) {
    for (const t of data.topics) {
      await db.insert(schema.researchTopics).values({
        id: t.id,
        title: t.title,
        summary: t.summary,
        keywords: t.keywords,
        establishment: t.establishment,
        laboratoryId: t.laboratoryId,
        supervisorId: t.supervisorId,
        slotsTotal: t.slotsTotal,
        slotsTaken: t.slotsTaken || 0,
        status: t.status,
        structureFeedback: t.structureFeedback || null,
        academicYearId: t.academicYearId,
      }).onConflictDoNothing();
    }
  }

  // 11. Applications
  if (data.applications) {
    for (const a of data.applications) {
      await db.insert(schema.applications).values({
        id: a.id,
        candidateId: a.candidateId,
        candidateName: a.candidateName,
        candidateEmail: a.candidateEmail,
        candidateCin: a.candidateCin,
        candidatePhone: a.candidatePhone || null,
        etablissementOrigine: a.etablissementOrigine,
        diplomeOrigine: a.diplomeOrigine,
        topicId: a.topicId,
        topicTitle: a.topicTitle,
        establishment: a.establishment,
        laboratory: a.laboratory,
        supervisorId: a.supervisorId,
        supervisorName: a.supervisorName,
        step: a.step,
        status: a.status,
        notes: a.notes || null,
        motivationLetter: a.motivationLetter || null,
        supervisorGrade: a.supervisorGrade || null,
        supervisorFeedback: a.supervisorFeedback || null,
        structureFeedback: a.structureFeedback || null,
        commissionNotes: a.commissionNotes || null,
      }).onConflictDoNothing();
    }
  }

  // 12. Application Documents
  if (data.documents) {
    for (const d of data.documents) {
      await db.insert(schema.applicationDocuments).values({
        id: d.id,
        candidateId: d.candidateId,
        applicationId: d.applicationId || null,
        typeCode: d.typeCode,
        title: d.title,
        fileName: d.fileName,
        fileSize: d.fileSize,
        fileMimeType: d.fileMimeType,
        dataUrl: d.dataUrl || null,
        status: d.status,
        rejectionReason: d.rejectionReason || null,
        correctionNotes: d.correctionNotes || null,
        captureMethod: d.captureMethod || 'upload',
      }).onConflictDoNothing();
    }
  }

  // 13. ReEnrollments
  if (data.reEnrollments) {
    for (const re of data.reEnrollments) {
      await db.insert(schema.reEnrollments).values({
        id: re.id,
        studentId: re.studentId,
        studentName: re.studentName,
        studentEmail: re.studentEmail,
        supervisorId: re.supervisorId,
        supervisorName: re.supervisorName,
        academicYearId: re.academicYearId,
        academicYearCode: re.academicYearCode,
        yearNumber: re.yearNumber,
        thesisTitle: re.thesisTitle,
        establishment: re.establishment,
        summary: re.summary,
        publicationsCount: re.publicationsCount || 0,
        communicationsCount: re.communicationsCount || 0,
        progressPercentage: re.progressPercentage || 0,
        reportFileName: re.reportFileName || null,
        reportDataUrl: re.reportDataUrl || null,
        supervisorFeedback: re.supervisorFeedback || null,
        status: re.status,
      }).onConflictDoNothing();
    }
  }

  // 14. Notifications
  if (data.notifications) {
    for (const n of data.notifications) {
      await db.insert(schema.notifications).values({
        id: n.id,
        userId: n.userId,
        title: n.title,
        message: n.message,
        type: n.type,
        isRead: n.isRead,
        link: n.link || null,
      }).onConflictDoNothing();
    }
  }

  // 15. Audit Logs
  if (data.auditLogs) {
    for (const al of data.auditLogs) {
      await db.insert(schema.auditLogs).values({
        id: al.id,
        userId: al.userId || null,
        userEmail: al.userEmail,
        userRole: al.userRole,
        action: al.action,
        entityType: al.entityType,
        entityId: al.entityId || null,
        details: al.details || null,
        ipAddress: al.ipAddress || null,
      }).onConflictDoNothing();
    }
  }

  console.log('✅ PostgreSQL seeding completed successfully!');
}

seed()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(() => {
    pool.end();
  });
