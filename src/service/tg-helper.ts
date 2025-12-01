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
