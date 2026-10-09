import FeatureHero from '@/components/ui/FeatureHero';
import AlternatingSection from '@/components/ui/AlternatingSection';
import CapabilityGrid from '@/components/ui/CapabilityGrid';
import WorkflowSteps from '@/components/ui/WorkflowSteps';
import WorksBestWithGrid from '@/components/ui/WorksBestWithGrid';
import SectionCTA from '@/components/ui/SectionCTA';
import FeatureNav from '@/components/FeatureNav/FeatureNav';

const sections = [
  {
    title: 'Data Isolation',
    description: "Multi-tenant architecture ensures each clinic's data is completely separated at the database level.",
    bullets: ['Multi-tenant architecture', 'Database-level separation', 'No cross-tenant access'],
    screenshot: 'Data Isolation screenshot',
    browserPath: '/security/data-isolation',
    reversed: false,
  },
  {
    title: 'Authentication',
    description: 'Secure login with Argon2 password hashing, session management, and forced re-authentication after timeout.',
    bullets: ['Argon2 password hashing', 'Session management', 'Timeout re-authentication'],
    screenshot: 'Authentication screenshot',
    browserPath: '/security/authentication',
    reversed: true,
  },
  {
    title: 'Access Control',
    description: 'Role-based permissions mean every staff member sees only what their role requires.',
    bullets: ['Role-based permissions', 'Least-privilege access', 'Per-module visibility'],
    screenshot: 'Access Control screenshot',
    browserPath: '/security/access-control',
    reversed: false,
  },
];

const capabilities = [
  { icon: '🏢', title: 'Tenant-Level Data Isolation', description: "Every clinic's data is fully separated at the database level" },
  { icon: '🔑', title: 'Argon2 Password Hashing', description: 'Industry-standard password hashing' },
  { icon: '⏱️', title: 'Session Timeout Controls', description: 'Automatic logout after periods of inactivity' },
  { icon: '🛡️', title: 'Role-Based Access Control', description: 'Every user sees only what their role permits' },
  { icon: '📋', title: 'Audit Trail Logs', description: 'Full logs of every sensitive action taken' },
  { icon: '🔒', title: 'Encrypted Data at Rest & In Transit', description: 'Data is encrypted everywhere it lives and moves' },
];

const steps = [
  { number: 1, title: 'Log In', description: 'A dentist logs in to their account' },
  { number: 2, title: 'Scoped View', description: "Sees only their assigned clinic's patients" },
  { number: 3, title: 'Restricted Access', description: 'Cannot view financial reports, restricted' },
  { number: 4, title: 'Session Expires', description: 'Session automatically expires after' },
];

const relatedFeatures = [
  { icon: '🏥', title: 'Multi-Clinic Management', description: 'Reports roll up across every clinic location', href: '/product/features/multi-clinic-management' },
  { icon: '👥', title: 'Staff Management', description: "Calendars respect each dentist's role and access", href: '/product/features/staff-management' },
  { icon: '👤', title: 'Patient Management', description: 'Every plan attaches to the patient record', href: '/product/features/patient-management' },
];

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-white">
      <FeatureHero
        breadcrumb={[
          { label: 'Product', href: '/product' },
          { label: 'Features', href: '/product/features' },
          { label: 'Security' },
        ]}
        activeTab="/product/features/security"
        title="Patient Data That Stays Exactly Where It Should"
        description="A platform designed from the ground up to protect sensitive clinical and personal data across every clinic and every user."
        screenshotLabel="Security screenshot"
        screenshotImage="/images/security.png"
        browserPath='/security'
        
      />
      <AlternatingSection sections={sections} />
      <CapabilityGrid heading="What Security Lets You Do" items={capabilities} />
      <WorkflowSteps steps={steps} />
      <WorksBestWithGrid items={relatedFeatures} />
      <SectionCTA title="See Security in Your Clinic" />
      <FeatureNav />
    </main>
  );
}
