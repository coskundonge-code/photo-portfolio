# Photography Portfolio & Print Shop

A professional photography portfolio website with an integrated print shop, inspired by Levon Biss and States Gallery.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)

## ✨ Features

- **Stunning Gallery** - Masonry grid layout for showcasing your work
- **Project Organization** - Group photos into meaningful collections
- **Print Shop** - Sell your photos with customizable options
- **Admin Panel** - Easy management of photos, projects, and products
- **Responsive Design** - Looks great on all devices
- **Dark Theme** - Elegant, photography-focused aesthetic

## 🚀 Quick Start

1. Clone this repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.local.example`)
4. Run development server: `npm run dev`

For detailed setup instructions, see [KURULUM-REHBERI.md](./KURULUM-REHBERI.md)

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Deployment**: Vercel
- **State Management**: Zustand

## 📁 Project Structure

```
photo-portfolio/
├── app/
│   ├── admin/           # Admin panel pages
│   │   ├── photos/      # Photo management
│   │   ├── projects/    # Project management
│   │   └── products/    # Product/pricing management
│   ├── work/[project]/  # Individual project pages
│   ├── shop/[id]/       # Product detail pages
│   ├── about/           # About page
│   ├── contact/         # Contact page
│   └── page.tsx         # Homepage
├── components/          # Reusable UI components
├── lib/                 # Utilities and Supabase client
└── public/              # Static assets
```

## ⚙️ Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ADMIN_PASSWORD=your-admin-password
NEXT_PUBLIC_SITE_NAME=Your Portfolio
```

## 🎨 Customization

### Colors

Edit `tailwind.config.js` to change the color scheme:

```javascript
colors: {
  accent: {
    DEFAULT: '#C9A962', // Gold accent color
  }
}
```

### Typography

The site uses:
- **Display**: Playfair Display
- **Body**: DM Sans
- **Mono**: JetBrains Mono

## 📄 License

MIT License - feel free to use for your own portfolio!

## 🙏 Credits

Design inspired by:
- [Levon Biss](https://www.levonbiss.com)
- [States Gallery](https://www.states-gallery.com)
- [Mathijs Hanenkamp](https://mathijshanenkamp.com)
