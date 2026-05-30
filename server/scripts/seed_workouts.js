const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin (Using credentials as in server/index.js)
const serviceAccountPath = path.resolve(__dirname, '..', '..', 'fitfuel-ml-service', 'serviceAccountKey.json');

if (!admin.apps.length) {
    if (fs.existsSync(serviceAccountPath)) {
        const cert = require(serviceAccountPath);
        admin.initializeApp({
            credential: admin.credential.cert(cert)
        });
        console.log('Firebase Admin initialized from serviceAccountKey.json');
    } else {
        console.error('ERROR: No Firebase credentials found at', serviceAccountPath);
        process.exit(1);
    }
}

const db = admin.firestore();

async function seedWorkouts() {
    const workoutDataPath = path.resolve(__dirname, '..', '..', 'client', 'src', 'data', 'workout_data.json');
    if (!fs.existsSync(workoutDataPath)) {
        console.error('ERROR: workout_data.json not found at', workoutDataPath);
        process.exit(1);
    }

    const workoutData = JSON.parse(fs.readFileSync(workoutDataPath, 'utf8'));
    console.log(`Found ${workoutData.length} templates. Seeding...`);

    const batch = db.batch();
    const templatesRef = db.collection('workout_templates');

    for (const template of workoutData) {
        const docRef = templatesRef.doc(template.template_id);
        batch.set(docRef, template);
    }

    await batch.commit();
    console.log('✅ Successfully seeded workout_templates collection!');
}

seedWorkouts().catch(err => {
    console.error('Error seeding workouts:', err);
    process.exit(1);
});
