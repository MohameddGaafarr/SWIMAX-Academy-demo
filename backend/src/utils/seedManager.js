import User from "../models/User.js";

const DEFAULT_USERNAME = "admin";
const DEFAULT_PASSWORD = "admin123";

export async function seedDefaultManager() {
  const existing = await User.findOne({ username: DEFAULT_USERNAME }).lean();
  if (existing) return;

  await User.create({
    username: DEFAULT_USERNAME,
    password: DEFAULT_PASSWORD,
  });
  console.log(`Seeded default manager user "${DEFAULT_USERNAME}"`);
}
