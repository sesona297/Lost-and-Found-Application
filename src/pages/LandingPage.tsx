import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import {
  GraduationCap, Search, PackagePlus, ClipboardCheck, Package,
  ArrowRight, MapPin, Shield, Eye, HandHeart,
} from 'lucide-react';

export default function LandingPage() {
  const { user, isAdmin } = useAuth();

  const dashboardLink = user ? (isAdmin ? '/admin/dashboard' : '/dashboard') : '/login';

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Nav bar */}
      <nav className="sticky top-0 z-30 border-b" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="font-bold text-base">Uni Lost & Found</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/find-items">
              <Button variant="ghost" size="sm">Browse Items</Button>
            </Link>
            {user ? (
              <Link to={dashboardLink}>
                <Button variant="primary" size="sm">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Log In</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-medium" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
            <MapPin className="h-3.5 w-3.5" />
            For CPUT students & staff
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight max-w-3xl mx-auto leading-tight">
            Lost something? Found something?<br />
            <span style={{ color: 'var(--color-primary)' }}>Help reunite it with its owner.</span>
          </h1>
          <p className="mt-5 text-base sm:text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-text-muted)' }}>
            Report lost or found items across all campuses, search for what's been turned in, and submit claims to get your belongings back.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/find-items">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                <Search className="h-5 w-5" />
                Find an Item
              </Button>
            </Link>
            <Link to={user ? (isAdmin ? '/admin/dashboard' : '/report-lost') : '/login'}>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <PackagePlus className="h-5 w-5" />
                Report an Item
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-20" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">How It Works</h2>
          <p className="text-center text-sm sm:text-base mb-12 max-w-xl mx-auto" style={{ color: 'var(--color-text-muted)' }}>
            Four simple steps from reporting to reuniting items with their owners.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <PackagePlus className="h-7 w-7" />, title: 'Report a Lost Item', desc: 'Lost something on campus? Create a report with a photo and details so others can help you find it.' },
              { icon: <Package className="h-7 w-7" />, title: 'Report a Found Item', desc: 'Found something that isn\'t yours? Report it so the owner can identify and claim it.' },
              { icon: <ClipboardCheck className="h-7 w-7" />, title: 'Claim & Verify', desc: 'Spot your item? Submit a claim with identifying details. Staff verify ownership before handover.' },
              { icon: <HandHeart className="h-7 w-7" />, title: 'Get It Returned', desc: 'Once approved, collect your item from the lost and found office. Simple and secure.' },
            ].map((step, i) => (
              <div key={i} className="card p-6 text-center">
                <div className="inline-flex p-3 rounded-xl mb-4" style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-primary)' }}>
                  {step.icon}
                </div>
                <div className="text-xs font-bold mb-1" style={{ color: 'var(--color-primary)' }}>STEP {i + 1}</div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features strip */}
      <section className="py-16" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Search className="h-6 w-6" />, title: 'Smart Search', desc: 'Search by keyword and filter by category, campus, type, and status.' },
              { icon: <Shield className="h-6 w-6" />, title: 'Verified Claims', desc: 'Staff review and verify every claim before items change hands.' },
              { icon: <Eye className="h-6 w-6" />, title: 'Campus-wide', desc: 'Items from Bellville, District Six, Mowbray, and Wellington campuses.' },
            ].map((feat, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="flex-shrink-0 p-2.5 rounded-lg" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
                  {feat.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">{feat.title}</h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to get started?</h2>
          <p className="text-sm sm:text-base mb-6" style={{ color: 'var(--color-text-muted)' }}>
            Register with your student email and start reporting or searching for items today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                Create an Account
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/staff-login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Staff Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">Uni Lost & Found</span>
          </div>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            University Lost and Found System — Group Project 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
