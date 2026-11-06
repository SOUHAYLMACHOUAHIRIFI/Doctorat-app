import { relations } from 'drizzle-orm';
import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  varchar,
} from 'drizzle-orm/pg-core';

// 1. Roles & Permissions
export const roles = pgTable('roles', {
  id: varchar('id', { length: 64 }).primaryKey(),
  code: varchar('code', { length: 64 }).notNull().unique(),
  label: text('label').notNull(),
  description: text('description'),
});

export const permissions = pgTable('permissions', {
  id: varchar('id', { length: 64 }).primaryKey(),
  code: varchar('code', { length: 64 }).notNull().unique(),
  description: text('description'),
});

export const rolePermissions = pgTable('role_permissions', {
  id: varchar('id', { length: 64 }).primaryKey(),
  roleCode: varchar('role_code', { length: 64 }).notNull(),
  permissionCode: varchar('permission_code', { length: 64 }).notNull(),
});

// 2. Users (Accounts with Argon2/Bcrypt hash, RBAC, verification)
export const users = pgTable('users', {
  id: varchar('id', { length: 64 }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  firstName: varchar('first_name', { length: 128 }).notNull(),
  lastName: varchar('last_name', { length: 128 }).notNull(),
  cin: varchar('cin', { length: 32 }).notNull(),
  phone: varchar('phone', { length: 32 }),
  establishment: varchar('establishment', { length: 255 }),
  laboratory: varchar('laboratory', { length: 255 }),
  role: varchar('role', { length: 64 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  isEmailVerified: boolean('is_email_verified').default(false).notNull(),
  emailToken: text('email_token'),
  resetToken: text('reset_token'),
  resetExpires: text('reset_expires'),
  lastLoginAt: text('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 3. Doctoral Centers (CED)
export const doctoralCenters = pgTable('doctoral_centers', {
  id: varchar('id', { length: 64 }).primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  directorId: varchar('director_id', { length: 64 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 4. Research Structures (Laboratories, Equipes)
export const researchStructures = pgTable('research_structures', {
  id: varchar('id', { length: 64 }).primaryKey(),
  name: text('name').notNull(),
  code: varchar('code', { length: 64 }).notNull().unique(),
  establishment: varchar('establishment', { length: 255 }).notNull(),
  cedId: varchar('ced_id', { length: 64 }).notNull(),
  directorId: varchar('director_id', { length: 64 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 5. Academic Years & Campaigns
export const academicYears = pgTable('academic_years', {
  id: varchar('id', { length: 64 }).primaryKey(),
  code: varchar('code', { length: 32 }).notNull().unique(),
  isCurrent: boolean('is_current').default(true).notNull(),
  campaignOpen: boolean('campaign_open').default(true).notNull(),
  campaignDeadline: text('campaign_deadline'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 6. Profiles: Candidates
export const candidates = pgTable('candidates', {
  id: varchar('id', { length: 64 }).primaryKey(),
  userId: varchar('user_id', { length: 64 }).notNull().unique(),
  etablissementOrigine: text('etablissement_origine').notNull(),
  diplomeOrigine: text('diplome_origine').notNull(),
  mentionDiplome: varchar('mention_diplome', { length: 64 }),
  anneeObtention: integer('annee_obtention'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 7. Profiles: Supervisors
export const supervisors = pgTable('supervisors', {
  id: varchar('id', { length: 64 }).primaryKey(),
  userId: varchar('user_id', { length: 64 }).notNull().unique(),
  grade: varchar('grade', { length: 64 }).notNull(),
  specialty: text('specialty'),
  structureId: varchar('structure_id', { length: 64 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 8. Profiles: Doctoral Students
export const doctoralStudents = pgTable('doctoral_students', {
  id: varchar('id', { length: 64 }).primaryKey(),
  userId: varchar('user_id', { length: 64 }).notNull().unique(),
  cneNumber: varchar('cne_number', { length: 64 }),
  thesisTitle: text('thesis_title').notNull(),
  topicId: varchar('topic_id', { length: 64 }),
  supervisorId: varchar('supervisor_id', { length: 64 }).notNull(),
  structureId: varchar('structure_id', { length: 64 }).notNull(),
  enrollmentYear: integer('enrollment_year').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 9. Research Topics
export const researchTopics = pgTable('research_topics', {
  id: varchar('id', { length: 64 }).primaryKey(),
  title: text('title').notNull(),
  summary: text('summary').notNull(),
  keywords: jsonb('keywords').notNull(),
  establishment: varchar('establishment', { length: 255 }).notNull(),
  laboratoryId: varchar('laboratory_id', { length: 64 }).notNull(),
  supervisorId: varchar('supervisor_id', { length: 64 }).notNull(),
  slotsTotal: integer('slots_total').default(1).notNull(),
  slotsTaken: integer('slots_taken').default(0).notNull(),
  status: varchar('status', { length: 64 }).notNull(),
  structureFeedback: text('structure_feedback'),
  academicYearId: varchar('academic_year_id', { length: 64 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 10. Document Types Catalog
export const documentTypes = pgTable('document_types', {
  code: varchar('code', { length: 64 }).primaryKey(),
  label: text('label').notNull(),
  isRequired: boolean('is_required').default(true).notNull(),
  maxSizeBytes: integer('max_size_bytes').default(10485760).notNull(), // 10MB
  allowedMimeTypes: jsonb('allowed_mime_types').notNull(),
});

// 11. Application Documents
export const applicationDocuments = pgTable('application_documents', {
  id: varchar('id', { length: 64 }).primaryKey(),
  candidateId: varchar('candidate_id', { length: 64 }).notNull(),
  applicationId: varchar('application_id', { length: 64 }),
  typeCode: varchar('type_code', { length: 64 }).notNull(),
  title: text('title').notNull(),
  fileName: text('file_name').notNull(),
  fileSize: varchar('file_size', { length: 32 }).notNull(),
  fileMimeType: varchar('file_mime_type', { length: 128 }).notNull(),
  dataUrl: text('data_url'),
  status: varchar('status', { length: 64 }).notNull(),
  rejectionReason: text('rejection_reason'),
  correctionNotes: text('correction_notes'),
  captureMethod: varchar('capture_method', { length: 32 }).default('upload').notNull(),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 12. Document Reviews (Validation history with reviewer & motif)
export const documentReviews = pgTable('document_reviews', {
  id: varchar('id', { length: 64 }).primaryKey(),
  documentId: varchar('document_id', { length: 64 }).notNull(),
  reviewerId: varchar('reviewer_id', { length: 64 }).notNull(),
  reviewerName: text('reviewer_name').notNull(),
  previousStatus: varchar('previous_status', { length: 64 }).notNull(),
  newStatus: varchar('new_status', { length: 64 }).notNull(),
  reason: text('reason'),
  reviewedAt: timestamp('reviewed_at').defaultNow().notNull(),
});

// 13. Applications
export const applications = pgTable('applications', {
  id: varchar('id', { length: 64 }).primaryKey(),
  candidateId: varchar('candidate_id', { length: 64 }).notNull(),
  candidateName: text('candidate_name').notNull(),
  candidateEmail: varchar('candidate_email', { length: 255 }).notNull(),
  candidateCin: varchar('candidate_cin', { length: 32 }).notNull(),
  candidatePhone: varchar('candidate_phone', { length: 32 }),
  etablissementOrigine: text('etablissement_origine').notNull(),
  diplomeOrigine: text('diplome_origine').notNull(),
  topicId: varchar('topic_id', { length: 64 }).notNull(),
  topicTitle: text('topic_title').notNull(),
  establishment: varchar('establishment', { length: 255 }).notNull(),
  laboratory: varchar('laboratory', { length: 255 }).notNull(),
  supervisorId: varchar('supervisor_id', { length: 64 }).notNull(),
  supervisorName: text('supervisor_name').notNull(),
  step: integer('step').default(1).notNull(),
  status: varchar('status', { length: 64 }).notNull(),
  notes: text('notes'),
  motivationLetter: text('motivation_letter'),
  supervisorGrade: varchar('supervisor_grade', { length: 32 }),
  supervisorFeedback: text('supervisor_feedback'),
  structureFeedback: text('structure_feedback'),
  commissionNotes: text('commission_notes'),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 14. Application Decisions (Formal audit trail of supervisor & director decisions)
export const applicationDecisions = pgTable('application_decisions', {
  id: varchar('id', { length: 64 }).primaryKey(),
  applicationId: varchar('application_id', { length: 64 }).notNull(),
  decisionType: varchar('decision_type', { length: 64 }).notNull(),
  reviewerId: varchar('reviewer_id', { length: 64 }).notNull(),
  reviewerRole: varchar('reviewer_role', { length: 64 }).notNull(),
  decision: varchar('decision', { length: 64 }).notNull(),
  feedback: text('feedback'),
  grade: varchar('grade', { length: 32 }),
  decidedAt: timestamp('decided_at').defaultNow().notNull(),
});

// 15. Enrollments (Inscriptions initiales validées)
export const enrollments = pgTable('enrollments', {
  id: varchar('id', { length: 64 }).primaryKey(),
  studentId: varchar('student_id', { length: 64 }).notNull(),
  academicYearId: varchar('academic_year_id', { length: 64 }).notNull(),
  validatedAt: timestamp('validated_at').defaultNow().notNull(),
});

// 16. ReEnrollments (Réinscriptions annuelles en thèse)
export const reEnrollments = pgTable('re_enrollments', {
  id: varchar('id', { length: 64 }).primaryKey(),
  studentId: varchar('student_id', { length: 64 }).notNull(),
  studentName: text('student_name').notNull(),
  studentEmail: varchar('student_email', { length: 255 }).notNull(),
  supervisorId: varchar('supervisor_id', { length: 64 }).notNull(),
  supervisorName: text('supervisor_name').notNull(),
  academicYearId: varchar('academic_year_id', { length: 64 }).notNull(),
  academicYearCode: varchar('academic_year_code', { length: 32 }).notNull(),
  yearNumber: integer('year_number').notNull(),
  thesisTitle: text('thesis_title').notNull(),
  establishment: varchar('establishment', { length: 255 }).notNull(),
  summary: text('summary').notNull(),
  publicationsCount: integer('publications_count').default(0).notNull(),
  communicationsCount: integer('communications_count').default(0).notNull(),
  progressPercentage: integer('progress_percentage').default(0).notNull(),
  reportFileName: text('report_file_name'),
  reportDataUrl: text('report_data_url'),
  supervisorFeedback: text('supervisor_feedback'),
  status: varchar('status', { length: 64 }).notNull(),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 17. Notifications
export const notifications = pgTable('notifications', {
  id: varchar('id', { length: 64 }).primaryKey(),
  userId: varchar('user_id', { length: 64 }).notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: varchar('type', { length: 32 }).default('INFO').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  link: text('link'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 18. Audit Logs
export const auditLogs = pgTable('audit_logs', {
  id: varchar('id', { length: 64 }).primaryKey(),
  userId: varchar('user_id', { length: 64 }),
  userEmail: varchar('user_email', { length: 255 }).notNull(),
  userRole: varchar('user_role', { length: 64 }).notNull(),
  action: varchar('action', { length: 128 }).notNull(),
  entityType: varchar('entity_type', { length: 64 }).notNull(),
  entityId: varchar('entity_id', { length: 64 }),
  details: jsonb('details'),
  ipAddress: varchar('ip_address', { length: 64 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  candidate: one(candidates, {
    fields: [users.id],
    references: [candidates.userId],
  }),
  supervisor: one(supervisors, {
    fields: [users.id],
    references: [supervisors.userId],
  }),
  doctoralStudent: one(doctoralStudents, {
    fields: [users.id],
    references: [doctoralStudents.userId],
  }),
  notifications: many(notifications),
}));

export const researchTopicsRelations = relations(researchTopics, ({ one, many }) => ({
  supervisor: one(supervisors, {
    fields: [researchTopics.supervisorId],
    references: [supervisors.id],
  }),
  structure: one(researchStructures, {
    fields: [researchTopics.laboratoryId],
    references: [researchStructures.id],
  }),
  academicYear: one(academicYears, {
    fields: [researchTopics.academicYearId],
    references: [academicYears.id],
  }),
  applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({ one, many }) => ({
  candidate: one(candidates, {
    fields: [applications.candidateId],
    references: [candidates.id],
  }),
  topic: one(researchTopics, {
    fields: [applications.topicId],
    references: [researchTopics.id],
  }),
  documents: many(applicationDocuments),
  decisions: many(applicationDecisions),
}));
