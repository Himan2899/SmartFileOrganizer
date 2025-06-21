# Smart File Organizer

Intelligently organize your files with AI-powered classification and advanced sorting.

---

## 🚀 Introduction

**Smart File Organizer** is a modern web application that helps you organize, classify, and analyze your files with the power of AI. Effortlessly upload, sort, and preview files, detect duplicates, and leverage OpenAI's advanced models to automatically categorize documents and images. Highly customizable, with analytics dashboards and robust troubleshooting tools.

---

## ✨ Features

- **Drag & Drop File Upload**: Upload multiple files of any type with a modern drag-and-drop interface.
- **AI-Powered Classification**:
  - Uses OpenAI (GPT-4o) to classify documents (e.g., resume, invoice, contract, report, presentation, assignment, receipt, certificate, manual, form) and images (e.g., screenshot, photo, diagram, chart, document-scan, receipt, id-card, certificate, artwork, meme, social-media).
  - Provides confidence scores, subcategories, reasoning, and suggested folders.
  - Extracts and previews document content and metadata (word count, page count, language).
- **Advanced File Organization**:
  - Organize by file type, size (small/medium/large), and date (year/month).
  - Detect and mark duplicate files using hash comparison.
  - Ignore specific file types/extensions.
  - Create custom rules (by extension, name, or size) to route files to specific folders.
  - Undo last organization step.
- **Folder & AI Views**:
  - Browse organized files in a folder tree.
  - View AI-classified files grouped by category, with confidence and reasoning.
  - Preview files (with metadata, AI tags, and download option).
- **Dashboard & Analytics**:
  - Visualize file stats: total files, storage used, duplicates, categories, AI-classified files.
  - Charts for file type distribution, category breakdown, and AI classification results.
  - Track average AI confidence and detailed file analysis.
- **Settings & Customization**:
  - Toggle organization rules (by type, size, date, duplicates, AI).
  - Manage ignored file types and custom rules.
  - All preferences saved to local storage.
- **Download as ZIP**: Download your organized files as a ZIP archive.
- **Theme Support**: Light/dark mode toggle.
- **Debug Panel**:
  - Test OpenAI API key and AI classification.
  - View troubleshooting steps and environment checks.
- **Responsive UI**: Works great on desktop and mobile.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Next.js 14, TypeScript
- **UI/UX**: Tailwind CSS, Framer Motion, Radix UI, Lucide Icons
- **State & Forms**: React Hook Form, useState, useEffect
- **AI Integration**: OpenAI API (GPT-4o, GPT-4o-mini)
- **File Handling**: JSZip, react-dropzone
- **Charts & Analytics**: Recharts
- **Other Libraries**: clsx, class-variance-authority, zod, date-fns, embla-carousel-react, sonner, vaul
- **Styling**: Tailwind CSS, PostCSS

---

## ⚡ Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd smart-file-organizer
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```
3. **Set up environment variables:**
   - Create a `.env.local` file in the root directory.
   - Add your OpenAI API key:
     ```env
     OPENAI_API_KEY=your_openai_api_key_here
     ```
4. **Run the development server:**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```
5. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

---

## 🧠 AI Classification

- **Supported Document Categories:** resume, invoice, contract, report, presentation, assignment, receipt, certificate, manual, form
- **Supported Image Categories:** screenshot, photo, diagram, chart, document-scan, receipt, id-card, certificate, artwork, meme, social-media
- **How it works:**
  - Files are sent to the `/api/classify` endpoint, which uses OpenAI's GPT-4o models to analyze and classify content.
  - Results include category, confidence, subcategory, suggested folder, and reasoning.
  - For documents, the first 1000 characters are extracted for preview and metadata (word count, page count, language) is calculated.
  - For images, base64 encoding is used and the Vision API is called.
- **Enable/Disable AI:**
  - Toggle "AI Classification" in Settings.
  - Requires a valid OpenAI API key.

---

## 📊 Dashboard & Analytics

- **Overview Cards:** Total files, storage used, duplicates, categories, AI-classified files
- **Charts:**
  - File type distribution (pie chart)
  - Category distribution (bar chart)
  - AI classification results (bar chart)
- **Detailed Analysis:**
  - File type breakdown with percentages
  - AI confidence levels (low/medium/high)

---

## ⚙️ Configuration & Customization

- **Organization Rules:**
  - Organize by file type, size, date
  - Detect duplicates
  - Enable/disable AI classification
- **Ignored File Types:**
  - Add/remove extensions to skip during organization
- **Custom Rules:**
  - Create rules based on file extension, name, or size
  - Route files to specific folders
- **All settings are saved locally and persist across sessions.**

---

## 🐞 Troubleshooting & Debugging

- **Debug Panel:**
  - Test your OpenAI API key
  - Run a sample AI classification
  - View environment and troubleshooting steps
- **Common Issues:**
  - Ensure `OPENAI_API_KEY` is set in `.env.local`
  - Restart the dev server after changing environment variables
  - Check browser console and Debug Panel for errors

---

## 📦 Download & Export

- Download all organized files as a ZIP archive with one click.

---

## 🌓 Theming

- Toggle between light and dark mode using the theme switcher in the header.

---

## 📱 Responsive Design

- Fully responsive layout for desktop and mobile devices.

---

🤝 Contributing
Feel free to submit issues and enhancement requests!

🤝 Support If you find this project helpful, please give it a ⭐️ on GitHub!

📞 Contact For any queries or support, please reach out to us through:

Email: himanshuofficialuserid@gmail.com Developed with ❤️ by Himanshu Bali 💻👨‍💻🚀
