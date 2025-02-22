import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();

// Helper function to check if today is Saturday or Sunday
const isWeekend = (): boolean => {
    const today = new Date().getDay(); // 0 = Sunday, 6 = Saturday
    return today === 0 || today === 6;
};

// Function to check records and send notifications
const checkRecordsAndNotify = async (): Promise<void> => {
    if (isWeekend()) {
        console.log('Skipping notification (Weekend)');
        return;
    }

    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const usersSnapshot = await db.collection('users').get();
    const usersToNotify: string[] = [];

    for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const recordsSnapshot = await db
            .collection('records')
            .where('userId', '==', userId)
            .where('date', '==', today)
            .get();

        if (recordsSnapshot.empty) {
            const fcmToken = userDoc.data().fcmToken;
            if (fcmToken) usersToNotify.push(fcmToken);
        }
    }

    if (usersToNotify.length > 0) {
        await sendReminderNotification(usersToNotify);
    }
};

// Function to send push notifications
// Function to send push notifications
const sendReminderNotification = async (tokens: string[]): Promise<void> => {
    const message = {
        notification: {
            title: 'Reminder: Add Your Daily Activity!',
            body: "Don't forget to add your daily activity before the day ends.",
        },
    };

    try {
        const responses = await Promise.all(
            tokens.map((token) => messaging.send({ ...message, token }))
        );

        console.log(`Successfully sent ${responses.length} notifications!`);
    } catch (error) {
        console.error('Error sending notifications:', error);
    }
};

export const scheduledNotification = functions.pubsub
    //@ts-ignore
    .schedule('every day 17:00')
    .timeZone('Asia/Karachi') // Adjust to your timezone
    .onRun(async () => {
        await checkRecordsAndNotify();
    });
