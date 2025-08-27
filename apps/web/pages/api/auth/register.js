import admin from 'functions/admin';
import bcrypt from 'bcrypt';

const register = async (req, res) => {
  const { name, email, password } = req?.body?.data;
  const db = admin.firestore();

  try {
    const docRef = await db.collection('users').add({
      name,
      email,
      password: bcrypt.hashSync(password, 10),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('Document successfully written!', docRef.id);
    return res.status(200).json({ email, password });
  } catch (error) {
    console.error('Error writing document: ', error);
    return res.status(500).json({ error: error.message });
  }
};

export default register;
