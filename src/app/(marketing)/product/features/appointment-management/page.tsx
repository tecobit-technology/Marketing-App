import FeatureHero from '@/components/ui/FeatureHero';
import AlternatingSection from '@/components/ui/AlternatingSection';
import CapabilityGrid from '@/components/ui/CapabilityGrid';
import WorkflowSteps from '@/components/ui/WorkflowSteps';
import WorksBestWithGrid from '@/components/ui/WorksBestWithGrid';
import SectionCTA from '@/components/ui/SectionCTA';
import FeatureNav from '@/components/FeatureNav/FeatureNav';

const sections = [
  {
    title: 'Appointment Booking',
    description: 'Create appointments with patient, dentist, treatment type, and notes — with conflict detection built in.',
    bullets: ['Conflict detection', 'Treatment type tagging', 'Note attachments'],
    image:"/images/appointments-booking.png",
    reversed: false,
  },
  {
    title: 'Calendar Workspace',
    description: 'Daily, weekly, and per-dentist views with drag-to-reschedule and color-coding by appointment type.',
    bullets: ['Daily & weekly views', 'Drag-to-reschedule', 'Color-coded by type'],
    image: "/images/calendar-workspace.png",
    reversed: true,
  },
  {
    title: 'Appointment Lifecycle',
    description: 'Track status from Scheduled through Checked In, In Chair, Completed, and Follow-up.',
    bullets: ['Full status tracking', 'Checked-in visibility', 'Follow-up scheduling'],
    image: "/images/appointment-lifecycle.png",
    reversed: false,
  },
];

const capabilities = [
  { icon: '👤', title: 'Walk-In Support', description: 'Fit walk-ins into the schedule without disrupting bookings' },
  { icon: '📋', title: 'Appointment Type Templates', description: 'Reusable templates for common procedure types' },
  { icon: '⚠️', title: 'No-Show Tracking', description: 'Flag and track patients who miss appointments' },
  { icon: '🔄', title: 'Follow-Up Scheduling', description: 'Auto-suggest follow-up visits after completed care' },
  { icon: '👨‍⚕️', title: 'Multi-Dentist Calendars', description: "See every dentist's schedule side by side" },
  { icon: '🚨', title: 'Emergency Contact Tracking', description: 'Emergency contacts on file for every patient' },
];

const steps = [
  { number: 1, title: 'Book Procedure', description: 'Front desk books a crown procedure for a returning patient' },
  { number: 2, title: 'Assign Dentist', description: "Selects Dr. Ahmed's calendar for next Tuesday" },
  { number: 3, title: 'Add Note', description: 'Adds a pre-appointment note for the clinical team' },
  { number: 4, title: 'Auto-Queued', description: "Patient appears automatically in Tuesday's queue" },
];

const relatedFeatures = [
  { icon: '📋', title: 'Queue Management', description: 'Booked patients flow straight into the live queue', href: '/product/features/queue-management' },
  { icon: '📁', title: 'Patient Management', description: 'Appointments link directly to the patient record', href: '/product/features/patient-management' },
  { icon: '👥', title: 'Staff Management', description: "Calendars respect each dentist's role and access", href: '/product/features/staff-management' },
];

export default function AppointmentManagementPage() {
  return (
    <main className="min-h-screen bg-white">
      <FeatureHero
        breadcrumb={[
          { label: 'Product', href: '/product' },
          { label: 'Features', href: '/product/features' },
          { label: 'Appointment Management' },
        ]}
        activeTab="/product/features/appointment-management"
        title="Fill Your Schedule Without the Back-and-Forth"
        description="Book, reschedule, and track appointments across every dentist and clinic from a single calendar view."
        screenshotLabel="Appointment Management screenshot"
      />
      <AlternatingSection sections={sections} />
      <CapabilityGrid heading="What Appointment Management Lets You Do" items={capabilities} />
      <WorkflowSteps steps={steps} />
      <WorksBestWithGrid items={relatedFeatures} />
      <SectionCTA title="See Appointment Management in Your Clinic" />
      <FeatureNav />
    </main>
  );
}
