# Abiah.help - AI Startup Mentorship Platform

The world's first AI startup mentor platform that helps founders get funded through face-to-face video consultations and intelligent document generation.

## 🚀 Features

### Core Platform
- **AI Video Consultations** - Real-time mentorship with industry-specific AI experts
- **Document Generation** - Automated creation of pitch decks, business plans, and financial projections
- **Authentication System** - Secure user management with social login options
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices

### Video Consultation System
- Multi-screen consultation flow (Intro → Loading → Settings → Conversation → Summary)
- Tavus CVI integration for conversational video intelligence
- Real-time video/audio controls
- Session timer and management
- Secure API proxying through Supabase Edge Functions

### User Experience
- Personalized welcome videos using Tavus API
- Professional design system with brand colors
- Smooth animations and micro-interactions
- Accessibility compliance (WCAG 2.1 AA)
- Loading states and error handling

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Jotai for atomic state management
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **Video**: Tavus API + Daily.co WebRTC
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **Animations**: Framer Motion
- **Notifications**: Sonner

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/abiah-help-frontend.git
   cd abiah-help-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your environment variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   TAVUS_API_KEY=your_tavus_api_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 🏗 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/              # Base UI components (Button, Input, Card, etc.)
│   ├── auth/            # Authentication components
│   ├── hero/            # Hero section components
│   ├── video/           # Video consultation components
│   └── layout/          # Layout components (Header, Footer)
├── pages/               # Route components
├── store/               # Jotai state atoms
├── hooks/               # Custom React hooks
├── api/                 # API integration layer
├── lib/                 # Library configurations
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Set up authentication providers (Google, LinkedIn)
3. Deploy the Tavus API Edge Function
4. Configure environment variables

### Tavus Integration
1. Sign up for Tavus API access
2. Create AI personas for different mentor types
3. Configure the Edge Function with your API key
4. Test video conversation creation

## 🎨 Design System

### Brand Colors
- **Primary**: #2A2F6D (Professional blue)
- **Secondary**: #F9B94E (Warm gold)
- **Neutral**: #5B5F77 (Supporting gray)
- **Success**: #10B981
- **Warning**: #F59E0B
- **Error**: #EF4444

### Typography
- **Font Family**: Inter
- **Headings**: 600-700 weight
- **Body**: 400-500 weight

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
vercel --prod
```

### Deploy to Netlify
```bash
netlify deploy --prod --dir=dist
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Run linting
npm run lint
```

## 📱 Features Roadmap

### Completed ✅
- [x] Authentication & User Management
- [x] Hero Section with Tavus Video Welcome
- [x] AI Video Consultation Platform
- [x] Responsive Design & Accessibility
- [x] Loading States & Error Handling

### In Progress 🚧
- [ ] Document Generation Engine
- [ ] User Dashboard & Analytics
- [ ] Onboarding Flow

### Planned 📋
- [ ] Real-time Collaboration
- [ ] Mobile App (React Native)
- [ ] Advanced Analytics
- [ ] Team Features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.abiah.help](https://docs.abiah.help)
- **Email**: support@abiah.help
- **Discord**: [Join our community](https://discord.gg/abiah-help)

## 🙏 Acknowledgments

- [Tavus](https://tavus.io) for conversational video intelligence
- [Supabase](https://supabase.com) for backend infrastructure
- [Daily.co](https://daily.co) for WebRTC video streaming
- The open-source community for amazing tools and libraries

---

Built with ❤️ for startup founders worldwide