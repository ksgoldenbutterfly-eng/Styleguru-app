import { Link } from 'react-router-dom';
import { Sparkles, Wand2, Camera, MessageSquare, Shield, Zap, Heart } from 'lucide-react';

const features = [
  { icon: Wand2, title: 'AI Outfit Generation', desc: 'Get personalized outfit recommendations based on your wardrobe, occasion, and style preferences.' },
  { icon: Camera, title: 'Outfit Analysis', desc: 'Upload any outfit photo and receive detailed AI-powered feedback and improvement suggestions.' },
  { icon: MessageSquare, title: 'AI Fashion Chatbot', desc: 'Chat with StyleGuru for instant fashion advice, styling tips, and wardrobe guidance.' },
  { icon: Shield, title: 'Inclusive & Accessible', desc: 'Fully accessible design with support for diverse needs, body types, and cultural fashion preferences.' },
  { icon: Zap, title: 'Smart Wardrobe', desc: 'Organize your digital wardrobe and get outfit ideas from clothes you already own.' },
  { icon: Heart, title: 'Save Favorites', desc: 'Bookmark your favorite outfit combinations for quick access anytime.' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur border-b border-gray-100 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-gray-900">StyleGuru</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Sign in</Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-purple-50 py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            AI-Powered Fashion Assistant
          </div>
          <h1 className="text-5xl sm:text-6xl font-display font-bold text-gray-900 mb-6 leading-tight">
            Your Personal{' '}
            <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              Style Guru
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Discover perfect outfits, manage your wardrobe digitally, and get AI-powered fashion recommendations tailored to your style, occasions, and preferences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary text-base py-3 px-8">
              Start Styling Free
            </Link>
            <Link to="/login" className="btn-secondary text-base py-3 px-8">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
              Everything You Need for Your Style Journey
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              StyleGuru combines AI technology with fashion expertise to help you look and feel your best.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all duration-200">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary-600" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fashion Types */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">For Every Style & Occasion</h2>
          <p className="text-gray-600 mb-8">Indian wear, Western wear, Indo-Western, Casual, Formal, Traditional — StyleGuru supports them all.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['College', 'Office', 'Parties', 'Weddings', 'Festivals', 'Casual', 'Interviews'].map(tag => (
              <span key={tag} className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-gradient-to-r from-primary-600 to-purple-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-display font-bold text-white mb-4">Ready to Transform Your Style?</h2>
          <p className="text-primary-100 mb-8">Join thousands of users who've discovered their personal style with StyleGuru.</p>
          <Link to="/register" className="inline-flex items-center gap-2 px-8 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-colors">
            <Sparkles className="w-5 h-5" />
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 text-center">
        <p className="text-gray-400 text-sm">© 2024 StyleGuru. AI-Powered Fashion Assistant. All rights reserved.</p>
      </footer>
    </div>
  );
}

