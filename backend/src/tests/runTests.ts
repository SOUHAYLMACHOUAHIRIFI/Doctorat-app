import assert from 'assert';
import { authService } from '../services/authService';
import { topicService } from '../services/topicService';
import { applicationService } from '../services/applicationService';
import { documentService } from '../services/documentService';
import { reEnrollmentService } from '../services/reEnrollmentService';
import { auditService } from '../services/auditService';
import { notificationService } from '../services/notificationService';
import { userRepository } from '../repositories/userRepository';
import { db } from '../repositories/database';
import { ROLES, DOCUMENT_STATUS } from '../config/constants';

let testCount = 0;
let passCount = 0;

function runTest(name: string, fn: () => void | Promise<void>) {
  testCount++;
  try {
    const res = fn();
    if (res instanceof Promise) {
      return res.then(() => {
        passCount++;
        console.log(`  ✓ ${name}`);
      }).catch((err) => {
        console.error(`  ✗ ${name}:`, err.message);
      });
    }
    passCount++;
    console.log(`  ✓ ${name}`);
  } catch (err: any) {
    console.error(`  ✗ ${name}:`, err.message);
  }
}

async function startSuite() {
  console.log('\n======================================================');
  console.log('🧪 SUITE DE TESTS COMPLÈTE — GCD USMBA (RBAC, Sécurité, Workflows)');
  console.log('======================================================\n');

  // Test 1: Inscription candidat avec email académique valide
  await runTest('1. Inscription : Création réussie avec email @usmba.ac.ma', async () => {
    const testEmail = `test.cand.${Date.now()}@usmba.ac.ma`;
    const result = await authService.registerCandidate({
      email: testEmail,
      firstName: 'Omar',
      lastName: 'Bennani',
      phone: '+212 6 00 11 22 33',
      cin: `CD${Math.floor(100000 + Math.random() * 900000)}`,
      password: 'PasswordTest2026',
      etablissementOrigine: 'FST Fès',
      diplomeOrigine: 'Master Recherche',
    });
    assert(result.user, 'L’utilisateur doit être retourné');
    assert.strictEqual(result.user.role, ROLES.CANDIDATE, 'Le rôle doit être CANDIDATE');
    assert(result.token, 'Un JWT token sécurisé doit être émis');
  });

  // Test 2: Inscription candidat rejetée si email non institutionnel
  await runTest('2. Inscription : Rejet des adresses non institutionnelles', async () => {
    let failed = false;
    try {
      await authService.registerCandidate({
        email: 'hacker@gmail.com',
        firstName: 'Hacker',
        lastName: 'Test',
        phone: '+212 6 00 00 00 00',
        cin: 'AA112233',
        password: 'Password123',
        etablissementOrigine: 'Autre',
        diplomeOrigine: 'Master',
      });
    } catch {
      failed = true;
    }
    assert(failed, 'L’inscription doit être bloquée pour un email hors @usmba.ac.ma');
  });

  // Test 3: Connexion réussie et hachage sécurisé
  await runTest('3. Authentification : Connexion avec mot de passe valide', async () => {
    const res = await authService.login('youssef.elamrani@usmba.ac.ma', 'usmba2026');
    assert(res.user, 'Utilisateur connecté');
    assert.strictEqual(res.user.email, 'youssef.elamrani@usmba.ac.ma');
    assert(res.token, 'Token de session présent');
  });

  // Test 4: Connexion refusée avec mauvais mot de passe
  await runTest('4. Authentification : Rejet d’un mauvais mot de passe', async () => {
    let rejected = false;
    try {
      await authService.login('youssef.elamrani@usmba.ac.ma', 'wrongPassword123');
    } catch {
      rejected = true;
    }
    assert(rejected, 'L’authentification doit échouer en cas d’identifiant incorrect');
  });

  // Test 5: Isolation stricte des directeurs de thèse (Superviseur A ne voit pas les candidatures de Superviseur B)
  await runTest('5. Isolation RBAC : Un directeur ne peut consulter que les candidatures de ses sujets', async () => {
    const profKarim = userRepository.findByEmail('karim.bennani@usmba.ac.ma')!;
    const profFatima = userRepository.findByEmail('fatima.chami@usmba.ac.ma')!;

    const safeKarim = userRepository.toSafeUser(profKarim);
    const safeFatima = userRepository.toSafeUser(profFatima);

    const karimApps = applicationService.getApplications(safeKarim);
    const fatimaApps = applicationService.getApplications(safeFatima);

    // Toutes les candidatures de Karim doivent lui appartenir
    for (const app of karimApps) {
      assert(
        app.supervisorName.toLowerCase().includes('karim') || app.supervisorId.includes('karim'),
        'Une candidature de Karim ne doit pas appartenir à un autre directeur'
      );
    }

    // Si Karim tente d'accéder directement à un ID d'une candidature de Fatima -> Rejet 403
    if (fatimaApps.length > 0) {
      let blocked = false;
      try {
        applicationService.getApplicationById(safeKarim, fatimaApps[0].id);
      } catch {
        blocked = true;
      }
      assert(blocked, 'Accès interdit lors de la consultation d’un dossier hors périmètre superviseur');
    }
  });

  // Test 6: Isolation stricte des candidats (Candidat A ne peut pas consulter le dossier de Candidat B)
  await runTest('6. Isolation RBAC : Un candidat ne peut pas consulter le dossier d’un autre candidat', async () => {
    const youssef = userRepository.findByEmail('youssef.elamrani@usmba.ac.ma')!;
    const salma = userRepository.findByEmail('salma.berrada@usmba.ac.ma')!;

    const safeYoussef = userRepository.toSafeUser(youssef);
    const safeSalma = userRepository.toSafeUser(salma);

    const youssefApps = applicationService.getApplications(safeYoussef);
    for (const a of youssefApps) {
      assert.strictEqual(a.candidateEmail, youssef.email, 'Youssef ne doit voir que ses propres candidatures');
    }

    if (youssefApps.length > 0) {
      let blocked = false;
      try {
        applicationService.getApplicationById(safeSalma, youssefApps[0].id);
      } catch {
        blocked = true;
      }
      assert(blocked, 'Salma ne doit pas pouvoir ouvrir la candidature de Youssef');
    }
  });

  // Test 7: Création de sujet de thèse par un superviseur
  await runTest('7. Sujets : Création par un directeur de thèse habilité', async () => {
    const profKarim = userRepository.findByEmail('karim.bennani@usmba.ac.ma')!;
    const safeKarim = userRepository.toSafeUser(profKarim);

    const newTopic = topicService.createTopic(safeKarim, {
      title: 'Modélisation IA des écoulements fluides dans le Saïss',
      summary: 'Étude hydrodynamique par réseaux de neurones informés par la physique (PINN).',
      keywords: ['PINN', 'Hydrodynamique', 'IA'],
      establishment: 'FST Fès',
      laboratoryId: 'struct-lisac',
      slotsTotal: 2,
    });

    assert(newTopic.id, 'Le sujet créé doit posséder un identifiant');
    assert.strictEqual(newTopic.status, 'EN_EXAMEN_STRUCTURE', 'Le statut initial doit être soumis à examen structure');
  });

  // Test 8: Gestion documentaire — Rejet avec motif obligatoire
  await runTest('8. Gestion documentaire : Rejet d’un document nécessite un motif d’au moins 5 caractères', async () => {
    const profKarim = userRepository.findByEmail('karim.bennani@usmba.ac.ma')!;
    const safeKarim = userRepository.toSafeUser(profKarim);

    // Create a mock doc to test review
    const youssef = userRepository.findByEmail('youssef.elamrani@usmba.ac.ma')!;
    const doc = documentService.uploadDocument(userRepository.toSafeUser(youssef), {
      typeCode: 'baccalaureat',
      fileName: 'bac_test.pdf',
      fileSize: '1.2 Mo',
      fileMimeType: 'application/pdf',
      dataUrl: 'data:application/pdf;base64,JVBERi0xLjc...',
    });

    // Rejection without reason must fail
    let failedWithoutReason = false;
    try {
      documentService.reviewDocument(safeKarim, doc.id, DOCUMENT_STATUS.REJETE, '');
    } catch {
      failedWithoutReason = true;
    }
    assert(failedWithoutReason, 'Le rejet sans motif doit être strictement interdit');

    // Rejection with valid reason
    const rejectedDoc = documentService.reviewDocument(
      safeKarim,
      doc.id,
      DOCUMENT_STATUS.REJETE,
      'Scan illisible, veuillez fournir une copie couleur haute résolution.'
    );
    assert.strictEqual(rejectedDoc.status, DOCUMENT_STATUS.REJETE);
    assert(rejectedDoc.rejectionReason, 'Le motif doit être persisté dans le document');
  });

  // Test 9: Réinscription doctorale
  await runTest('9. Réinscription : Dépôt de demande annuelle avec rapport d’activité', async () => {
    const anass = userRepository.findByEmail('anass.tazi@usmba.ac.ma')!;
    const safeAnass = userRepository.toSafeUser(anass);

    const re = reEnrollmentService.submitReEnrollment(safeAnass, {
      yearNumber: 3,
      summary: 'Préparation du manuscrit et soumission d’un brevet d’invention.',
      publicationsCount: 3,
      communicationsCount: 4,
      progressPercentage: 80,
    });

    assert(re.id, 'La réinscription doit être créée');
    assert.strictEqual(re.yearNumber, 3);
    assert.strictEqual(re.status, 'EN_ATTENTE_ENCADRANT');
  });

  // Test 10: Système d’Audit Log & Notifications
  await runTest('10. Audit & Traçabilité : Enregistrement de l’action et notification', async () => {
    const logs = auditService.getAll(5);
    assert(logs.length > 0, 'Les logs d’audit doivent être peuplés');

    const notifs = notificationService.getUserNotifications('usr-cand-youssef');
    assert(Array.isArray(notifs), 'Les notifications doivent être accessibles');
  });

  console.log('\n======================================================');
  console.log(`📊 RÉSULTAT : ${passCount} / ${testCount} tests réussis avec succès !`);
  console.log('======================================================\n');

  if (passCount !== testCount) {
    process.exit(1);
  }
}

startSuite();
