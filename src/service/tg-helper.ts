import UserModel from "../schemas/userSchema";

export function mainMenuKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "📚 Bloglar", callback_data: "MENU_BLOGS" },
          { text: "📘 Kitoblar", callback_data: "MENU_BOOKS" },
        ],
        [
          { text: "🔐 Login", callback_data: "MENU_LOGIN" },
          { text: "⚙️ Sozlamalar", callback_data: "MENU_SETTINGS" },
        ],
      ],
    },
  };
}


export async function listAllUsers(adminId: string, bot: any) {
  try {
    const users = await UserModel.find({}, { telegramId: 1 });
    
    if (users.length === 0) {
      await bot.telegram.sendMessage(adminId, "Userlar topilmadi.");
      return;
    }

    // Make a readable list
    const userList = users.map((u, i) => `${i + 1}. ${u.telegramId}`).join("\n");

    await bot.telegram.sendMessage(adminId, `Barcha foydalanuvchilar:\n${userList}`);
  } catch (err) {
    console.log("list users error:", err);
    await bot.telegram.sendMessage(adminId, "Xatolik yuz berdi, console-ni tekshiring.");
  }
}