import Hero from '../components/Hero';
import RegistrationForm from '../components/RegistrationForm';

export default function Registration() {
  return (
    <div className="min-h-screen bg-[#090909]">
      <Hero />
      <div className="max-w-4xl mx-auto px-4 pb-24 relative z-10" id="register-section">
        <RegistrationForm />
      </div>
    </div>
  );
}
